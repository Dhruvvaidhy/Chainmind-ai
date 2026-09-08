import { apiClient } from './api';
import { ApiResponse, PagedResponse, Inventory, StockMovement } from '../types';

export interface StockAdjustmentParams {
  inventoryId: number;
  type: 'INCREASE' | 'DECREASE' | 'DAMAGE' | 'CORRECTION';
  quantity: number;
  notes?: string;
}

export const inventoryService = {
  async getInventory(params?: { search?: string; productId?: number; warehouseId?: number; page?: number; size?: number }): Promise<PagedResponse<Inventory>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<Inventory>>>('/inventory', { params });
    return response.data.data;
  },

  async adjustStock(data: StockAdjustmentParams): Promise<Inventory> {
    const response = await apiClient.post<ApiResponse<Inventory>>('/inventory/adjust', data);
    return response.data.data;
  },

  async getStockMovements(params?: { inventoryId?: number; productId?: number; type?: string; page?: number; size?: number }): Promise<PagedResponse<StockMovement>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<StockMovement>>>('/inventory/movements', { params });
    return response.data.data;
  },
};
