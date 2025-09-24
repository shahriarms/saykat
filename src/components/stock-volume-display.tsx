
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
  
  const formattedStock = currentStock.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 1 : 0,
      maximumFractionDigits: unit === 'kg' ? 2 : 0,
  });

  const waveColor = '#38bdf8'; // A nice, friendly blue color like the image.

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
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            overflow: hidden;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
          .wave {
            background: ${waveColor};
            border-radius: 40%;
            position: absolute;
            width: 200%;
            height: 200%;
            left: -50%;
            opacity: 0.6;
            animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
          }
          .wave.two {
            animation: wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite;
            opacity: 0.9;
            bottom: -10%;
          }
        `}
      </style>
      
      {/* Tank body - transparent glass effect */}
      <div className={cn("w-full h-full rounded-lg border-2 border-gray-300 bg-gray-200/30 shadow-inner relative overflow-hidden")}>
         {/* Liquid fill container */}
        <div 
          className="wave-container"
          style={{ 
            height: `${fillPercentage}%`,
          }}
        >
            <div className="wave" style={{bottom: '-150%'}}></div>
            <div className="wave two" style={{bottom: '-125%'}}></div>
        </div>
      </div>
      
      {/* Tank top lid for 3D effect */}
      <div className={cn("absolute top-0 left-1/2 w-full h-3 rounded-t-full -translate-x-1/2 bg-gray-200/70 border-2 border-b-0 border-gray-300")}></div>
      
      {/* Text Display */}
      <div className="absolute z-10 text-center text-gray-800 font-bold drop-shadow-sm pointer-events-none">
        <div className="text-xl">{formattedStock}</div>
        <div className="text-xs uppercase text-gray-700">{unit}</div>
      </div>
    </div>
  );
};
