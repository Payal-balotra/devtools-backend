import express from "express";

import {
    getSubscription,
    createCheckoutSession,
    cancelSubscription,
    stripeWebhook,
    createPortalSession,
} from "../controller/subscription.controller";

import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
    "/getSubscription",
    verifyToken,
    getSubscription
);

router.post(
    "/createCheckoutSession",
    verifyToken,
    createCheckoutSession
);

router.post(
    "/createPortalSession",
    verifyToken,
    createPortalSession
);



export default router;