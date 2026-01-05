import { Router } from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  parseVoiceTranscript,
  getAnalytics,
  getAIInsights,
} from "../controllers/expenseController";
import { authenticate } from "../middleware/auth";
import { requirePremium } from "../middleware/requirePremium";
import { uploadSingleReceipt } from "../middleware/upload";
import {
  validate,
  CreateExpenseSchema,
  UpdateExpenseSchema,
  VoiceTranscriptSchema,
} from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.post("/", validate(CreateExpenseSchema), createExpense);
router.put("/:id", validate(UpdateExpenseSchema), updateExpense);
router.delete("/:id", deleteExpense);

router.post("/upload-receipt", uploadSingleReceipt, uploadReceipt);
router.post(
  "/parse-voice",
  validate(VoiceTranscriptSchema),
  parseVoiceTranscript
);

router.get("/analytics/summary", getAnalytics);
router.get("/ai-insights", requirePremium, getAIInsights);

export default router;
