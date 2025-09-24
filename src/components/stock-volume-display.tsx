
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

  const containerHeight = 160; // h-40 -> 160px
  const indicatorHeight = (containerHeight * fillPercentage) / 100;
  const lineY = containerHeight - indicatorHeight;

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-2 pt-2 h-[260px]">
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
        </div>
        
        {/* Total Stock Size Label */}
        <p className="text-xs text-gray-500 mt-1">
            Stock Size: {formatValue(maxStock)} {unit}
        </p>

        {/* Floating label and connecting line, only if there is stock */}
        {fillPercentage > 0 && (
             <div 
                className="absolute top-[80px] left-1/2 w-[180px] h-px"
                style={{
                    transform: `translateY(${lineY}px)`,
                    transition: 'transform 0.5s ease-in-out',
                }}
            >
               {/* Horizontal line part */}
               <div
                  className="absolute left-[-20px] top-0 h-px"
                  style={{
                      width: '80px',
                      backgroundColor: indicatorColor,
                  }}
               />
               {/* Vertical line part */}
               <div
                  className="absolute left-[60px] top-[-10px] w-px"
                  style={{
                      height: '10px',
                      backgroundColor: indicatorColor,
                  }}
               />
               {/* Text Label */}
               <div 
                    className="absolute text-sm font-semibold whitespace-nowrap"
                    style={{ left: '65px', top: '-28px', color: indicatorColor }}
                >
                    Remaining: {formatValue(currentStock)}{unit}
                </div>
            </div>
        )}
    </div>
  );
};
