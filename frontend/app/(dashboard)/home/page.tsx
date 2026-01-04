'use client';

import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { subscriptionApi } from '@/lib/api/subscription';
import { useAuth } from '@/lib/hooks/useAuth';
import { Wallet, Calendar, Clock, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export default function HomePage() {
  const { user } = useAuth();

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.getExpenses({ sort: '-date', limit: 100 }),
  });

  // Fetch subscription
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getSubscription(),
  });

  const expenses = expensesData?.data?.expenses || [];
  const subscription = subscriptionData?.data?.subscription;

  // Calculate spending totals
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const todaySpent = expenses
    .filter((exp) => new Date(exp.date) >= todayStart)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const weekSpent = expenses
    .filter((exp) => new Date(exp.date) >= weekStart)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const monthSpent = expenses
    .filter((exp) => new Date(exp.date) >= monthStart)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-8 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-blue-100 text-sm">Welcome back,</p>
          <h1 className="text-xl font-bold text-white mt-1">{user?.fullName || 'Guest'}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-12 pb-8">
        {/* Spending Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SpendingCard
            title="Today"
            amount={todaySpent}
            icon={Clock}
            gradient="from-blue-500 to-blue-600"
          />
          <SpendingCard
            title="Week"
            amount={weekSpent}
            icon={Calendar}
            gradient="from-purple-500 to-purple-600"
          />
          <SpendingCard
            title="Month"
            amount={monthSpent}
            icon={Wallet}
            gradient="from-green-500 to-green-600"
          />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
          </div>

          {expensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense._id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category || 'Uncategorized'}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No expenses yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Go to Expenses tab to add your first expense
              </p>
            </div>
          )}
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Plan</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{subscription.tier}</p>
              </div>
              {subscription.tier === 'free' && (
                <div className="text-sm text-gray-600">
                  Receipts: {subscription.receiptsScannedThisMonth}/5
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Spending Card Component
function SpendingCard({
  title,
  amount,
  icon: Icon,
  gradient,
}: {
  title: string;
  amount: number;
  icon: any;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg`}>
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <p className="text-xs opacity-90 mb-1">{title}</p>
      <p className="text-lg font-bold">${amount.toFixed(2)}</p>
    </div>
  );
}
