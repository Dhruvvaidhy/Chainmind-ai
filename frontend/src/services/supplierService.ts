import { apiClient } from './api';
import { ApiResponse, PagedResponse, Supplier } from '../types';

export interface CreateSupplierParams {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  rating?: number;
}

export interface UpdateSupplierParams extends CreateSupplierParams {
  status?: string;
}

export const supplierService = {
  async getSuppliers(params?: { search?: string; status?: string; page?: number; size?: number }): Promise<PagedResponse<Supplier>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<Supplier>>>('/suppliers', { params });
    return response.data.data;
  },

  async getAllSuppliers(): Promise<Supplier[]> {
    const response = await apiClient.get<ApiResponse<Supplier[]>>('/suppliers/all');
    return response.data.data;
  },

  async getSupplierById(id: number): Promise<Supplier> {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data;
  },

  async createSupplier(data: CreateSupplierParams): Promise<Supplier> {
    const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', data);
    return response.data.data;
  },

  async updateSupplier(id: number, data: UpdateSupplierParams): Promise<Supplier> {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
