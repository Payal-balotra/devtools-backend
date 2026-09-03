import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { getSubscriptionByUserId, createSubscription, updateSubscriptionByStripeId, cancelSubscriptionByStripeId, } from "../services/subscription.services";

// Create Stripe Checkout Session

type Plan = "basic" | "pro";


export const createCheckoutSession = async (
    req: Request,
    res: Response
) => {
    try {
        const PRICE_IDS = {
            basic: process.env.STRIPE_BASIC_PRICE_ID!,
            pro: process.env.STRIPE_PRO_PRICE_ID!,
        };

        const userId = req.user?.id;
        const userEmail = req.user?.email;
        const { plan } = req.body as { plan: Plan };

        if (plan !== "basic" && plan !== "pro") {
            return res.status(400).json({
                message: "Invalid plan",
            });
        }


        console.log(plan)
        const priceId = PRICE_IDS[plan];
        if (!userId || !userEmail) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (plan !== "basic" && plan !== "pro") {
            return res.status(400).json({
                message: "Invalid plan",
            });
        }


        const session = await stripe.checkout.sessions.create({
            mode: "subscription",

            customer_email: userEmail,

            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],

            success_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,

            // Metadata on Checkout Session
            metadata: {
                userId: String(userId),
                plan,
            },

            // Metadata on Stripe Subscription
            subscription_data: {
                metadata: {
                    userId: String(userId),
                    plan,
                },
            },
        });

        return res.status(200).json({
            message: "Checkout session created",
            url: session.url,
        });
    } catch (error) {
        console.error("CREATE CHECKOUT ERROR:", error);

        return res.status(500).json({
            message: "Failed to create checkout session",
        });
    }
};

export const getSubscription = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const subscription = await getSubscriptionByUserId(userId);

        return res.status(200).json({
            message: "Subscription fetched",
            subscription: subscription || null,
        });
    } catch (error) {
        console.error("GET SUBSCRIPTION ERROR:", error);

        return res.status(500).json({
            message: "Failed to get subscription",
        });
    }
};


export const cancelSubscription = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        return res.status(200).json({
            message: "Subscription cancelled",
        });
    } catch (error) {
        console.error("CANCEL SUBSCRIPTION ERROR:", error);

        return res.status(500).json({
            message: "Failed to cancel subscription",
        });
    }
};
export const createPortalSession = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user.id;

        // Get user's subscription from DB
        const subscription = await getSubscriptionByUserId(userId);

        if (!subscription) {
            return res.status(404).json({
                message: "No subscription found",
            });
        }

        const session =
            await stripe.billingPortal.sessions.create({
                customer: subscription.stripeCustomerId,
                return_url: "http://localhost:3000/dashboard",
            });

        return res.status(200).json({
            url: session.url,
        });
    } catch (error) {
        console.error("Portal session error:", error);

        return res.status(500).json({
            message: "Failed to create billing portal session",
        });
    }
};

// Stripe Webhook
export const stripeWebhook = async (
    req: Request,
    res: Response
) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
        return res.status(400).json({
            message: "Missing Stripe signature",
        });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        console.error(
            "WEBHOOK SIGNATURE ERROR:",
            error
        );

        return res.status(400).json({
            message: "Invalid Stripe webhook signature",
        });
    }

    try {
        switch (event.type) {
            // ----------------------------------
            // CHECKOUT COMPLETED
            // ----------------------------------
            case "checkout.session.completed": {
                const session =
                    event.data.object as Stripe.Checkout.Session;

                const userId = session.metadata?.userId;

                const subscriptionId =
                    session.subscription?.toString();

                const customerId =
                    session.customer?.toString();

                if (
                    !userId ||
                    !subscriptionId ||
                    !customerId
                ) {
                    console.error(
                        "Missing subscription information",
                        {
                            userId,
                            subscriptionId,
                            customerId,
                        }
                    );

                    break;
                }

                console.log(
                    "Payment completed"
                );

                console.log(
                    "User ID:",
                    userId
                );

                console.log(
                    "Customer ID:",
                    customerId
                );

                console.log(
                    "Subscription ID:",
                    subscriptionId
                );

                // Get complete subscription information
                const subscription =
                    await stripe.subscriptions.retrieve(
                        subscriptionId
                    );


                const subscriptionItem = subscription.items.data[0];
                if (!subscriptionItem) {
                    throw new Error("Subscription item not found");
                }

                const priceId = subscriptionItem.price.id;
                if (!priceId) {
                    throw new Error(
                        "Subscription price ID not found"
                    );
                }

                const currentPeriodStart = subscriptionItem.current_period_start;
                const currentPeriodEnd = subscriptionItem.current_period_end;


                if (!currentPeriodStart || !currentPeriodEnd) {
                    throw new Error("Subscription period dates not found");
                }
                await createSubscription({
                    userId: Number(userId),

                    stripeCustomerId:
                        customerId,

                    stripeSubscriptionId:
                        subscription.id,

                    status:
                        subscription.status,

                    priceId,
                    currentPeriodStart: new Date(currentPeriodStart * 1000),
                    currentPeriodEnd: new Date(currentPeriodEnd * 1000),
                });

                console.log(
                    "Subscription saved to database"
                );

                break;
            }

            // ----------------------------------
            // SUBSCRIPTION UPDATED
            // ----------------------------------
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                const subscriptionItem = subscription.items.data[0];

                if (!subscriptionItem) {
                    throw new Error("Subscription item not found");
                }

                const priceId = subscriptionItem.price.id;

                const currentPeriodStart = subscriptionItem.current_period_start;
                const currentPeriodEnd = subscriptionItem.current_period_end;

                if (!currentPeriodStart || !currentPeriodEnd) {
                    throw new Error("Subscription period dates not found");
                }

                await updateSubscriptionByStripeId(subscription.id, {
                    status: subscription.status,
                    priceId,
                    currentPeriodStart: new Date(currentPeriodStart * 1000),
                    currentPeriodEnd: new Date(currentPeriodEnd * 1000),
                });

                console.log("Subscription updated:", subscription.id);

                break;
            }

            // ----------------------------------
            // SUBSCRIPTION DELETED
            // ----------------------------------
            case "customer.subscription.deleted": {
                const subscription =
                    event.data.object as Stripe.Subscription;

                await cancelSubscriptionByStripeId(
                    subscription.id
                );

                console.log(
                    "Subscription cancelled:",
                    subscription.id
                );

                break;
            }

            // ----------------------------------
            // OTHER EVENTS
            // ----------------------------------
            default: {
                console.log(
                    `Unhandled Stripe event: ${event.type}`
                );
            }
        }

        return res.status(200).json({
            received: true,
        });
    } catch (error) {
        console.error(
            "WEBHOOK ERROR:",
            error
        );

        return res.status(500).json({
            message: "Webhook processing failed",
        });
    }
};