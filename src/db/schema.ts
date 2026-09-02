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
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});