import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - Add access token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track refresh attempts to prevent logout on network errors
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // Store new token
        localStorage.setItem('accessToken', accessToken);

        // Reset refresh attempts on success
        refreshAttempts = 0;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // Only logout if refresh token is truly invalid/expired
        const isRefreshTokenInvalid =
          refreshError.response?.status === 401 &&
          refreshError.response?.data?.message?.toLowerCase().includes('invalid or expired refresh token');

        // Network errors or server errors should not cause logout
        const isNetworkError = !refreshError.response;
        const isServerError = refreshError.response?.status >= 500;

        if (isNetworkError || isServerError) {
          refreshAttempts++;

          // Only logout after multiple failed attempts (likely prolonged network issue)
          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error('Multiple refresh attempts failed. Please check your connection.');
            refreshAttempts = 0;
          }

          // Don't logout, just reject the request
          return Promise.reject(refreshError);
        }

        // Only logout for actual authentication failures (invalid/expired refresh token)
        if (isRefreshTokenInvalid) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
