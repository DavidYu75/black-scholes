"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalculationRequest,
  CalculationResponse,
  HeatmapResponse,
  OptionType,
  DashboardState,
} from "@/types";
import { DEFAULT_PARAMETERS, HEATMAP_DEFAULTS } from "@/lib/constants";
import { apiClient, ApiError } from "@/lib/api";
import ParameterControls from "@/components/ParameterControls";
import ResultsDisplay from "@/components/ResultsDisplay";
import HeatmapVisualization from "@/components/HeatmapVisualization";
import { Calculator, Activity, AlertCircle, Zap } from "lucide-react";

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    parameters: DEFAULT_PARAMETERS,
    selectedOptionType: "call",
    results: null,
    heatmapData: null,
    isLoading: false,
    error: null,
  });

  // Calculate option prices
  const calculatePrices = useCallback(async (params: CalculationRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await apiClient.calculateOptionPrices(params);
      setState((prev) => ({ ...prev, results, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? `API Error: ${error.message}`
          : "Failed to calculate option prices";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  // Generate heatmap data
  const generateHeatmap = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentPrice = state.parameters.current_price;
      const currentVol = state.parameters.volatility;

      const heatmapRequest = {
        base_params: state.parameters,
        spot_min: currentPrice * (1 - HEATMAP_DEFAULTS.spotRangePercent),
        spot_max: currentPrice * (1 + HEATMAP_DEFAULTS.spotRangePercent),
        vol_min: Math.max(
          0.05,
          currentVol * (1 - HEATMAP_DEFAULTS.volRangePercent)
        ),
        vol_max: currentVol * (1 + HEATMAP_DEFAULTS.volRangePercent),
        grid_size: HEATMAP_DEFAULTS.gridSize,
      };

      const heatmapData = await apiClient.generateHeatmapData(heatmapRequest);
      setState((prev) => ({ ...prev, heatmapData, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? `API Error: ${error.message}`
          : "Failed to generate heatmap data";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [state.parameters]);

  // Handle parameter changes
  const handleParametersChange = (newParameters: CalculationRequest) => {
    setState((prev) => ({ ...prev, parameters: newParameters }));
  };

  // Handle option type change
  const handleOptionTypeChange = (optionType: OptionType) => {
    setState((prev) => ({ ...prev, selectedOptionType: optionType }));
  };

  // Auto-calculate on parameter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePrices(state.parameters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.parameters, calculatePrices]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Calculator className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">Black-Scholes Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Activity className="w-4 h-4" />
                <span>Real-time Pricing</span>
              </div>

              <button
                onClick={generateHeatmap}
                disabled={state.isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Heatmap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {state.error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200">{state.error}</span>
              <button
                onClick={() => setState((prev) => ({ ...prev, error: null }))}
                className="ml-auto text-red-400 hover:text-red-300"
                aria-label="Close error message"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parameter Controls */}
          <div className="lg:col-span-1">
            <ParameterControls
              parameters={state.parameters}
              onChange={handleParametersChange}
              disabled={state.isLoading}
            />
          </div>

          {/* Results and Visualizations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Results Display */}
            <ResultsDisplay
              results={state.results}
              selectedOptionType={state.selectedOptionType}
              onOptionTypeChange={handleOptionTypeChange}
              isLoading={state.isLoading}
            />

            {/* Heatmap Visualization */}
            <HeatmapVisualization
              data={state.heatmapData}
              selectedOptionType={state.selectedOptionType}
              isLoading={state.isLoading}
            />
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">
            About Black-Scholes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">The Model</h3>
              <p className="text-sm">
                The Black-Scholes model is a mathematical model for pricing
                options contracts. It calculates the theoretical value of
                options using factors like current stock price, strike price,
                time to expiration, volatility, and risk-free interest rate.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">
                Key Assumptions
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Constant volatility and risk-free rate</li>
                <li>• European-style exercise (only at expiration)</li>
                <li>• No dividends during option life</li>
                <li>• Efficient markets with no transaction costs</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>
              Black-Scholes Interactive Dashboard • Built for educational and
              professional use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
