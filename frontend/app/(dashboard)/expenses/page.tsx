"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api/expenses";
import { subscriptionApi } from "@/lib/api/subscription";
import {
  Search,
  Filter,
  Loader2,
  Trash2,
  Edit,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, getRelativeDateLabel, formatDate } from "@/lib/utils";
import { Expense, ExpenseCategory } from "@/types";
import { toast } from "sonner";
import CategoryBadge from "@/components/expenses/CategoryBadge";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import QuickAddButton from "@/components/expenses/QuickAddButton";

const categories: ExpenseCategory[] = [
  "groceries",
  "transport",
  "dining",
  "entertainment",
  "utilities",
  "healthcare",
  "shopping",
  "travel",
  "education",
  "subscriptions",
  "other",
];

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Fetch expenses
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", selectedCategory, search],
    queryFn: () =>
      expensesApi.getExpenses({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: search || undefined,
        sort: "-date",
        limit: 100,
      }),
  });

  // Fetch subscription
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionApi.getSubscription(),
  });

  const expenses = expensesData?.data?.expenses || [];
  const subscription = subscriptionData?.data?.subscription;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (groups: Record<string, Expense[]>, expense: Expense) => {
      const dateLabel = getRelativeDateLabel(expense.date);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(expense);
      return groups;
    },
    {} as Record<string, Expense[]>
  );

  const handleDelete = (expense: Expense) => {
    if (confirm(`Delete "${expense.description}"?`)) {
      deleteMutation.mutate(expense._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-8 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-blue-100 text-sm mt-1">
            Track and manage your spending
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-lg mx-auto px-4 -mt-4 mb-4">
        <div
          className="bg-white rounded-2xl shadow-sm p-4 space-y-3"
          ref={filterRef}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            Filter by Category
            {selectedCategory !== "all" && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                1
              </span>
            )}
          </button>

          {/* Category Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expenses List */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No expenses found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Tap the + button to add your first expense"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(Object.entries(groupedExpenses) as [string, Expense[]][]).map(
              ([dateLabel, dateExpenses]) => {
                const dayTotal = dateExpenses.reduce(
                  (sum, exp) => sum + exp.amount,
                  0
                );

                return (
                  <div key={dateLabel}>
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        {dateLabel}
                      </h3>
                      <span className="text-sm font-medium text-gray-500">
                        ${dayTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Expenses for this date */}
                    <div className="space-y-2">
                      {dateExpenses.map((expense) => (
                        <div
                          key={expense._id}
                          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {expense.category && (
                                  <CategoryBadge
                                    category={expense.category}
                                    size="sm"
                                  />
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDate(expense.date)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 ml-4">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(
                                  expense.amount,
                                  expense.currency
                                )}
                              </p>
                              <button
                                onClick={() => handleDelete(expense)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete expense">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <QuickAddButton onClick={() => setShowAddModal(true)} />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["expenses"] })
        }
        subscription={subscription}
      />
    </div>
  );
}
