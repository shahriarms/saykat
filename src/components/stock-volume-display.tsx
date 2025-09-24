
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockVolumeDisplayProps {
  productName: string;
  currentStock: number;
  maxStock: number;
  unit: string;
}

export const StockVolumeDisplay: React.FC<StockVolumeDisplayProps> = ({
  productName,
  currentStock,
  maxStock,
  unit,
}) => {
  const fillPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
  
  const formatValue = (value: number) => value.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
  });

  const indicatorColor = React.useMemo(() => {
    if (fillPercentage < 20) return '#ef4444'; // red-500
    if (fillPercentage < 60) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  }, [fillPercentage]);

  // SVG path calculation
  const startY = 160 - (160 * fillPercentage / 100); // 160 is the height of the container
  const pathD = `M 40 ${startY} C 60 ${startY}, 80 ${startY - 20}, 120 ${startY - 20}`;


  return (
    <div className="relative w-full flex flex-col items-center justify-center gap-2 pt-2 h-[260px]">
        {/* Product Name */}
        <p className="text-sm font-semibold text-gray-700 absolute top-0 left-1/2 -translate-x-1/2">
            {productName}
        </p>

        {/* Main container */}
        <div className="relative w-20 h-40 bg-gray-200 rounded-lg mt-6">
            {/* Inner colored box representing stock level */}
            <div 
                className="absolute bottom-0 left-0 w-full rounded-lg"
                style={{ 
                    height: `${fillPercentage}%`,
                    backgroundColor: indicatorColor,
                    transition: 'height 0.5s ease-in-out, background-color 0.5s ease-in-out',
                }}
            ></div>
        </div>
        
        {/* Total Stock Size Label */}
        <p className="text-xs text-gray-500 mt-1">
            stock size: {formatValue(maxStock)} {unit}
        </p>

        {/* Floating label and connecting line */}
        {fillPercentage > 1 && (
             <div 
                className="absolute top-[88px] left-1/2" // Position relative to the container's top
                style={{ 
                    transform: `translateY(${startY - 160}px)`, // Move the whole group up
                    transition: 'transform 0.5s ease-in-out',
                }}
            >
                <svg width="150" height="40" className="absolute" style={{ overflow: 'visible', left: '-10px', top: '-25px' }}>
                    <path 
                        d={pathD}
                        stroke={indicatorColor} 
                        strokeWidth="2" 
                        fill="none" 
                    />
                </svg>
                <div 
                    className="absolute text-sm font-semibold"
                    style={{ left: '115px', top: `${startY - 35}px`, color: indicatorColor }}
                >
                    {formatValue(currentStock)}{unit}
                </div>
            </div>
        )}
    </div>
  );
};
