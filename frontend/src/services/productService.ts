import { apiClient } from './api';
import { ApiResponse, PagedResponse, Product, ProductCategory } from '../types';

export interface CreateProductParams {
  supplierId: number;
  categoryId?: number;
  name: string;
  sku?: string;
  description?: string;
  unit?: string;
  purchasePrice: number;
  leadTimeDays?: number;
  reorderLevel?: number;
  safetyStock?: number;
}

export interface UpdateProductParams extends CreateProductParams {
  status?: string;
}

export const productService = {
  async getProducts(params?: { search?: string; supplierId?: number; categoryId?: number; page?: number; size?: number }): Promise<PagedResponse<Product>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<Product>>>('/products', { params });
    return response.data.data;
  },

  async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/all');
    return response.data.data;
  },

  async getCategories(): Promise<ProductCategory[]> {
    const response = await apiClient.get<ApiResponse<ProductCategory[]>>('/products/categories');
    return response.data.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: CreateProductParams): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  async updateProduct(id: number, data: UpdateProductParams): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
