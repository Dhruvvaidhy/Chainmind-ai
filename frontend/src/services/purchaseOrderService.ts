import { apiClient } from './api';
import { ApiResponse, PagedResponse, PurchaseOrder } from '../types';

export interface CreatePOItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePOParams {
  supplierId: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items: CreatePOItem[];
}

export interface ReceiveItemsParams {
  warehouseId: number;
  items: { itemId: number; receivedQuantity: number }[];
}

export const purchaseOrderService = {
  async getPurchaseOrders(params?: { search?: string; status?: string; supplierId?: number; page?: number; size?: number }): Promise<PagedResponse<PurchaseOrder>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<PurchaseOrder>>>('/purchase-orders', { params });
    return response.data.data;
  },

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return response.data.data;
  },

  async createPurchaseOrder(data: CreatePOParams): Promise<PurchaseOrder> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data);
    return response.data.data;
  },

  async updateStatus(id: number, status: string): Promise<PurchaseOrder> {
    const response = await apiClient.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },

  async receiveItems(id: number, data: ReceiveItemsParams): Promise<PurchaseOrder> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/receive`, data);
    return response.data.data;
  },
};
