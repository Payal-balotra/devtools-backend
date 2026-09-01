import { db } from "../db/db";
import { projects } from "../db/schema";

export const allProjects = async () => {
  return await db.select().from(projects);
};