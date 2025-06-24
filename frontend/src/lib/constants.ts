import { ParameterConfigs, CalculationRequest } from "@/types";

// Default parameter configurations for the Black-Scholes calculator
export const PARAMETER_CONFIGS: ParameterConfigs = {
  current_price: {
    min: 50,
    max: 300,
    step: 1,
    default: 145,
    label: "Current Price",
    description: "Current stock price",
    format: (value) => `$${value.toFixed(2)}`,
  },
  strike_price: {
    min: 50,
    max: 300,
    step: 1,
    default: 150,
    label: "Strike Price",
    description: "Option strike price",
    format: (value) => `$${value.toFixed(2)}`,
  },
  time_to_maturity: {
    min: 0.01,
    max: 2,
    step: 0.01,
    default: 0.082, // ~30 days
    label: "Time to Expiry",
    description: "Time to expiration (years)",
    format: (value) => `${Math.round(value * 365)} days`,
  },
  volatility: {
    min: 0.05,
    max: 1.5,
    step: 0.01,
    default: 0.25,
    label: "Volatility",
    description: "Annualized volatility",
    format: (value) => `${(value * 100).toFixed(1)}%`,
  },
  risk_free_rate: {
    min: 0,
    max: 0.1,
    step: 0.0025,
    default: 0.0325,
    label: "Risk-Free Rate",
    description: "Risk-free interest rate",
    format: (value) => `${(value * 100).toFixed(2)}%`,
  },
  dividend_yield: {
    min: 0,
    max: 0.08,
    step: 0.0025,
    default: 0.005,
    label: "Dividend Yield",
    description: "Annual dividend yield",
    format: (value) => `${(value * 100).toFixed(2)}%`,
  },
};

// Default calculation request
export const DEFAULT_PARAMETERS = Object.entries(PARAMETER_CONFIGS).reduce<CalculationRequest>(
  (acc, [key, config]) => {
    acc[key as keyof CalculationRequest] = config.default;
    return acc;
  },
  {} as CalculationRequest
);

// Heatmap default ranges
export const HEATMAP_DEFAULTS = {
  spotRangePercent: 0.2, // ±20% from current price
  volRangePercent: 0.3, // ±30% from current volatility
  gridSize: 15,
};
