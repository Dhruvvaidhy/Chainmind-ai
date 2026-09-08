import { apiClient } from './api';
import { ApiResponse, DemandForecastResult, SupplyChainHealthResult } from '../types';

export const analyticsService = {
  async getHealthScore(): Promise<SupplyChainHealthResult> {
    const response = await apiClient.get<ApiResponse<SupplyChainHealthResult>>('/analytics/health');
    return response.data.data;
  },

  async getDemandForecast(productId: number): Promise<DemandForecastResult> {
    const response = await apiClient.get<ApiResponse<DemandForecastResult>>(`/analytics/demand/${productId}`);
    return response.data.data;
  },
};
