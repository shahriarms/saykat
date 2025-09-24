
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
  const fillPercentage = maxStock > 0 ? Math.min((currentStock / maxStock) * 100, 100) : 0;

  const getColorClass = (type: 'bg' | 'border' | 'text') => {
    if (fillPercentage > 80) return `${type}-green-500`; // Mostly sold
    if (fillPercentage > 40) return `${type}-yellow-500`; // Partially sold
    return `${type}-blue-500`; // Not much sold
  };

  const formattedStock = currentStock.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 1 : 0,
      maximumFractionDigits: unit === 'kg' ? 2 : 0,
  });
  
  const waveColor = fillPercentage > 80 ? '#22c55e' : fillPercentage > 40 ? '#eab308' : '#3b82f6';

  return (
    <div className="relative w-24 h-32 flex items-center justify-center">
       <style>
        {`
          @keyframes wave {
            0% { transform: translateX(0); }
            50% { transform: translateX(-25%); }
            100% { transform: translateX(0); }
          }
          .wave {
            background: ${waveColor};
            border-radius: 40%;
            position: absolute;
            width: 200%;
            height: 200%;
            bottom: 0;
            left: -50%;
            opacity: 0.5;
            animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
          }
          .wave.two {
            animation: wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite,
                       swell 7s ease -1.25s infinite;
            opacity: 0.8;
          }
          @keyframes swell {
            0%, 100% { transform: translate3d(0,-2px,0); }
            50% { transform: translate3d(0,2px,0); }
          }
        `}
      </style>
      
      {/* Tank body */}
      <div className={cn("w-full h-full rounded-lg border-4 shadow-inner relative overflow-hidden", getColorClass('border'))}>
        {/* Liquid fill container */}
        <div 
          className={cn("absolute bottom-0 left-0 right-0 w-full transition-all duration-500 ease-in-out")}
          style={{ 
            height: `${fillPercentage}%`,
          }}
        >
            <div className="wave" style={{bottom: '-150%'}}></div>
            <div className="wave two" style={{bottom: '-125%'}}></div>
        </div>
      </div>
      
      {/* Tank top lid */}
      <div className={cn("absolute -top-1 left-1/2 w-[105%] h-3 rounded-full -translate-x-1/2 bg-gray-300 border-2", getColorClass('border'))}></div>
      
      {/* Tank bottom */}
       <div className={cn("absolute -bottom-1 left-1/2 w-[105%] h-3 rounded-full -translate-x-1/2 bg-gray-200 border-2", getColorClass('border'))}></div>

      {/* Text Display */}
      <div className="relative z-10 text-center text-gray-800 font-bold drop-shadow-sm">
        <div className="text-xl">{formattedStock}</div>
        <div className="text-xs uppercase">Sold</div>
      </div>
    </div>
  );
};
