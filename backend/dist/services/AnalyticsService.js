"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expense_1 = require("../models/Expense");
const date_fns_1 = require("date-fns");
class AnalyticsService {
    /**
     * Get spending totals for today, week, and month
     */
    async getSpendingTotals(userId) {
        const now = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const weekStart = (0, date_fns_1.startOfWeek)(now);
        const monthStart = (0, date_fns_1.startOfMonth)(now);
        const [todayExpenses, weekExpenses, monthExpenses] = await Promise.all([
            Expense_1.Expense.find({ userId, date: { $gte: todayStart } }),
            Expense_1.Expense.find({ userId, date: { $gte: weekStart } }),
            Expense_1.Expense.find({ userId, date: { $gte: monthStart } })
        ]);
        return {
            today: todayExpenses.reduce((sum, e) => sum + e.amount, 0),
            week: weekExpenses.reduce((sum, e) => sum + e.amount, 0),
            month: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        };
    }
    /**
     * Get category breakdown with percentages
     */
    async getCategoryBreakdown(userId, period) {
        const now = new Date();
        const startDate = period === 'month' ? (0, date_fns_1.startOfMonth)(now) : (0, date_fns_1.startOfWeek)(now);
        const expenses = await Expense_1.Expense.find({
            userId,
            date: { $gte: startDate }
        });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        // Group by category
        const categoryMap = new Map();
        expenses.forEach(expense => {
            const category = expense.category || 'other';
            const existing = categoryMap.get(category) || { amount: 0, count: 0 };
            categoryMap.set(category, {
                amount: existing.amount + expense.amount,
                count: existing.count + 1
            });
        });
        // Convert to array and calculate percentages
        const breakdown = Array.from(categoryMap.entries())
            .map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
            count: data.count
        }))
            .sort((a, b) => b.amount - a.amount);
        return breakdown;
    }
    /**
     * Get monthly spending trends for last 6 months
     */
    async getMonthlyTrends(userId) {
        const trends = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = (0, date_fns_1.subMonths)(now, i);
            const monthStart = (0, date_fns_1.startOfMonth)(monthDate);
            const monthEnd = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, i - 1));
            const expenses = await Expense_1.Expense.find({
                userId,
                date: { $gte: monthStart, $lt: monthEnd }
            });
            const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
            trends.push({
                month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
                amount: totalAmount
            });
        }
        return trends;
    }
    /**
     * Detect unusual spending (expenses >2x category average)
     */
    async detectUnusualSpending(userId) {
        const monthStart = (0, date_fns_1.startOfMonth)(new Date());
        const expenses = await Expense_1.Expense.find({
            userId,
            date: { $gte: monthStart }
        });
        // Calculate average per category
        const categoryAverages = new Map();
        const categoryExpenses = new Map();
        expenses.forEach(expense => {
            const category = expense.category || 'other';
            if (!categoryExpenses.has(category)) {
                categoryExpenses.set(category, []);
            }
            categoryExpenses.get(category).push(expense);
        });
        categoryExpenses.forEach((catExpenses, category) => {
            const avg = catExpenses.reduce((sum, e) => sum + e.amount, 0) / catExpenses.length;
            categoryAverages.set(category, avg);
        });
        // Find unusual expenses (>2x average)
        const unusualExpenses = [];
        expenses.forEach(expense => {
            const category = expense.category || 'other';
            const avg = categoryAverages.get(category) || 0;
            if (expense.amount > avg * 2 && avg > 0) {
                unusualExpenses.push({
                    id: expense._id.toString(),
                    description: expense.description,
                    amount: expense.amount,
                    category,
                    date: expense.date.toISOString(),
                    reason: `${(expense.amount / avg).toFixed(1)}x higher than your average ${category} expense`
                });
            }
        });
        return unusualExpenses.sort((a, b) => b.amount - a.amount).slice(0, 5);
    }
}
exports.default = new AnalyticsService();
//# sourceMappingURL=AnalyticsService.js.map