import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  Expense,
  CreateExpenseData,
  ReceiptUploadResponse,
  VoiceParseResponse,
  SpendingTotals,
  CategoryBreakdown,
  MonthlyTrend,
  Insight
} from '@/types';

export const expensesApi = {
  // Get all expenses
  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    currency?: string;
    sort?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { params });
    return response.data;
  },

  // Get expense by ID
  getExpenseById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  createExpense: async (data: CreateExpenseData) => {
    const response = await apiClient.post<ApiResponse<{ expense: Expense }>>('/expenses', data);
    return response.data;
  },

  // Update expense
  updateExpense: async (id: string, data: Partial<CreateExpenseData>) => {
    const response = await apiClient.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/expenses/${id}`);
    return response.data;
  },

  // Upload receipt
  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await apiClient.post<ApiResponse<ReceiptUploadResponse>>(
      '/expenses/upload-receipt',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Parse voice transcript
  parseVoice: async (transcript: string) => {
    const response = await apiClient.post<ApiResponse<VoiceParseResponse>>(
      '/expenses/parse-voice',
      { transcript }
    );
    return response.data;
  },

  // Get analytics
  getAnalytics: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        totals: SpendingTotals;
        categoryBreakdown: CategoryBreakdown[];
        trends: MonthlyTrend[];
      }>
    >('/expenses/analytics/summary');
    return response.data;
  },

  // Get AI insights (Premium only)
  getAIInsights: async () => {
    const response = await apiClient.get<ApiResponse<{ insights: Insight[] }>>(
      '/expenses/ai-insights'
    );
    return response.data;
  },
};
