// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
  tier: "free" | "premium";
}

// Expense types
export type ExpenseCategory =
  | "groceries"
  | "transport"
  | "dining"
  | "entertainment"
  | "utilities"
  | "healthcare"
  | "shopping"
  | "travel"
  | "education"
  | "subscriptions"
  | "other";

export type Currency = "NGN" | "USD" | "GBP";

export interface Expense {
  _id: string;
  userId: string;
  description: string;
  amount: number;
  category?: ExpenseCategory;
  date: string;
  receiptUrl?: string;
  merchant?: string;
  currency: Currency;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// Todo types
export interface Todo {
  _id: string;
  userId: string;
  description: string;
  startTime: string; // HH:mm format - when the task starts
  reminderTime?: string; // HH:mm format - when to send reminder (optional)
  isCompleted: boolean;
  reminderSent: boolean;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription types
export interface NotificationSettings {
  spendingAlerts: boolean;
  weeklySummary: boolean;
  budgetWarnings: boolean;
}

export interface UserSubscription {
  _id: string;
  userId: string;
  tier: "free" | "premium";
  receiptsScannedThisMonth: number;
  monthResetDate: string;
  monthlyBudget?: number;
  preferredCurrency: string;
  notificationSettings: NotificationSettings;
  customCategories?: string[];
  subscriptionEndsAt?: string;
}

// Analytics types
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
  [key: string]: any;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM
  amount: number;
}

// AI Insight types
export type InsightType = "pattern" | "recommendation" | "alert";

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: any;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Form data types
export interface CreateExpenseData {
  description: string;
  amount: number;
  category?: ExpenseCategory;
  currency?: Currency;
  date?: string;
  receiptUrl?: string;
  merchant?: string;
}

export interface CreateTodoData {
  description: string;
  startTime: string;
  reminderTime?: string; // Optional reminder time
}

export interface UpdateSubscriptionData {
  monthlyBudget?: number;
  preferredCurrency?: string;
  notificationSettings?: Partial<NotificationSettings>;
  customCategories?: string[];
}

// Receipt upload response
export interface ReceiptUploadResponse {
  receiptUrl: string;
  extracted: {
    vendorName?: string;
    totalAmount?: number;
    date?: string;
    items?: Array<{ name: string; price: number }>;
    category?: string;
    currency?: string;
  };
  scansRemaining: number | "unlimited";
}

// Voice parsing response
export interface VoiceParseResponse {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
}
