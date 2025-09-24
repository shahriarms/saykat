
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
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
  });

  const waveColor = React.useMemo(() => {
    if (fillPercentage < 20) return '#ef4444'; // red-500
    if (fillPercentage < 60) return '#f59e0b'; // amber-500
    return '#22c5e5'; // cyan-500
  }, [fillPercentage]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center gap-2 pt-4">
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
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
          }
          .wave-shape {
            background: ${waveColor};
            border-radius: 40%;
            position: absolute;
            width: 200%;
            height: 200%;
            left: -50%;
            opacity: 0.6;
            animation: wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
          }
          .wave-shape.two {
            animation: wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite;
            opacity: 0.9;
            bottom: -10%;
          }
        `}
      </style>
      
      <div className="text-center h-10 mb-2">
        <p className="text-sm font-semibold truncate w-32" title={productName}>
            {productName}
        </p>
      </div>

       <div className="text-center text-xs text-muted-foreground w-full px-1">
        <span className="font-semibold text-foreground">{formatValue(totalSold)} {unit}</span> / {formatValue(maxStock)} {unit} occupied | <span className="font-semibold text-primary">{formatValue(currentStock)} {unit} available</span>
      </div>

      <div className="w-full flex items-center justify-center gap-2 mt-2">
          <div className="relative w-24 h-32">
              {/* Tank body - transparent glass effect */}
              <div className={cn(
                  "w-full h-full rounded-b-xl border-2 border-gray-300/80 border-t-0 relative overflow-hidden",
                  "bg-gradient-to-r from-gray-200/30 via-gray-100/10 to-gray-200/30"
                  )}>
                  {/* Liquid fill container */}
                  <div 
                  className="wave-container"
                  style={{ 
                      height: `${fillPercentage}%`,
                  }}
                  >
                      <div className="wave-shape" style={{bottom: '-150%'}}></div>
                      <div className="wave-shape two" style={{bottom: '-125%'}}></div>
                  </div>
              </div>
              
              {/* Tank top lid for 3D effect */}
              <div className="absolute top-0 left-0 w-full h-3 rounded-t-[50%] bg-gray-200/70 border-2 border-b-0 border-gray-300/80"></div>

              {/* Bottom base for 3D effect */}
              <div className="absolute bottom-0 left-0 w-full h-2 rounded-b-[50%] bg-gray-300/60 border-2 border-t-0 border-gray-300/80"></div>
          </div>
      </div>
    </div>
  );
};
