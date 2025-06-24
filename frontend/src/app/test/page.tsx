"use client";

import { useState } from "react";
import ParameterControls from "@/components/ParameterControls";
import ResultsDisplay from "@/components/ResultsDisplay";
import { DEFAULT_PARAMETERS } from "@/lib/constants";
import { CalculationResponse, OptionType } from "@/types";

// Mock data for demonstration
const MOCK_RESULTS: CalculationResponse = {
  call_price: 12.34,
  put_price: 5.67,
  call_delta: 0.6543,
  put_delta: -0.3457,
  gamma: 0.0123,
};

export default function TestPage() {
  const [params, setParams] = useState(DEFAULT_PARAMETERS);
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType>('call');
  
  // In a real app, this would come from your API
  const [results] = useState<CalculationResponse | null>(MOCK_RESULTS);
  const [isLoading] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Option Pricing Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}
