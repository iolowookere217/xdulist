import apiClient from './client';
import { ApiResponse, Todo, CreateTodoData } from '@/types';

export const todosApi = {
  // Get all todos
  getTodos: async (params?: { sort?: string; limit?: number }) => {
    const response = await apiClient.get<ApiResponse<{ todos: Todo[] }>>('/todos', { params });
    return response.data;
  },

  // Get todo by ID
  getTodoById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ todo: Todo }>>(`/todos/${id}`);
    return response.data;
  },

  // Create todo
  createTodo: async (data: CreateTodoData) => {
    const response = await apiClient.post<ApiResponse<{ todo: Todo }>>('/todos', data);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: string, data: Partial<CreateTodoData> & { isCompleted?: boolean }) => {
    const response = await apiClient.put<ApiResponse<{ todo: Todo }>>(`/todos/${id}`, data);
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/todos/${id}`);
    return response.data;
  },

  // Parse voice transcript
  parseVoice: async (transcript: string) => {
    const response = await apiClient.post<ApiResponse<{ description: string; startTime?: string; reminderTime?: string }>>(
      '/todos/parse-voice',
      { transcript }
    );
    return response.data;
  },

  // Get todo summary statistics
  getSummary: async (period: 'day' | 'week' | 'month' = 'day') => {
    const response = await apiClient.get<ApiResponse<{
      period: string;
      startDate: string;
      endDate: string;
      summary: {
        total: number;
        completed: number;
        pending: number;
        completionRate: number;
      };
      trends: Record<string, { completed: number; pending: number }>;
    }>>(`/todos/summary?period=${period}`);
    return response.data;
  },
};
