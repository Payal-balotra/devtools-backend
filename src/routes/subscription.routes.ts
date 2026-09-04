import express from "express";

import { getSubscription,  createCheckoutSession, createPortalSession,} from "../controller/subscription.controller";
import {
  createPaymentIntentController,
  getPaymentStatusController,
  refundPaymentController,
  createInvoiceController,
  getInvoiceController,
  getMyPaymentsController,
} from "../controller/payment.controller";

import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/getSubscription",verifyToken,getSubscription);

router.post("/createCheckoutSession",verifyToken,createCheckoutSession);

router.post("/createPortalSession",verifyToken,createPortalSession);

router.post("/payment/create-intent", verifyToken, createPaymentIntentController);
router.post("/payment/status", verifyToken, getPaymentStatusController);
router.post("/payment/refund", verifyToken, refundPaymentController);
router.post("/payment/invoice", verifyToken, createInvoiceController);
router.get("/payment/invoice/:invoiceId", verifyToken, getInvoiceController);
router.get("/payment/my-payments", verifyToken, getMyPaymentsController);

export default router;