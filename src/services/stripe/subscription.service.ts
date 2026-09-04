import { db } from "../../db/db";
import { subscriptions, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "../../lib/stripe";

export const getAllSubscriptions = async () => {
  return await db
    .select({
      subscriptionId: subscriptions.id,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      stripeCustomerId: subscriptions.stripeCustomerId,

      userId: users.id,
      userName: users.name,
      userEmail: users.email,

      status: subscriptions.status,
      priceId: subscriptions.priceId,

      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,

      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
    })
    .from(subscriptions)
    .innerJoin(
      users,
      eq(subscriptions.userId, users.id)
    );
};


export const getSubscriptionById = async (
  subscriptionId: number
) => {
  const result = await db
    .select({
      subscriptionId: subscriptions.id,

      stripeSubscriptionId:
        subscriptions.stripeSubscriptionId,

      stripeCustomerId:
        subscriptions.stripeCustomerId,

      status: subscriptions.status,

      priceId: subscriptions.priceId,

      currentPeriodStart:
        subscriptions.currentPeriodStart,

      currentPeriodEnd:
        subscriptions.currentPeriodEnd,

      subscriptionCreatedAt:
        subscriptions.createdAt,

      subscriptionUpdatedAt:
        subscriptions.updatedAt,

      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userCreatedAt: users.createdAt,
    })
    .from(subscriptions)
    .innerJoin(
      users,
      eq(subscriptions.userId, users.id)
    )
    .where(eq(subscriptions.id, subscriptionId));

  return result[0] ?? null;
};

export const changeSubscriptionPlan = async (
  stripeSubscriptionId: string,
  newPriceId: string
) => {
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );
  
const price = await stripe.prices.retrieve(newPriceId);

if (!price.active) {
  throw new Error("Selected price is not active");
}
  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    throw new Error("Subscription item not found");
  }

  const updatedSubscription =
    await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [
        {
          id: subscriptionItem.id,
          price: newPriceId,
        },
      ],
    });

  return updatedSubscription;
};


export const cancelSubscriptionOnStripe = async (
  stripeSubscriptionId: string
) => {
  const subscription = await stripe.subscriptions.cancel(
    stripeSubscriptionId
  );

  return subscription;
};