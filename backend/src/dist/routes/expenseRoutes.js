"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const auth_1 = require("../middleware/auth");
const requirePremium_1 = require("../middleware/requirePremium");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Expense CRUD
router.get('/', expenseController_1.getExpenses);
router.get('/:id', expenseController_1.getExpenseById);
router.post('/', (0, validation_1.validate)(validation_1.CreateExpenseSchema), expenseController_1.createExpense);
router.put('/:id', (0, validation_1.validate)(validation_1.UpdateExpenseSchema), expenseController_1.updateExpense);
router.delete('/:id', expenseController_1.deleteExpense);
// Receipt upload (freemium: 5/month, premium: unlimited)
router.post('/upload-receipt', upload_1.uploadSingleReceipt, expenseController_1.uploadReceipt);
// Voice parsing
router.post('/parse-voice', (0, validation_1.validate)(validation_1.VoiceTranscriptSchema), expenseController_1.parseVoiceTranscript);
// Analytics
router.get('/analytics/summary', expenseController_1.getAnalytics);
// AI Insights (Premium only)
router.get('/ai-insights', requirePremium_1.requirePremium, expenseController_1.getAIInsights);
exports.default = router;
//# sourceMappingURL=expenseRoutes.js.map