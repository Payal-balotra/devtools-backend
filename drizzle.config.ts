import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Add this block to keep everything inside the public schema
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  }
});
