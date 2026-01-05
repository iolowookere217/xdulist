import { SpendingTotals, CategoryBreakdown, MonthlyTrend, UnusualExpense } from '../types';
declare class AnalyticsService {
    /**
     * Get spending totals for today, week, and month
     */
    getSpendingTotals(userId: string): Promise<SpendingTotals>;
    /**
     * Get category breakdown with percentages
     */
    getCategoryBreakdown(userId: string, period: 'month' | 'week'): Promise<CategoryBreakdown[]>;
    /**
     * Get monthly spending trends for last 6 months
     */
    getMonthlyTrends(userId: string): Promise<MonthlyTrend[]>;
    /**
     * Detect unusual spending (expenses >2x category average)
     */
    detectUnusualSpending(userId: string): Promise<UnusualExpense[]>;
}
declare const _default: AnalyticsService;
export default _default;
//# sourceMappingURL=AnalyticsService.d.ts.map