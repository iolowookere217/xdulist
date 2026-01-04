import apiClient from './client';
import { ApiResponse, UserSubscription, UpdateSubscriptionData } from '@/types';

export const subscriptionApi = {
  // Get user subscription
  getSubscription: async () => {
    const response = await apiClient.get<ApiResponse<{ subscription: UserSubscription }>>(
      '/subscription'
    );
    return response.data;
  },

  // Update subscription settings
  updateSubscription: async (data: UpdateSubscriptionData) => {
    const response = await apiClient.put<ApiResponse<{ subscription: UserSubscription }>>(
      '/subscription',
      data
    );
    return response.data;
  },

  // Upgrade to premium (manual - no payment)
  upgradeToPremium: async () => {
    const response = await apiClient.post<ApiResponse<{ subscription: UserSubscription }>>(
      '/subscription/upgrade'
    );
    return response.data;
  },

  // Downgrade to free
  downgradeToFree: async () => {
    const response = await apiClient.post<ApiResponse<{ subscription: UserSubscription }>>(
      '/subscription/downgrade'
    );
    return response.data;
  },
};
