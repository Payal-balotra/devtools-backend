import { Router } from "express";
import {
  createProductController,
  adminGetProducts,
} from "../../controller/admin/product.controller";

const router = Router();

router.get("/", adminGetProducts);
router.post("/create", createProductController);

export default router;