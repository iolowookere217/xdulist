import { Router } from "express";
import {
  getSubscription,
  updateSubscription,
  upgradeToPremium,
  downgradeToFree,
} from "../controllers/subscriptionController";
import { authenticate } from "../middleware/auth";
import { validate, UpdateSubscriptionSchema } from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.get("/", getSubscription);
router.put("/", validate(UpdateSubscriptionSchema), updateSubscription);
router.post("/upgrade", upgradeToPremium);
router.post("/downgrade", downgradeToFree);

export default router;
