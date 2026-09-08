import { apiClient } from './api';
import { ApiResponse, AIInsight } from '../types';

export interface AIMessageResponse {
  id: number;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: string;
}

export const aiService = {
  async getInsights(): Promise<AIInsight[]> {
    const response = await apiClient.get<ApiResponse<AIInsight[]>>('/ai/insights');
    return response.data.data;
  },

  async chatWithAssistant(prompt: string, conversationId?: number): Promise<AIMessageResponse> {
    const response = await apiClient.post<ApiResponse<AIMessageResponse>>('/ai/assistant/chat', {
      prompt,
      conversationId,
    });
    return response.data.data;
  },

  async analyzeSupplier(supplierId: number): Promise<string> {
    const response = await apiClient.get<ApiResponse<string>>(`/ai/suppliers/${supplierId}/analyze`);
    return response.data.data;
  },
};
