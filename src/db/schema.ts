import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  password: varchar("password", {
    length: 255,
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
  description: varchar("description", {
    length: 255,
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  userId: integer("user_id") 

    .notNull()
    .references(() => users.id),
});


export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  stripeCustomerId: varchar("stripe_customer_id", {
    length: 255,
  }).notNull(),

  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 255,
  }).notNull()
    .unique(),

  status: varchar("status", {
    length: 50,
  }).notNull(),

  priceId: varchar("price_id", {
    length: 255,
  }).notNull(),

  currentPeriodStart: timestamp("current_period_start")
    .notNull(),

  currentPeriodEnd: timestamp("current_period_end")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

// One-time payments created via Payment Intents + Payment Element.
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  stripeCustomerId: varchar("stripe_customer_id", {
    length: 255,
  }),

  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  })
    .notNull()
    .unique(),

  amount: integer("amount").notNull(),         // in cents
  amountRefunded: integer("amount_refunded")
    .notNull()
    .default(0),

  currency: varchar("currency", { length: 10 })
    .notNull()
    .default("usd"),

  status: varchar("status", { length: 50 })
    .notNull(),

  description: varchar("description", { length: 500 }),

  // invoice / receipt
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  receiptUrl: varchar("receipt_url", { length: 500 }),

  // failure tracking
  failureMessage: varchar("failure_message", { length: 500 }),

  // applied discount
  stripeCouponId: varchar("stripe_coupon_id", { length: 255 }),
  promotionCode: varchar("promotion_code", { length: 100 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const refunds = pgTable("refunds", {
  id: serial("id").primaryKey(),

  paymentId: integer("payment_id")
    .notNull()
    .references(() => payments.id),

  stripeRefundId: varchar("stripe_refund_id", {
    length: 255,
  })
    .notNull()
    .unique(),

  amount: integer("amount").notNull(),         // in cents
  reason: varchar("reason", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
