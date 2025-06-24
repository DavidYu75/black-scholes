import { CalculationRequest, CalculationResponse, HeatmapRequest, HeatmapResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class BlackScholesApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async calculateOptionPrices(params: CalculationRequest): Promise<CalculationResponse> {
    return this.request<CalculationResponse>('/api/v1/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async generateHeatmapData(params: HeatmapRequest): Promise<HeatmapResponse> {
    return this.request<HeatmapResponse>('/api/v1/heatmap', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new BlackScholesApi();
export { ApiError };
