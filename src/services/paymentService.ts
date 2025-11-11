import api from './api';
import { Payment, SubscriptionPlan, ApiResponse, PaginatedResponse } from '../types';

export const paymentService = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get<ApiResponse<SubscriptionPlan[]>>('/payments/plans');
    return response.data.data!;
  },

  async createCheckoutSession(planId: string): Promise<{ sessionId: string; url: string }> {
    const response = await api.post<ApiResponse<{ sessionId: string; url: string }>>(
      '/payments/create-checkout',
      { planId }
    );
    return response.data.data!;
  },

  async getPaymentHistory(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>('/payments/history', {
      params: { page, limit },
    });
    return response.data;
  },

  async verifySession(sessionId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/payments/verify/${sessionId}`);
    return response.data.data!;
  },
};
