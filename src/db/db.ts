// db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool });
async function runMigrations() {
  console.log("⏳ Running migrations...");
  try {
    // Looks inside your generated 'drizzle' folder
    await migrate(db, { migrationsFolder: "./drizzle" }); 
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigrations();
export async function testConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Successfully connected to PostgreSQL!");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}