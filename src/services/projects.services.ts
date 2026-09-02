import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { projects } from "../db/schema";

export const allProjects = async () => {
  return await db.select().from(projects);
};

export const createProject = async (name: string, description: string) => {
  const [project] = await db
    .insert(projects)
    .values({ name, description })
    .returning();   

  return project;
}

export const findProjectById = async (id: number) => {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);  


    return project;
}   