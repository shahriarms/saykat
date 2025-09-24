
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockVolumeDisplayProps {
  currentStock: number; // This will now represent the 'sold' amount
  maxStock: number; // This will now represent the 'total ever added' amount
  unit: string;
}

export const StockVolumeDisplay: React.FC<StockVolumeDisplayProps> = ({
  currentStock,
  maxStock,
  unit,
}) => {
  // The fill percentage now represents the proportion of SOLD items
  const fillPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;

  const getColorClass = () => {
    // Colors now represent how much is sold. High percentage is "good" for sales.
    if (fillPercentage > 80) return 'text-green-500'; // Mostly sold
    if (fillPercentage > 40) return 'text-yellow-500'; // Partially sold
    return 'text-blue-500'; // Not much sold
  };
  
  const formattedStock = currentStock.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 1 : 0,
      maximumFractionDigits: unit === 'kg' ? 2 : 0,
  });

  return (
    <div className="relative w-24 h-32 flex items-center justify-center">
      {/* Tank body */}
      <div className={cn("w-full h-full rounded-lg border-4 shadow-inner", getColorClass().replace('text', 'border'))}>
        {/* Liquid fill */}
        <div 
          className={cn("absolute bottom-0 left-0 right-0 w-full transition-all duration-500 ease-in-out", getColorClass().replace('text', 'bg'))}
          style={{ 
            height: `${fillPercentage}%`,
            opacity: 0.6
          }}
        ></div>
        
        {/* Top liquid surface */}
        <div 
            className={cn("absolute left-1/2 w-[90%] h-2 rounded-full -translate-x-1/2 transition-all duration-500 ease-in-out", getColorClass().replace('text', 'bg'))}
            style={{ 
                bottom: `calc(${fillPercentage}% - 4px)`,
                opacity: 0.8
            }}
        ></div>
      </div>
      
      {/* Tank top lid */}
      <div className={cn("absolute -top-1 left-1/2 w-[105%] h-3 rounded-full -translate-x-1/2 bg-gray-300 border-2", getColorClass().replace('text', 'border'))}></div>
      
      {/* Tank bottom */}
       <div className={cn("absolute -bottom-1 left-1/2 w-[105%] h-3 rounded-full -translate-x-1/2 bg-gray-200 border-2", getColorClass().replace('text', 'border'))}></div>

      {/* Text Display */}
      <div className="relative z-10 text-center text-gray-800 font-bold drop-shadow-sm">
        <div className="text-xl">{formattedStock}</div>
        <div className="text-xs uppercase">Sold</div>
      </div>
    </div>
  );
};
