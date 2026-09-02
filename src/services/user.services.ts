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
export const findUserById = async (id: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
};

export const createUser = async (name: string, email: string, password: string) => {
    const [user] = await db
    .insert(users) 
    .values({ name, email, password })
    .returning();

  return user;
}




