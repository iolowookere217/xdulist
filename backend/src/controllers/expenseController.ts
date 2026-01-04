import { Response, NextFunction } from 'express';
import { Expense } from '../models/Expense';
import { UserSubscription } from '../models/UserSubscription';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

/**
 * Get all expenses for current user
 * GET /api/expenses?page=1&limit=50&category=groceries&sort=-date
 */
export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const {
      page = '1',
      limit = '50',
      category,
      currency,
      sort = '-date',
      search
    } = req.query;

    const query: any = { userId };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by currency
    if (currency) {
      query.currency = currency;
    }

    // Search in description and merchant
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single expense
 * GET /api/expenses/:id
 */
export const getExpenseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    res.status(200).json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create expense
 * POST /api/expenses
 */
export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const expenseData = {
      ...req.body,
      userId,
      date: req.body.date || new Date()
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    Object.assign(expense, req.body);
    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and process receipt
 * POST /api/expenses/upload-receipt
 */
export const uploadReceipt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Get user subscription
    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Check receipt scan limit (free: 5/month, premium: unlimited)
    if (subscription.tier === 'free' && subscription.receiptsScannedThisMonth >= 5) {
      throw new ForbiddenError('Monthly receipt scan limit reached. Upgrade to Premium for unlimited scans!');
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new ValidationError('No receipt file uploaded');
    }

    // Upload to Cloudinary (will be handled by CloudinaryService)
    const CloudinaryService = require('../services/CloudinaryService').default;
    const receiptUrl = await CloudinaryService.uploadReceipt(req.file, userId);

    // Extract data using Gemini AI (will be handled by GeminiAIService)
    const GeminiAIService = require('../services/GeminiAIService').default;
    const extractedData = await GeminiAIService.extractReceiptData(req.file.buffer);

    // Increment receipt counter
    subscription.receiptsScannedThisMonth += 1;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Receipt processed successfully',
      data: {
        receiptUrl,
        extracted: extractedData,
        scansRemaining: subscription.tier === 'premium' ? 'unlimited' : 5 - subscription.receiptsScannedThisMonth
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Parse voice transcript to expense data
 * POST /api/expenses/parse-voice
 */
export const parseVoiceTranscript = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transcript } = req.body;

    const GeminiAIService = require('../services/GeminiAIService').default;
    const parsedData = await GeminiAIService.parseVoiceTranscript(transcript);

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense analytics
 * GET /api/expenses/analytics
 */
export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const AnalyticsService = require('../services/AnalyticsService').default;

    const [totals, categoryBreakdown, trends] = await Promise.all([
      AnalyticsService.getSpendingTotals(userId),
      AnalyticsService.getCategoryBreakdown(userId, 'month'),
      AnalyticsService.getMonthlyTrends(userId)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals,
        categoryBreakdown,
        trends
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI insights (Premium only)
 * GET /api/expenses/ai-insights
 */
export const getAIInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Requires premium (checked by requirePremium middleware)
    const expenses = await Expense.find({ userId }).sort('-date').limit(100);

    if (expenses.length < 5) {
      return res.status(200).json({
        success: true,
        message: 'Not enough data for insights. Add at least 5 expenses.',
        data: { insights: [] }
      });
    }

    const GeminiAIService = require('../services/GeminiAIService').default;
    const insights = await GeminiAIService.generateInsights(expenses);

    res.status(200).json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    next(error);
  }
};
