import { Router } from "express";
import { createPriceController } from "../../controller/admin/price.controller";

const router = Router();

router.post("/create", createPriceController);
    

export default router;