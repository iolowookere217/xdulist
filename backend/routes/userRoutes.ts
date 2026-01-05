import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import {
  validate,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", validate(UpdateProfileSchema), updateProfile);
router.put("/password", validate(ChangePasswordSchema), changePassword);

export default router;
