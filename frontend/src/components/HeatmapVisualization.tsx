import { HeatmapResponse, OptionType } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { useHeatmapCanvas, HoveredCell } from '@/hooks/useHeatmapCanvas';

type ViewPerspective = 'buyer' | 'seller';

interface HeatmapProps {
  data: HeatmapResponse | null;
  selectedOptionType: OptionType;
  isLoading?: boolean;
}

export default function HeatmapVisualization({ data, selectedOptionType, isLoading = false }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('seller');
  
  const { drawHeatmap, getHoveredCell, exportToImage } = useHeatmapCanvas(
    canvasRef,
    data,
    selectedOptionType,
    viewPerspective
  );

  // Handle canvas drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    drawHeatmap(canvasRef.current);
  }, [drawHeatmap]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      drawHeatmap(canvasRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawHeatmap]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = getHoveredCell(x, y);
    setHoveredCell(cell);
  }, [data, getHoveredCell]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleExport = useCallback(() => {
    exportToImage(`${selectedOptionType}-option-heatmap.png`);
  }, [exportToImage, selectedOptionType]);

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
