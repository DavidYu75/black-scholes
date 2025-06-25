import { RefObject, useCallback } from 'react';
import { HeatmapResponse, OptionType } from '@/types';

type ViewPerspective = 'buyer' | 'seller';

interface DrawHeatmapParams {
  canvas: HTMLCanvasElement;
  data: HeatmapResponse;
  optionType: OptionType;
  viewPerspective: ViewPerspective;
}

export interface HoveredCell {
  x: number;
  y: number;
  value: number;
  spot: number;
  vol: number;
}

export const useHeatmapCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  data: HeatmapResponse | null,
  optionType: OptionType,
  viewPerspective: ViewPerspective
) => {
  const drawHeatmap = useCallback(({ canvas, data, optionType, viewPerspective }: DrawHeatmapParams) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions with margins for labels
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Set canvas resolution for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get price data
    const prices = optionType === 'call' ? data.call_prices : data.put_prices;
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
        
        // Invert colors for buyer's view (lower prices = better = green)
        let normalized = (price - minPrice) / priceRange;
        if (viewPerspective === 'buyer') {
          normalized = 1 - normalized;
        }
        
        // Color calculation
        const intensity = Math.pow(normalized, 0.7);
        const hue = intensity * 120; // 0-120 range for red to green
        const saturation = 70 + intensity * 30;
        const lightness = 35 + intensity * 25;
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        // Draw cell
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
      ctx.fillText(`$${spotValues[index].toFixed(0)}`, x, xAxisY);
    }

    // Y-axis (Volatility) labels
    ctx.textAlign = 'right';
    const numYLabels = Math.min(6, volValues.length);
    for (let i = 0; i < numYLabels; i++) {
      const index = Math.floor(i * (volValues.length - 1) / (numYLabels - 1));
      const y = margin.top + (index * plotHeight) / (volValues.length - 1) + 4;
      ctx.fillText(`${(volValues[volValues.length - 1 - index] * 100).toFixed(0)}%`, margin.left - 10, y);
    }

    // Axis titles
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 14px sans-serif';
    
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

    // Draw legend gradient
    const gradient = ctx.createLinearGradient(0, legendY + legendHeight, 0, legendY);
    
    if (viewPerspective === 'buyer') {
      gradient.addColorStop(0, 'hsl(0, 85%, 45%)');
      gradient.addColorStop(1, 'hsl(120, 85%, 45%)');
    } else {
      gradient.addColorStop(0, 'hsl(0, 85%, 45%)');
      gradient.addColorStop(1, 'hsl(120, 85%, 45%)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Legend border
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels
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

    return { minPrice, maxPrice };
  }, []);

  const getHoveredCell = useCallback((x: number, y: number, data: HeatmapResponse, optionType: OptionType): HoveredCell | null => {
    if (!canvasRef.current) return null;
    
    const prices = optionType === 'call' ? data.call_prices : data.put_prices;
    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const rect = canvasRef.current.getBoundingClientRect();
    const plotWidth = rect.width - margin.left - margin.right;
    const plotHeight = rect.height - margin.top - margin.bottom;

    // Check if mouse is within plot area
    if (x < margin.left || x > margin.left + plotWidth || 
        y < margin.top || y > margin.top + plotHeight) {
      return null;
    }

    const cellWidth = plotWidth / prices[0].length;
    const cellHeight = plotHeight / prices.length;
    const col = Math.floor((x - margin.left) / cellWidth);
    const row = Math.floor((y - margin.top) / cellHeight);

    if (row >= 0 && row < prices.length && col >= 0 && col < prices[0].length) {
      return {
        x: col,
        y: row,
        value: prices[row][col],
        spot: data.spot_values[col],
        vol: data.volatility_values[data.volatility_values.length - 1 - row] // Flip Y axis
      };
    }
    
    return null;
  }, [canvasRef]);

  const exportToImage = useCallback((fileName: string) => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, [canvasRef]);

  return {
    drawHeatmap: (canvas: HTMLCanvasElement) => 
      data && drawHeatmap({ canvas, data, optionType, viewPerspective }),
    getHoveredCell: (x: number, y: number) => 
      data ? getHoveredCell(x, y, data, optionType) : null,
    exportToImage: (fileName: string) => exportToImage(fileName)
  };
};
