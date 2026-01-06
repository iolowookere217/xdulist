import apiClient from "./client";
import { ApiResponse, User } from "@/types";

export const authApi = {
  // Register new user
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    const response = await apiClient.post<
      ApiResponse<{
        user: User;
        accessToken?: string;
        requiresVerification?: boolean;
      }>
    >("/auth/register", data);
    return response.data;
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<
      ApiResponse<{ user: User; accessToken: string }>
    >("/auth/login", data);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  // Get current user
  me: async () => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      "/auth/me"
    );
    return response.data;
  },

  // Google OAuth
  googleAuth: async (data: {
    googleId: string;
    email: string;
    fullName: string;
    avatar?: string;
  }) => {
    const response = await apiClient.post<
      ApiResponse<{ user: User; accessToken: string }>
    >("/auth/google", data);
    return response.data;
  },
};
