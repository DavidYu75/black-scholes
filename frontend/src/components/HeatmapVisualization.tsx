import { HeatmapResponse, OptionType } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { BarChart3, Download } from 'lucide-react';

interface HeatmapProps {
  data: HeatmapResponse | null;
  selectedOptionType: OptionType;
  isLoading?: boolean;
}

type ViewPerspective = 'buyer' | 'seller';

export default function HeatmapVisualization({ data, selectedOptionType, isLoading = false }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; value: number; spot: number; vol: number } | null>(null);
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('seller');

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions with margins for labels
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get price data
    const prices = selectedOptionType === 'call' ? data.call_prices : data.put_prices;
    const spotValues = data.spot_values;
    const volValues = data.volatility_values;
    
    // Calculate plot area
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    // Find min and max values for better color scaling
    const allPrices = prices.flat();
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Calculate cell dimensions
    const cellWidth = plotWidth / prices[0].length;
    const cellHeight = plotHeight / prices.length;

    // Draw heatmap cells
    prices.forEach((row, i) => {
      row.forEach((price, j) => {
        const x = margin.left + j * cellWidth;
        const y = margin.top + i * cellHeight;
        
        // Better color mapping with green/red scheme
        let normalized = (price - minPrice) / priceRange;
        
        // Invert colors for buyer's view (lower prices = better = green)
        if (viewPerspective === 'buyer') {
          normalized = 1 - normalized;
        }
        
        // Use green-to-red color scheme for both call and put options
        // Green = better, Red = worse (regardless of option type)
        const intensity = Math.pow(normalized, 0.7); // Gamma correction for better visibility

        // Create gradient from red (worse) to green (better)
        // Hue: 0 = red, 120 = green
        const hue = intensity * 120; // 0-120 range for red to green
        const saturation = 70 + intensity * 30; // 70-100% saturation
        const lightness = 35 + intensity * 25; // 35-60% lightness

        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Add subtle grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      });
    });

    // Draw axes and labels
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis (Spot Price) labels
    const xAxisY = margin.top + plotHeight + 15;
    const numXLabels = Math.min(6, spotValues.length);
    for (let i = 0; i < numXLabels; i++) {
      const index = Math.floor(i * (spotValues.length - 1) / (numXLabels - 1));
      const x = margin.left + (index * plotWidth) / (spotValues.length - 1);
      const label = `$${spotValues[index].toFixed(0)}`;
      ctx.fillText(label, x, xAxisY);
    }

    // Y-axis (Volatility) labels
    ctx.textAlign = 'right';
    const numYLabels = Math.min(6, volValues.length);
    for (let i = 0; i < numYLabels; i++) {
      const index = Math.floor(i * (volValues.length - 1) / (numYLabels - 1));
      const y = margin.top + (index * plotHeight) / (volValues.length - 1) + 4;
      const label = `${(volValues[volValues.length - 1 - index] * 100).toFixed(0)}%`;
      ctx.fillText(label, margin.left - 10, y);
    }

    // Axis titles
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis title
    ctx.fillText('Spot Price ($)', width / 2, height - 15);
    
    // Y-axis title (rotated)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Volatility (%)', 0, 0);
    ctx.restore();

    // Color scale legend
    const legendWidth = 20;
    const legendHeight = 120;
    const legendX = width - margin.right + 20;
    const legendY = margin.top + (plotHeight - legendHeight) / 2;

    // Draw legend gradient (green to red scheme)
    const gradient = ctx.createLinearGradient(0, legendY + legendHeight, 0, legendY);
    
    if (viewPerspective === 'buyer') {
      // For buyers: Green (top) = good (low prices), Red (bottom) = bad (high prices)
      gradient.addColorStop(0, 'hsl(0, 85%, 45%)');    // Red = worse (high prices)
      gradient.addColorStop(1, 'hsl(120, 85%, 45%)');  // Green = better (low prices)
    } else {
      // For sellers: Green (top) = good (high prices), Red (bottom) = bad (low prices)
      gradient.addColorStop(0, 'hsl(0, 85%, 45%)');    // Red = worse (low prices)
      gradient.addColorStop(1, 'hsl(120, 85%, 45%)');  // Green = better (high prices)
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Legend border
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels (adjust based on perspective)
    ctx.fillStyle = '#d1d5db';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    
    if (viewPerspective === 'buyer') {
      ctx.fillText('Better', legendX + legendWidth + 5, legendY + 5);
      ctx.fillText(`${minPrice.toFixed(2)}`, legendX + legendWidth + 5, legendY + 15);
      ctx.fillText('Worse', legendX + legendWidth + 5, legendY + legendHeight - 5);
      ctx.fillText(`${maxPrice.toFixed(2)}`, legendX + legendWidth + 5, legendY + legendHeight + 10);
    } else {
      ctx.fillText('Better', legendX + legendWidth + 5, legendY + 5);
      ctx.fillText(`${maxPrice.toFixed(2)}`, legendX + legendWidth + 5, legendY + 15);
      ctx.fillText('Worse', legendX + legendWidth + 5, legendY + legendHeight - 5);
      ctx.fillText(`${minPrice.toFixed(2)}`, legendX + legendWidth + 5, legendY + legendHeight + 10);
    }

  }, [data, selectedOptionType, viewPerspective]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const plotWidth = rect.width - margin.left - margin.right;
    const plotHeight = rect.height - margin.top - margin.bottom;

    // Check if mouse is within plot area
    if (x < margin.left || x > margin.left + plotWidth || 
        y < margin.top || y > margin.top + plotHeight) {
      setHoveredCell(null);
      return;
    }

    const prices = selectedOptionType === 'call' ? data.call_prices : data.put_prices;
    const cellWidth = plotWidth / prices[0].length;
    const cellHeight = plotHeight / prices.length;

    const col = Math.floor((x - margin.left) / cellWidth);
    const row = Math.floor((y - margin.top) / cellHeight);

    if (row >= 0 && row < prices.length && col >= 0 && col < prices[0].length) {
      setHoveredCell({
        x: col,
        y: row,
        value: prices[row][col],
        spot: data.spot_values[col],
        vol: data.volatility_values[data.volatility_values.length - 1 - row] // Flip Y axis
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${selectedOptionType}-option-heatmap.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Price Sensitivity Heatmap</h3>
        <div className="text-center text-gray-400 py-12">
          <BarChart3 className="mx-auto w-12 h-12 mb-4 opacity-50" />
          <p>Generate heatmap to visualize price sensitivity</p>
          <p className="text-sm mt-2">Shows how option prices change with spot price and volatility</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          {selectedOptionType === 'call' ? 'Call' : 'Put'} Option Price Heatmap
        </h3>
        <div className="flex items-center gap-4">
          {/* Perspective Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewPerspective('buyer')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewPerspective === 'buyer'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Buyer&apos;s View
            </button>
            <button
              onClick={() => setViewPerspective('seller')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewPerspective === 'seller'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Seller&apos;s View
            </button>
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Perspective Explanation */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>{viewPerspective === 'buyer' ? "Buyer's View" : "Seller's View"}:</strong>{' '}
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            <span>Green = Better</span>
          </span>
          {' • '}
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            <span>Red = Worse</span>
          </span>
          {' • '}
          {viewPerspective === 'buyer' 
            ? "Green areas show lower prices (better for buyers)"
            : "Green areas show higher prices (better for sellers)"
          }
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-96 bg-gray-900 rounded border border-gray-600 cursor-crosshair"
        />

        {/* Enhanced Tooltip */}
        {hoveredCell && (
          <div 
            className="absolute bg-gray-900 border border-gray-500 rounded-lg p-3 text-sm text-gray-200 pointer-events-none z-10 shadow-lg"
            style={{
              left: '10px',
              top: '10px',
            }}
          >
            <div className="font-semibold text-white mb-1">
              {selectedOptionType === 'call' ? 'Call' : 'Put'} Option Price
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Spot Price:</span>
                <span className="font-mono">${hoveredCell.spot.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility:</span>
                <span className="font-mono">{(hoveredCell.vol * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-1">
                <span className="text-gray-400">Price:</span>
                <span className="font-mono font-bold text-blue-400">
                  ${hoveredCell.value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-4 text-sm text-gray-400">
        <p>
          This heatmap shows how the {selectedOptionType} option price varies with different spot prices (X-axis) 
          and volatility levels (Y-axis) from a <strong>{viewPerspective}&apos;s perspective</strong>.
        </p>
        <p className="mt-2">
          <span className="text-green-400 font-semibold">Green areas</span> indicate {viewPerspective === 'buyer' ? 'lower prices (better deals)' : 'higher prices (better income)'}, 
          while <span className="text-red-400 font-semibold">red areas</span> indicate {viewPerspective === 'buyer' ? 'higher prices (expensive)' : 'lower prices (less income)'}.
        </p>
      </div>
    </div>
  );
}
