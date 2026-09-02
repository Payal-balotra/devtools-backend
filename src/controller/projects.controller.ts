import { Request, Response } from "express";
import { allProjects, createProject, deleteProjectById, findProjectById } from "../services/projects.services";

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

  export const create = async (   
  req: Request, res: Response) => {
      const { name, description } = req.body;
      if(!name || !description){
          return res.status(400).json({ message: "Name and description are required" });
      }
      if(!req.user || !req.user.id){
          return res.status(401).json({ message: "Unauthorized" });
      }
      const project = await createProject(name, description, req.user.id);
      if(!project){
          return res.status(500).json({ message: "Project could not be created" });
      }

      return res.status(201).json({ message: "Project created successfully", project });
  }

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
     const projectId = Number(id);
    if(!id){
        return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await findProjectById(projectId);
    if(!project){
        return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ project });

}

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    if(!id){
        return res.status(400).json({ message: "Project ID is required" });
    }
    const projectId = Number(id);
    const project = await findProjectById(projectId);
    if(!project){
        return res.status(404).json({ message: "Project not found" });
    }
    await deleteProjectById(projectId);
    return res.status(200).json({ message: "Project deleted successfully" });
}