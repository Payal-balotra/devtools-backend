    import { eq } from "drizzle-orm";

    import { db } from "../db/db";
    import { subscriptions } from "../db/schema";

    export const getSubscriptionByUserId = async (
    userId: number
    ) => {
    const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

    return subscription;
    };
    export const createSubscription = async ({
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    status,
    priceId,
    currentPeriodStart,
    currentPeriodEnd,
    }: {
    userId: number;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: string;
    priceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    }) => {
    const [subscription] = await db
        .insert(subscriptions)
        .values({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        status,
        priceId,
        currentPeriodStart,
        currentPeriodEnd,
        })
        .returning();

    return subscription;
    };

    export const updateSubscriptionByStripeId = async (
    stripeSubscriptionId: string,
    data: {
        status: string;
        priceId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
    }
    ) => {
    const [subscription] = await db
        .update(subscriptions)
        .set({
        status: data.status,
        priceId: data.priceId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        updatedAt: new Date(),
        })
        .where(
        eq(
            subscriptions.stripeSubscriptionId,
            stripeSubscriptionId
        )
        )
        .returning();

    return subscription;
    };

    export const cancelSubscriptionByStripeId = async (
    stripeSubscriptionId: string
    ) => {
    const [subscription] = await db
        .update(subscriptions)
        .set({
        status: "canceled",   
        updatedAt: new Date(),
        })
        .where(
        eq(
            subscriptions.stripeSubscriptionId,
            stripeSubscriptionId
        )
        )
        .returning();

    return subscription;
    };