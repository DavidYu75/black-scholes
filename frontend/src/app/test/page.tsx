"use client";

import { useState } from "react";
import ParameterControls from "@/components/ParameterControls";
import ResultsDisplay from "@/components/ResultsDisplay";
import HeatmapVisualization from "@/components/HeatmapVisualization";
import { DEFAULT_PARAMETERS } from "@/lib/constants";
import { CalculationResponse, HeatmapResponse, OptionType } from "@/types";

// Mock data for demonstration
const MOCK_RESULTS: CalculationResponse = {
  call_price: 12.34,
  put_price: 5.67,
  call_delta: 0.6543,
  put_delta: -0.3457,
  gamma: 0.0123,
};

// Mock heatmap data
const MOCK_HEATMAP: HeatmapResponse = {
  call_prices: Array(15).fill(0).map((_, i) => 
    Array(15).fill(0).map((_, j) => 
      Math.sin(i * 0.5) * Math.cos(j * 0.5) * 10 + 20 + Math.random() * 5
    )
  ),
  put_prices: Array(15).fill(0).map((_, i) => 
    Array(15).fill(0).map((_, j) => 
      Math.cos(i * 0.5) * Math.sin(j * 0.5) * 8 + 15 + Math.random() * 5
    )
  ),
  spot_values: Array(15).fill(0).map((_, i) => 100 + i * 10),
  volatility_values: Array(15).fill(0).map((_, i) => 0.1 + (i * 0.05)),
};

export default function TestPage() {
  const [params, setParams] = useState(DEFAULT_PARAMETERS);
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType>('call');
  
  // In a real app, this would come from your API
  const [results] = useState<CalculationResponse | null>(MOCK_RESULTS);
  const [heatmapData] = useState<HeatmapResponse | null>(MOCK_HEATMAP);
  const [isLoading] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Option Pricing Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Parameters</h2>
          <ParameterControls parameters={params} onChange={setParams} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Results</h2>
          <ResultsDisplay 
            results={results}
            selectedOptionType={selectedOptionType}
            onOptionTypeChange={setSelectedOptionType}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-200">Price Sensitivity Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-green-400">Call Options</h3>
            <HeatmapVisualization 
              data={heatmapData} 
              selectedOptionType="call"
              isLoading={isLoading} 
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3 text-red-400">Put Options</h3>
            <HeatmapVisualization 
              data={heatmapData} 
              selectedOptionType="put"
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
