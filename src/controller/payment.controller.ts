import { Request, Response } from "express";
import Stripe from "stripe";
import {
  createPaymentIntent,
  retrievePaymentIntent,
  findPromotionCode,
  createRefund,
  createInvoiceForPayment,
  getInvoice,
  getPaymentById,
  getPaymentsByUserId,
} from "../services/payment.service";
import { getSubscriptionByUserId } from "../services/subscription.services";

export const createPaymentIntentController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId || !userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount, currency, description, promotionCode, stripeCouponId } =
      req.body as {
        amount: number;
        currency?: string;
        description?: string;
        promotionCode?: string;
        stripeCouponId?: string;
      };

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount is required" });
    }

    let resolvedCouponId = stripeCouponId;
    let resolvedCode = promotionCode;

    if (resolvedCode && !resolvedCouponId) {
      const promo = await findPromotionCode(resolvedCode);
      if (!promo) {
        return res
          .status(400)
          .json({ message: "Invalid promotion code" });
      }
      resolvedCouponId = (promo.coupon as { id?: string } | string) as string;
    }

    const existingSub = await getSubscriptionByUserId(userId);

    const intent = await createPaymentIntent({
      userId,
      userEmail,
      existingCustomerId: existingSub?.stripeCustomerId ?? null,
      amount,
      currency,
      description,
      promotionCode: resolvedCode,
      stripeCouponId: resolvedCouponId,
    });

    return res.status(200).json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (error) {
    console.error("CREATE PAYMENT INTENT ERROR:", error);
    return res
      .status(500)
      .json({ message: "Failed to create payment intent" });
  }
};

export const getPaymentStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { paymentIntentId } = req.body as { paymentIntentId: string };
    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    const [local, remote] = await Promise.all([
      (async () => {
        const all = await getPaymentsByUserId(userId);
        return all.find((p) => p.stripePaymentIntentId === paymentIntentId) ?? null;
      })(),
      retrievePaymentIntent(paymentIntentId),
    ]);

    return res.status(200).json({
      status: remote.status,
      local,
      remote,
    });
  } catch (error) {
    console.error("GET PAYMENT STATUS ERROR:", error);
    return res.status(500).json({ message: "Failed to get payment" });
  }
};

export const refundPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { paymentIntentId, amount, reason } = req.body as {
      paymentIntentId: string;
      amount?: number;
      reason?: Stripe.RefundCreateParams.Reason;
    };

    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    const refund = await createRefund({
      paymentIntentId,
      amount,
      reason,
    });

    return res.status(200).json({ message: "Refund created", refund });
  } catch (error) {
    console.error("REFUND ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to refund payment";
    return res.status(400).json({ message });
  }
};

export const createInvoiceController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId || !userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount, description } = req.body as {
      amount: number;
      description?: string;
    };
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount is required" });
    }

    const invoice = await createInvoiceForPayment({
      userId,
      userEmail,
      amount,
      description,
    });

    return res.status(200).json({
      message: "Invoice created",
      invoiceId: invoice.id,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    });
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    return res.status(500).json({ message: "Failed to create invoice" });
  }
};

export const getInvoiceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      return res.status(400).json({ message: "invoiceId is required" });
    }
    const invoice = await getInvoice(invoiceId);
    return res.status(200).json({ invoice });
  } catch (error) {
    console.error("GET INVOICE ERROR:", error);
    return res.status(500).json({ message: "Failed to get invoice" });
  }
};

export const getMyPaymentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await getPaymentsByUserId(userId);
    return res.status(200).json({ payments: list });
  } catch (error) {
    console.error("GET MY PAYMENTS ERROR:", error);
    return res.status(500).json({ message: "Failed to get payments" });
  }
};

export const getPaymentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentId = Number(req.params.id);
    if (Number.isNaN(paymentId)) {
      return res.status(400).json({ message: "Invalid payment id" });
    }
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    return res.status(200).json({ payment });
  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);
    return res.status(500).json({ message: "Failed to get payment" });
  }
};
