import { Router } from "express";
import { adminCancelSubscription, adminChangeSubscriptionPlan, adminGetSubscriptionById, adminGetSubscriptions } from "../../controller/admin/subscription.controller";

const router = Router();

router.get("/", adminGetSubscriptions);
router.get("/:id", adminGetSubscriptionById );
router.post("/:id/change-plan",adminChangeSubscriptionPlan);
router.post("/:id/cancel",adminCancelSubscription);

export default router;