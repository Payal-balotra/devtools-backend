// db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool });

export async function testConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Successfully connected to PostgreSQL!");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}