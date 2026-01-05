import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        tier: 'free' | 'premium';
    };
}
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
export type InsightType = 'pattern' | 'recommendation' | 'alert';
export interface Insight {
    type: InsightType;
    title: string;
    description: string;
}
export interface SpendingTotals {
    today: number;
    week: number;
    month: number;
}
export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    count: number;
}
export interface MonthlyTrend {
    month: string;
    amount: number;
}
export interface UnusualExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    reason: string;
}
export interface ParsedExpense {
    description?: string;
    amount?: number;
    category?: string;
}
export interface WeeklySummary {
    totalSpent: number;
    transactionCount: number;
    topCategory: string;
    weeklyChange: number;
}
//# sourceMappingURL=index.d.ts.map