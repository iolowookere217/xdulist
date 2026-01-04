import { Request } from 'express';

// Extended Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tier: 'free' | 'premium';
  };
}

// Receipt OCR Data
export interface ReceiptData {
  vendorName?: string;
  totalAmount?: number;
  date?: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
  category?: string;
  currency?: string;
}

// AI Insight Types
export type InsightType = 'pattern' | 'recommendation' | 'alert';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
}

// Spending Totals
export interface SpendingTotals {
  today: number;
  week: number;
  month: number;
}

// Category Breakdown
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

// Monthly Trend
export interface MonthlyTrend {
  month: string; // YYYY-MM format
  amount: number;
}

// Unusual Expense
export interface UnusualExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  reason: string; // Why it's unusual
}

// Parsed Voice Expense
export interface ParsedExpense {
  description?: string;
  amount?: number;
  category?: string;
}

// Weekly Summary Stats
export interface WeeklySummary {
  totalSpent: number;
  transactionCount: number;
  topCategory: string;
  weeklyChange: number; // percentage change from previous week
}
