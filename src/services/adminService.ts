import api from './api';
import { User, Payment, DashboardStats, UserWithStats, ApiResponse, PaginatedResponse } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
    return response.data.data!;
  },

  async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  async getUserById(id: string): Promise<UserWithStats> {
    const response = await api.get<ApiResponse<UserWithStats>>(`/admin/users/${id}`);
    return response.data.data!;
  },

  async updateUserSubscription(
    id: string,
    subscriptionStatus: 'free' | 'premium' | 'enterprise',
    duration?: number
  ): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/subscription`, {
      subscriptionStatus,
      duration,
    });
    return response.data.data!;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async getAllPayments(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>('/admin/payments', {
      params: { page, limit },
    });
    return response.data;
  },
};
