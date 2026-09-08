import { apiClient } from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data;
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
