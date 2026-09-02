import express from "express";
import { create, getAllProjects, getProjectById } from "../controller/projects.controller";


const router = express.Router();

router.get("/getAll", getAllProjects);
router.post("/create", create);
router.get("/getById/:id", getProjectById);

export default router;