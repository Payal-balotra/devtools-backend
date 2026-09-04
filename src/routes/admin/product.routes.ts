import { Router } from "express";
import { createProductController } from "../../controller/admin/product.controller";

const router = Router();

router.post("/create", createProductController);

export default router;