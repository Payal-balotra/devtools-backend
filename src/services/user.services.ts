import { eq } from "drizzle-orm";
import { db } from "../db/db"
import { users } from "../db/schema";



export const findUserByEmail = async (email: string) => {
    const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}


