import { Request, Response } from "express";
import { cancelSubscriptionOnStripe, changeSubscriptionPlan, getAllSubscriptions ,getSubscriptionById} from "../../services/stripe/subscription.service";

export const adminGetSubscriptions = async (
  req: Request,
  res: Response
) => {
  try {
    const subscriptions = await getAllSubscriptions();

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (error) {
    console.error("ADMIN GET SUBSCRIPTIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get subscriptions",
    });
  }
};


export const adminGetSubscriptionById = async (
  req: Request,
  res: Response
) => {
  try {
    const subscriptionId = Number(req.params.id);

    if (Number.isNaN(subscriptionId)) {
      return res.status(400).json({
        message: "Invalid subscription ID",
      });
    }

    const subscription =
      await getSubscriptionById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      message: "Subscription fetched successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "ADMIN GET SUBSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to get subscription",
    });
  }
};


export const adminChangeSubscriptionPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const subscriptionId = Number(req.params.id);
    const { priceId } = req.body;
    
    if (Number.isNaN(subscriptionId)) {
      return res.status(400).json({
        message: "Invalid subscription ID",
      });
    }
    

    if (!priceId) {
      return res.status(400).json({
        message: "priceId is required",
      });
    }

    // Get subscription from your database
    const subscription =
      await getSubscriptionById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    // Update subscription in Stripe
    const updatedSubscription =
      await changeSubscriptionPlan(
        subscription.stripeSubscriptionId,
        priceId
      );

    return res.status(200).json({
      message: "Subscription plan updated successfully",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error(
      "ADMIN CHANGE SUBSCRIPTION PLAN ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to change subscription plan",
    });
  }
};


export const adminCancelSubscription = async (
  req: Request,
  res: Response
) => {
  try {
    const subscriptionId = Number(req.params.id);

    if (Number.isNaN(subscriptionId)) {
      return res.status(400).json({
        message: "Invalid subscription ID",
      });
    }

    const subscription =
      await getSubscriptionById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    const cancelledSubscription =
      await cancelSubscriptionOnStripe(
        subscription.stripeSubscriptionId
      );

    return res.status(200).json({
      message: "Subscription cancelled successfully",
      subscription: cancelledSubscription,
    });
  } catch (error) {
    console.error(
      "ADMIN CANCEL SUBSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel subscription",
    });
  }
};