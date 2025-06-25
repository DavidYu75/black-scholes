// Option calculation request parameters
export interface CalculationRequest {
    current_price: number;
    strike_price: number;
    time_to_maturity: number;
    volatility: number;
    risk_free_rate: number;
    dividend_yield: number;
}

// Option calculation response
export interface CalculationResponse {
    call_price: number;
    put_price: number;
    call_delta: number;
    put_delta: number;
    gamma: number;
}

// Heatmap request parameters
export interface HeatmapRequest {
    base_params: CalculationRequest;
    spot_min: number;
    spot_max: number;
    vol_min: number;
    vol_max: number;
    grid_size?: number;
}

// Heatmap response data
export interface HeatmapResponse {
    call_prices: number[][];
    put_prices: number[][];
    spot_values: number[];
    volatility_values: number[];
}

// Option type for UI selection
export type OptionType = 'call' | 'put';

// Parameter configuration for sliders
export interface ParameterConfig {
    min: number;
    max: number;
    step: number;
    default: number;
    label: string;
    description: string;
    format?: (value: number) => string;
}

// Complete parameter configurations
export interface ParameterConfigs {
    current_price: ParameterConfig;
    strike_price: ParameterConfig;
    time_to_maturity: ParameterConfig;
    volatility: ParameterConfig;
    risk_free_rate: ParameterConfig;
    dividend_yield: ParameterConfig;
}

// UI state for the dashboard
export interface DashboardState {
    parameters: CalculationRequest;
    selectedOptionType: OptionType;
    results: CalculationResponse | null;
    heatmapData: HeatmapResponse | null;
    isLoading: boolean;
    error: string | null;
}
