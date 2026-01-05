import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Get all expenses for current user
 * GET /api/expenses?page=1&limit=50&category=groceries&sort=-date
 */
export declare const getExpenses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get single expense
 * GET /api/expenses/:id
 */
export declare const getExpenseById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create expense
 * POST /api/expenses
 */
export declare const createExpense: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update expense
 * PUT /api/expenses/:id
 */
export declare const updateExpense: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export declare const deleteExpense: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Upload and process receipt
 * POST /api/expenses/upload-receipt
 */
export declare const uploadReceipt: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Parse voice transcript to expense data
 * POST /api/expenses/parse-voice
 */
export declare const parseVoiceTranscript: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get expense analytics
 * GET /api/expenses/analytics
 */
export declare const getAnalytics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get AI insights (Premium only)
 * GET /api/expenses/ai-insights
 */
export declare const getAIInsights: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=expenseController.d.ts.map