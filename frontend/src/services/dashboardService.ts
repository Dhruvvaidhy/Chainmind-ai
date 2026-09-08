import { apiClient } from './api';
import { ApiResponse, SupplyChainHealthResult } from '../types';

export interface ExecutiveKpis {
  totalSuppliers: number;
  activeShipments: number;
  highRiskShipments: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  healthScore: SupplyChainHealthResult;
}

export interface DashboardCharts {
  shipmentStatusDistribution: { name: string; value: number; color: string }[];
  monthlyShipmentPerformance: { month: string; onTime: number; delayed: number }[];
  supplierPerformanceComparison: { name: string; score: number; rating: number }[];
  inventoryDistribution: { warehouse: string; stock: number }[];
  demandTrend: { month: string; actual: number; forecast: number }[];
}

export const dashboardService = {
  async getKpis(): Promise<ExecutiveKpis> {
    const response = await apiClient.get<ApiResponse<ExecutiveKpis>>('/dashboard/kpis');
    return response.data.data;
  },

  async getCharts(): Promise<DashboardCharts> {
    const response = await apiClient.get<ApiResponse<DashboardCharts>>('/dashboard/charts');
    return response.data.data;
  },
};
