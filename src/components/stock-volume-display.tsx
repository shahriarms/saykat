
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockVolumeDisplayProps {
  productName: string;
  currentStock: number;
  totalSold: number;
  maxStock: number;
  unit: string;
}

export const StockVolumeDisplay: React.FC<StockVolumeDisplayProps> = ({
  productName,
  currentStock,
  totalSold,
  maxStock,
  unit,
}) => {
  const fillPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
  
  const formatValue = (value: number) => value.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 2 : 0,
      maximumFractionDigits: unit === 'kg' ? 2 : 0,
  });

  const indicatorColor = React.useMemo(() => {
    if (fillPercentage < 20) return '#ef4444'; // red-500
    if (fillPercentage < 60) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  }, [fillPercentage]);

  const containerHeight = 160; // h-40 in pixels
  const indicatorHeight = (containerHeight * fillPercentage) / 100;
  
  // Adjust lineY if the indicator is near the top to prevent clipping
  const adjustedFillPercentage = Math.min(fillPercentage, 95);
  const lineY = containerHeight - (containerHeight * adjustedFillPercentage / 100);
  

  return (
    <div className="relative w-full flex flex-col items-center justify-end gap-2 pt-2 h-[260px] overflow-visible">
        
        {/* Main container */}
        <div 
            className="relative w-24 h-40 rounded-t-lg bg-gray-200/50 border-2 border-gray-300/70"
            style={{
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
            }}
        >
            {/* Top Rim */}
            <div 
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[105%] h-3 rounded-[50%] border-2 border-gray-400/60 bg-gray-300/50"
                style={{ content: '""' }}
            ></div>
            
            {/* Inner colored box representing stock level */}
            <div 
                className="absolute bottom-0 left-0 w-full"
                style={{ 
                    height: `${indicatorHeight}px`,
                    backgroundColor: indicatorColor,
                    transition: 'height 0.5s ease-in-out, background-color 0.5s ease-in-out',
                }}
            ></div>
            
            {/* Bottom Base */}
            <div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[105%] h-2 rounded-[50%] bg-gray-300/70 border-2 border-gray-400/50"
                style={{ content: '""' }}
            ></div>

            {/* Glare effect */}
            <div className="absolute top-0 left-2 w-4 h-full rounded-full bg-white/20 -skew-x-12"></div>
            
            {/* Floating label and connecting line */}
             <div 
                className="absolute left-full top-0 w-px h-px"
                style={{
                    transform: `translateY(${lineY}px)`,
                    transition: 'transform 0.5s ease-in-out',
                    overflow: 'visible',
                    zIndex: 10
                }}
            >
                <div className="absolute left-0 top-0 h-px" style={{ width: '20px', backgroundColor: indicatorColor }} />
                <div className="absolute left-[20px] top-[-20px] w-px" style={{ height: '20px', backgroundColor: indicatorColor }} />
                <div className="absolute text-sm font-semibold whitespace-nowrap" style={{ left: '25px', top: '-38px', color: indicatorColor }}>
                    {formatValue(currentStock)}{unit}
                </div>
            </div>
        </div>
        
        {/* Flat paper-like shadow */}
        <div className="w-28 h-2 bg-gray-300/60 rounded-full blur-sm" />
        
        {/* Labels: Total Size and Product Name */}
        <div className="text-center pt-1">
             <p className="text-xs text-gray-500">
                Stock Size: {formatValue(maxStock)} {unit}
            </p>
            <p className="text-sm font-semibold text-gray-700 h-10 flex items-start pt-1">
                {productName}
            </p>
        </div>
    </div>
  );
};
