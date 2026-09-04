import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "../db/db";
import { payments, refunds } from "../db/schema";
import { stripe } from "../lib/stripe";

const getOrCreateCustomer = async (params: {
  userId: number;
  email: string;
  existingCustomerId?: string | null;
}) => {
  if (params.existingCustomerId) return params.existingCustomerId;
  const customer = await stripe.customers.create({
    email: params.email,
    metadata: { userId: String(params.userId) },
  });
  return customer.id;
};

export const createPaymentIntent = async (params: {
  userId: number;
  userEmail: string;
  existingCustomerId?: string | null;
  amount: number;
  currency?: string;
  description?: string;
  promotionCode?: string;
  stripeCouponId?: string;
}) => {
  const customerId = await getOrCreateCustomer({
    userId: params.userId,
    email: params.userEmail,
    existingCustomerId: params.existingCustomerId,
  });

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: params.amount,
    currency: params.currency ?? "usd",
    customer: customerId,
    description: params.description,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: String(params.userId) },
  };

  if (params.promotionCode) {
    intentParams.discounts = [{ promotion_code: params.promotionCode }];
  } else if (params.stripeCouponId) {
    intentParams.discounts = [{ coupon: params.stripeCouponId }];
  }

  const intent = await stripe.paymentIntents.create(intentParams);

  await db.insert(payments).values({
    userId: params.userId,
    stripeCustomerId: customerId,
    stripePaymentIntentId: intent.id,
    amount: params.amount,
    currency: intent.currency,
    status: intent.status,
    description: params.description ?? null,
    stripeCouponId: params.stripeCouponId ?? null,
    promotionCode: params.promotionCode ?? null,
  });

  return intent;
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export const findPromotionCode = async (code: string) => {
  const list = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 1,
  });
  return list.data[0] ?? null;
};

export const createRefund = async (params: {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}) => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, params.paymentIntentId))
    .limit(1);

  if (!payment) throw new Error("Payment not found");

  const remaining = payment.amount - payment.amountRefunded;
  if (remaining <= 0) throw new Error("Payment already fully refunded");

  const refundAmount = params.amount ?? remaining;
  if (refundAmount <= 0 || refundAmount > remaining) {
    throw new Error("Invalid refund amount");
  }

  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: refundAmount,
    reason: params.reason,
  });

  await db.insert(refunds).values({
    paymentId: payment.id,
    stripeRefundId: refund.id,
    amount: refund.amount ?? refundAmount,
    reason: refund.reason ?? params.reason ?? null,
    status: refund.status ?? "pending",
  });

  const newRefunded = payment.amountRefunded + refundAmount;
  await db
    .update(payments)
    .set({
      amountRefunded: newRefunded,
      status: newRefunded >= payment.amount ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  return refund;
};

export const createInvoiceForPayment = async (params: {
  userId: number;
  userEmail: string;
  amount: number;
  description?: string;
}) => {
  const customerId = await getOrCreateCustomer({
    userId: params.userId,
    email: params.userEmail,
  });

  await stripe.invoiceItems.create({
    customer: customerId,
    amount: params.amount,
    currency: "usd",
    description: params.description,
  });

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: 30,
  });

  await stripe.invoices.finalizeInvoice(invoice.id!);

  const finalized = await stripe.invoices.retrieve(invoice.id!);

  await db.insert(payments).values({
    userId: params.userId,
    stripeCustomerId: customerId,
    stripePaymentIntentId: `invoice_${finalized.id}`,
    amount: params.amount,
    currency: finalized.currency,
    status: finalized.status ?? "open",
    description: params.description ?? null,
    stripeInvoiceId: finalized.id,
  });

  return finalized;
};

export const getInvoice = async (invoiceId: string) => {
  return await stripe.invoices.retrieve(invoiceId);
};

export const getPaymentById = async (paymentId: number) => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  return payment ?? null;
};

export const getPaymentsByUserId = async (userId: number) => {
  return await db.select().from(payments).where(eq(payments.userId, userId));
};

export const getAllPayments = async () => {
  return await db.select().from(payments);
};

export const syncPaymentFromIntent = async (intent: Stripe.PaymentIntent) => {
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, intent.id))
    .limit(1);

  let receiptUrl: string | null = existing?.receiptUrl ?? null;
  const charge = intent.latest_charge as string | Stripe.Charge | null;
  if (typeof charge === "string" && charge) {
    const c = await stripe.charges.retrieve(charge);
    receiptUrl = c.receipt_url ?? receiptUrl;
  } else if (charge && typeof charge === "object") {
    receiptUrl = charge.receipt_url ?? receiptUrl;
  }

  const data = {
    status: intent.status,
    receiptUrl,
    failureMessage: intent.last_payment_error?.message ?? null,
    amount: intent.amount,
    currency: intent.currency,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(payments)
      .set(data)
      .where(eq(payments.stripePaymentIntentId, intent.id));
    return;
  }

  const userId = Number(intent.metadata?.userId ?? 0);
  if (userId > 0) {
    await db.insert(payments).values({
      userId,
      stripeCustomerId:
        typeof intent.customer === "string"
          ? intent.customer
          : intent.customer?.id ?? null,
      stripePaymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      receiptUrl: data.receiptUrl,
      failureMessage: data.failureMessage,
    });
  }
};

export const syncRefundFromStripe = async (refund: Stripe.Refund) => {
  const pi =
    typeof refund.payment_intent === "string"
      ? refund.payment_intent
      : refund.payment_intent?.id;
  if (!pi) return;

  const [refundRow] = await db
    .select()
    .from(refunds)
    .where(eq(refunds.stripeRefundId, refund.id))
    .limit(1);
  if (refundRow) {
    await db
      .update(refunds)
      .set({ status: refund.status ?? refundRow.status })
      .where(eq(refunds.id, refundRow.id));
  }

  const intent = await stripe.paymentIntents.retrieve(pi);
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, pi))
    .limit(1);
  if (!payment) return;

  const refunded = intent.amount_received
    ? payment.amount - intent.amount_received
    : payment.amountRefunded;

  await db
    .update(payments)
    .set({
      amountRefunded: refunded,
      status:
        refunded <= 0
          ? payment.status
          : refunded >= payment.amount
            ? "refunded"
            : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));
};
