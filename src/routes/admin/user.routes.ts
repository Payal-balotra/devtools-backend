import { Router } from "express";
import { db } from "../../db/db";
import { users } from "../../db/schema";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return res.status(200).json({ users: list });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    return res.status(500).json({ message: "Failed to get users" });
  }
});

export default router;
