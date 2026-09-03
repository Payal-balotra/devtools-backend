import express from "express";
import { create, deleteProject, getAllProjects, getProjectById } from "../controller/projects.controller";
import { verifyToken } from "../middlewares/auth.middleware";


const router = express.Router();

router.get("/getAll", verifyToken, getAllProjects);
router.post("/create", verifyToken, create);
router.get("/getById/:id", verifyToken, getProjectById);
router.delete("/delete/:id", verifyToken, deleteProject);

export default router;