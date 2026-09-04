import { Router } from "express";
import {
  refundPaymentController,
  getPaymentByIdController,
} from "../../controller/payment.controller";
import { getAllPayments } from "../../services/payment.service";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const payments = await getAllPayments();
    return res.status(200).json({ payments });
  } catch (error) {
    console.error("ADMIN GET PAYMENTS ERROR:", error);
    return res.status(500).json({ message: "Failed to get payments" });
  }
});

router.get("/:id", getPaymentByIdController);
router.post("/refund", refundPaymentController);

export default router;
