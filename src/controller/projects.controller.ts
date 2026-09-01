import { Request, Response } from "express";
import { allProjects } from "../services/project.services";

export const getAllProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const projects = await allProjects();

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};