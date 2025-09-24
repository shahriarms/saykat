
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockVolumeDisplayProps {
  currentStock: number;
  maxStock: number;
  unit: string;
}

export const StockVolumeDisplay: React.FC<StockVolumeDisplayProps> = ({
  currentStock,
  maxStock,
  unit,
}) => {
  const fillPercentage = maxStock > 0 ? Math.min((currentStock / maxStock) * 100, 100) : 0;

  const getColorClass = (type: 'bg' | 'border' | 'text' | 'wave') => {
    if (fillPercentage < 20) return type === 'wave' ? '#ef4444' : `${type}-red-500`; // Low stock
    if (fillPercentage < 60) return type === 'wave' ? '#f59e0b' : `${type}-amber-500`; // Medium stock
    return type === 'wave' ? '#22c55e' : `${type}-green-500`; // Healthy stock
  };

  const formattedStock = currentStock.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 1 : 0,
      maximumFractionDigits: unit === 'kg' ? 2 : 0,
  });

  const waveColor = getColorClass('wave');

  return (
    <div className="relative w-24 h-32 flex items-center justify-center">
       <style>
        {`
          @keyframes wave {
            0% { transform: translateX(0) translateZ(0) scaleY(1); }
            50% { transform: translateX(-25%) translateZ(0) scaleY(0.95); }
            100% { transform: translateX(0) translateZ(0) scaleY(1); }
          }
          .wave-container {
            transition: height 0.5s ease-in-out;
          }
          .wave {
            background: ${waveColor};
            border-radius: 40%;
            position: absolute;
            width: 200%;
            height: 200%;
            bottom: 0;
            left: -50%;
            opacity: 0.6;
            animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
          }
          .wave.two {
            animation: wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite;
            opacity: 0.8;
            bottom: -10%;
          }
        `}
      </style>
      
      {/* Tank body */}
      <div className={cn("w-full h-full rounded-lg border-4 shadow-inner relative overflow-hidden bg-gray-200/50", getColorClass('border'))}>
        {/* Liquid fill container */}
        <div 
          className={cn("wave-container absolute bottom-0 left-0 right-0 w-full")}
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
        <div className="text-xs uppercase">{unit}</div>
      </div>
    </div>
  );
};
