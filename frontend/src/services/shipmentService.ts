import { apiClient } from './api';
import { ApiResponse, PagedResponse, Shipment, ShipmentRiskResult } from '../types';

export interface CreateShipmentParams {
  purchaseOrderId?: number;
  origin: string;
  destination: string;
  carrier: string;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
}

export interface AddShipmentEventParams {
  status: string;
  location?: string;
  description?: string;
}

export const shipmentService = {
  async getShipments(params?: { search?: string; status?: string; riskLevel?: string; page?: number; size?: number }): Promise<PagedResponse<Shipment>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<Shipment>>>('/shipments', { params });
    return response.data.data;
  },

  async getShipmentById(id: number): Promise<Shipment> {
    const response = await apiClient.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return response.data.data;
  },

  async createShipment(data: CreateShipmentParams): Promise<Shipment> {
    const response = await apiClient.post<ApiResponse<Shipment>>('/shipments', data);
    return response.data.data;
  },

  async addEvent(id: number, data: AddShipmentEventParams): Promise<Shipment> {
    const response = await apiClient.post<ApiResponse<Shipment>>(`/shipments/${id}/events`, data);
    return response.data.data;
  },

  async getRiskAnalysis(id: number): Promise<ShipmentRiskResult> {
    const response = await apiClient.get<ApiResponse<ShipmentRiskResult>>(`/shipments/${id}/risk-analysis`);
    return response.data.data;
  },
};
