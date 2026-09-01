import {
  pgTable,
  serial,
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
  id: serial("id").primaryKey(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
  description: varchar("description", {
    length: 255,
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  userId: serial("user_id") 

    .notNull()
    .references(() => users.id),
});