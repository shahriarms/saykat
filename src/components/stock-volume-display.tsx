
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
  const fillPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
  
  const formattedStock = (value: number) => value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
  });

  const waveColor = '#22c5e5'; // cyan-500

  const scaleMarkers = React.useMemo(() => {
    if (maxStock <= 0) return [];
    const markers = [];
    const steps = [25, 50, 75]; // Percentages for markers
    for (const step of steps) {
        if (step < (fillPercentage + 10) && step > (fillPercentage -10)) continue; // Avoid overlap with current level
        if (step < 95 && step > 5) {
             markers.push({
                percentage: step,
                value: formattedStock((maxStock * step) / 100),
            });
        }
    }
    return markers;
  }, [maxStock, fillPercentage]);


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
        
        <div className="text-center text-gray-800 font-bold drop-shadow-sm pointer-events-none">
            <div className="text-xl">{formattedStock(currentStock)}</div>
            <div className="text-xs uppercase text-gray-700">{unit}</div>
        </div>

        <div className="w-full flex items-center justify-center gap-2">
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

            {/* Scale Indicator */}
            <div className="relative h-32 w-16 text-xs text-muted-foreground font-medium">
                {/* Full and Empty Labels */}
                <div className="absolute -top-1 right-0 text-right w-full">
                    <p className="font-semibold">Full</p>
                    <p className="font-mono -mt-1">{formattedStock(maxStock)}</p>
                </div>
                <p className="absolute -bottom-1 right-0 text-right font-semibold w-full">Empty</p>

                {/* Dynamic Markers */}
                {scaleMarkers.map(marker => (
                    <div key={marker.percentage} className="absolute right-0 text-right w-full" style={{ bottom: `calc(${marker.percentage}% - 6px)`}}>
                       <span className="font-mono">{marker.value}</span>
                    </div>
                ))}
                
                {/* Current Level Floating Marker */}
                {fillPercentage > 5 && fillPercentage < 95 && (
                     <div className="absolute right-0 text-right w-full" style={{ bottom: `calc(${fillPercentage}% - 6px)`}}>
                        <span className="font-mono font-bold text-primary bg-background/80 px-1 rounded">{formattedStock(currentStock)}</span>
                     </div>
                )}
            </div>
        </div>
    </div>
  );
};
