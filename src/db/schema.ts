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
