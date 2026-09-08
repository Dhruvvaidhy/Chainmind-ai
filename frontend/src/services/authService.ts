import { apiClient } from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export interface LoginParams {
  email: string;
  password: String;
}

export interface RegisterParams {
  organizationName: string;
  organizationCode: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authService = {
  async login(params: LoginParams): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', params);
    return response.data.data;
  },

  async register(params: RegisterParams): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', params);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.clear();
    }
  },
};
