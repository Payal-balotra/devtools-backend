import { Router } from "express";
import {
  createPriceController,
  adminGetPrices,
} from "../../controller/admin/price.controller";

const router = Router();

router.get("/", adminGetPrices);
router.post("/create", createPriceController);


export default router;