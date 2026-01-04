import { Expense } from '../models/Expense';
import {
  SpendingTotals,
  CategoryBreakdown,
  MonthlyTrend,
  UnusualExpense
} from '../types';
import { startOfDay, startOfWeek, startOfMonth, subMonths } from 'date-fns';

class AnalyticsService {
  /**
   * Get spending totals for today, week, and month
   */
  async getSpendingTotals(userId: string): Promise<SpendingTotals> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [todayExpenses, weekExpenses, monthExpenses] = await Promise.all([
      Expense.find({ userId, date: { $gte: todayStart } }),
      Expense.find({ userId, date: { $gte: weekStart } }),
      Expense.find({ userId, date: { $gte: monthStart } })
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
  async getCategoryBreakdown(
    userId: string,
    period: 'month' | 'week'
  ): Promise<CategoryBreakdown[]> {
    const now = new Date();
    const startDate = period === 'month' ? startOfMonth(now) : startOfWeek(now);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });

    // Convert to array and calculate percentages
    const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
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
  async getMonthlyTrends(userId: string): Promise<MonthlyTrend[]> {
    const trends: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = startOfMonth(subMonths(now, i - 1));

      const expenses = await Expense.find({
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
  async detectUnusualSpending(userId: string): Promise<UnusualExpense[]> {
    const monthStart = startOfMonth(new Date());
    const expenses = await Expense.find({
      userId,
      date: { $gte: monthStart }
    });

    // Calculate average per category
    const categoryAverages = new Map<string, number>();
    const categoryExpenses = new Map<string, any[]>();

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (!categoryExpenses.has(category)) {
        categoryExpenses.set(category, []);
      }
      categoryExpenses.get(category)!.push(expense);
    });

    categoryExpenses.forEach((catExpenses, category) => {
      const avg = catExpenses.reduce((sum, e) => sum + e.amount, 0) / catExpenses.length;
      categoryAverages.set(category, avg);
    });

    // Find unusual expenses (>2x average)
    const unusualExpenses: UnusualExpense[] = [];

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

export default new AnalyticsService();
