
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
  
  // Calculate the Y position for the line and label based on the indicator height.
  // The 'top' position will be relative to the container.
  // When indicatorHeight is 0, lineY should be at the bottom (160).
  // When indicatorHeight is 160, lineY should be at the top (0).
  const lineY = containerHeight - indicatorHeight;

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-2 pt-2 h-[260px] overflow-visible">
        {/* Product Name */}
        <p className="text-sm font-semibold text-gray-700 text-center h-10 flex items-center">
            {productName}
        </p>

        {/* Main container */}
        <div className="relative w-20 h-40 bg-gray-200 rounded-lg mt-1">
            {/* Inner colored box representing stock level */}
            <div 
                className="absolute bottom-0 left-0 w-full rounded-lg"
                style={{ 
                    height: `${indicatorHeight}px`,
                    backgroundColor: indicatorColor,
                    transition: 'height 0.5s ease-in-out, background-color 0.5s ease-in-out',
                }}
            ></div>
            
            {/* Floating label and connecting line, only if there is stock */}
             {fillPercentage > 0 && (
                <div 
                    className="absolute left-full top-0 w-px h-px"
                    style={{
                        transform: `translateY(${lineY}px)`,
                        transition: 'transform 0.5s ease-in-out',
                        overflow: 'visible',
                        zIndex: 10
                    }}
                >
                    {/* Horizontal part of the root sign */}
                    <div
                        className="absolute left-0 top-0 h-px"
                        style={{
                            width: '20px',
                            backgroundColor: indicatorColor,
                        }}
                    />
                    {/* Vertical part of the root sign */}
                    <div
                        className="absolute left-[20px] top-[-20px] w-px"
                        style={{
                            height: '20px',
                            backgroundColor: indicatorColor,
                        }}
                    />
                    {/* The value label */}
                    <div 
                        className="absolute text-sm font-semibold whitespace-nowrap"
                        style={{ left: '25px', top: '-38px', color: indicatorColor }}
                    >
                        {formatValue(currentStock)}{unit}
                    </div>
                </div>
            )}
        </div>
        
        {/* Total Stock Size Label */}
        <p className="text-xs text-gray-500 mt-1">
            Stock Size: {formatValue(maxStock)} {unit}
        </p>
    </div>
  );
};
