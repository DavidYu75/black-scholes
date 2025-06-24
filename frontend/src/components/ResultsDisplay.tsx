import { CalculationResponse, OptionType } from "@/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ResultsDisplayProps {
  results: CalculationResponse | null;
  selectedOptionType: OptionType;
  onOptionTypeChange: (type: OptionType) => void;
  isLoading?: boolean;
}

interface MetricCardProps {
  label: string;
  value: number;
  format?: (value: number) => string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({
  label,
  value,
  format,
  icon,
  highlight = false,
}: MetricCardProps) {
  const formattedValue = format ? format(value) : value.toFixed(4);

  return (
    <div
      className={`p-4 rounded-lg ${
        highlight
          ? "bg-blue-900/30 border border-blue-500/50"
          : "bg-gray-700/50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div
        className={`text-xl font-bold ${
          highlight ? "text-blue-400" : "text-gray-100"
        }`}
      >
        {formattedValue}
      </div>
    </div>
  );
}

export default function ResultsDisplay({
  results,
  selectedOptionType,
  onOptionTypeChange,
  isLoading = false,
}: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-10 bg-gray-600 rounded"></div>
            <div className="h-10 bg-gray-600 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-600 rounded"></div>
            <div className="h-20 bg-gray-600 rounded"></div>
            <div className="h-20 bg-gray-600 rounded"></div>
            <div className="h-20 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-6">
          Option Pricing Results
        </h2>
        <div className="text-center text-gray-400 py-8">
          <TrendingUp className="mx-auto w-12 h-12 mb-4 opacity-50" />
          <p>Adjust parameters to see pricing results</p>
        </div>
      </div>
    );
  }

  const formatPrice = (value: number) => `$${value.toFixed(4)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-100 mb-6">
        Option Pricing Results
      </h2>

      {/* Option Type Selector */}
      <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => onOptionTypeChange("call")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedOptionType === "call"
              ? "bg-green-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Call Option
        </button>
        <button
          onClick={() => onOptionTypeChange("put")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedOptionType === "put"
              ? "bg-red-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Put Option
        </button>
      </div>

      {/* Price Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          label="Call Price"
          value={results.call_price}
          format={formatPrice}
          icon={<TrendingUp className="w-4 h-4" />}
          highlight={selectedOptionType === "call"}
        />
        <MetricCard
          label="Put Price"
          value={results.put_price}
          format={formatPrice}
          icon={<TrendingDown className="w-4 h-4" />}
          highlight={selectedOptionType === "put"}
        />
      </div>

      {/* Greeks */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Call Delta"
          value={results.call_delta}
          format={formatPercent}
        />
        <MetricCard
          label="Put Delta"
          value={results.put_delta}
          format={formatPercent}
        />
        <MetricCard label="Gamma" value={results.gamma} />
        <div className="p-4 rounded-lg bg-gray-700/30 border-2 border-dashed border-gray-600">
          <div className="text-center text-gray-400">
            <span className="text-sm">More Greeks</span>
            <div className="text-xs mt-1">Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Greeks Explanation */}
      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Greeks Explanation
        </h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            <strong>Delta:</strong> Price sensitivity to underlying asset price
            changes
          </p>
          <p>
            <strong>Gamma:</strong> Rate of change of delta
          </p>
        </div>
      </div>
    </div>
  );
}
