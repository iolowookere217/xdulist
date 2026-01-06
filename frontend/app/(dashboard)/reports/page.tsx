"use client";

import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api/expenses";
import { subscriptionApi } from "@/lib/api/subscription";
import { Loader2, TrendingUp, Receipt, DollarSign, Lock } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import Link from "next/link";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
];

export default function ReportsPage() {
  // Fetch analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => expensesApi.getAnalytics(),
  });

  // Fetch subscription
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionApi.getSubscription(),
  });

  const analytics = analyticsData?.data;
  const subscription = subscriptionData?.data?.subscription;
  const isPremium = subscription?.tier === "premium";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 pt-8 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-purple-100 text-sm mt-1">
            Analyze your spending patterns
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <DollarSign className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Today</p>
            <p className="text-lg font-bold text-gray-900">
              ${analytics?.totals?.today.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Week</p>
            <p className="text-lg font-bold text-gray-900">
              ${analytics?.totals?.week.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Receipt className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Month</p>
            <p className="text-lg font-bold text-gray-900">
              ${analytics?.totals?.month.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        {analytics?.categoryBreakdown &&
          analytics.categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Breakdown
              </h3>

              {/* Pie Chart */}
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) =>
                        `${entry.category}: ${entry.percentage.toFixed(0)}%`
                      }>
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) =>
                        typeof value === "number" ? `$${value.toFixed(2)}` : ""
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="space-y-2">
                {analytics.categoryBreakdown.slice(0, 5).map((cat, index) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {cat.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${cat.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cat.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Monthly Trends */}
        {analytics?.trends && analytics.trends.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              6-Month Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.trends}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split("-");
                      const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      return monthNames[parseInt(month) - 1];
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) =>
                      typeof value === "number" ? `$${value.toFixed(2)}` : ""
                    }
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Premium Features Teaser */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Unlock Advanced Reports
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get AI-powered insights, spending forecasts, budget
                  recommendations, and more!
                </p>
                <Link
                  href="/settings"
                  className="inline-block px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-violet-700 hover:to-purple-700 transition-all">
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analytics?.categoryBreakdown ||
        analytics.categoryBreakdown.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No data to display</p>
            <p className="text-sm text-gray-400 mt-1">
              Add some expenses to see your spending reports
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
