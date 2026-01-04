import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  parseVoiceTranscript,
  getAnalytics,
  getAIInsights
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { requirePremium } from '../middleware/requirePremium';
import { uploadSingleReceipt } from '../middleware/upload';
import {
  validate,
  CreateExpenseSchema,
  UpdateExpenseSchema,
  VoiceTranscriptSchema
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense CRUD
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', validate(CreateExpenseSchema), createExpense);
router.put('/:id', validate(UpdateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

// Receipt upload (freemium: 5/month, premium: unlimited)
router.post('/upload-receipt', uploadSingleReceipt, uploadReceipt);

// Voice parsing
router.post('/parse-voice', validate(VoiceTranscriptSchema), parseVoiceTranscript);

// Analytics
router.get('/analytics/summary', getAnalytics);

// AI Insights (Premium only)
router.get('/ai-insights', requirePremium, getAIInsights);

export default router;
