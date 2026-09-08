import { apiClient } from './api';
import { ApiResponse, PagedResponse, Warehouse } from '../types';

export interface CreateWarehouseParams {
  name: string;
  code: string;
  location?: string;
  city?: string;
  country?: string;
  capacity?: number;
  managerName?: string;
}

export interface UpdateWarehouseParams extends CreateWarehouseParams {
  status?: string;
}

export const warehouseService = {
  async getWarehouses(params?: { search?: string; page?: number; size?: number }): Promise<PagedResponse<Warehouse>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<Warehouse>>>('/warehouses', { params });
    return response.data.data;
  },

  async getAllWarehouses(): Promise<Warehouse[]> {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>('/warehouses/all');
    return response.data.data;
  },

  async getWarehouseById(id: number): Promise<Warehouse> {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data;
  },

  async createWarehouse(data: CreateWarehouseParams): Promise<Warehouse> {
    const response = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', data);
    return response.data.data;
  },

  async updateWarehouse(id: number, data: UpdateWarehouseParams): Promise<Warehouse> {
    const response = await apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return response.data.data;
  },

  async deleteWarehouse(id: number): Promise<void> {
    await apiClient.delete(`/warehouses/${id}`);
  },
};
