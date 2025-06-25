import { CalculationRequest, ParameterConfig } from "@/types";
import { PARAMETER_CONFIGS } from "@/lib/constants";
import { useState } from "react";

interface ParameterControlsProps {
  parameters: CalculationRequest;
  onChange: (parameters: CalculationRequest) => void;
  disabled?: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  config: ParameterConfig;
  disabled?: boolean;
}

function ParameterSlider({
  label,
  value,
  onChange,
  config,
  disabled,
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(config.min, Math.min(config.max, numValue));
      onChange(clampedValue);
      setLocalValue(clampedValue.toString());
    } else {
      setLocalValue(value.toString());
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-5">
        <label className="block text-sm font-medium text-gray-200 truncate">
          {label}
        </label>
        <p className="text-xs text-gray-400 truncate">{config.description}</p>
      </div>
      <div className="col-span-4">
        <input
          type="number"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={config.min}
          max={config.max}
          step={config.step}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-gray-200 focus:border-blue-400 focus:outline-none disabled:opacity-50"
        />
      </div>
      <div className="col-span-3">
        <span className="text-sm text-gray-300">
          {config.format ? config.format(parseFloat(localValue) || 0) : ""}
        </span>
      </div>
    </div>
  );
}

export default function ParameterControls({
  parameters,
  onChange,
  disabled = false,
}: ParameterControlsProps) {
  const updateParameter = (key: keyof CalculationRequest, value: number) => {
    onChange({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-fit">
      <h2 className="text-xl font-bold text-gray-100 mb-6">
        Option Parameters
      </h2>

      <div className="space-y-4 w-full">
        {Object.entries(PARAMETER_CONFIGS).map(([key, config]) => (
          <ParameterSlider
            key={key}
            label={config.label}
            value={parameters[key as keyof CalculationRequest]}
            onChange={(value) =>
              updateParameter(key as keyof CalculationRequest, value)
            }
            config={config}
            disabled={disabled}
          />
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-600">
        <button
          onClick={() =>
            onChange(
              Object.entries(PARAMETER_CONFIGS).reduce((acc, [key, config]) => {
                acc[key as keyof CalculationRequest] = config.default;
                return acc;
              }, {} as CalculationRequest)
            )
          }
          disabled={disabled}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
