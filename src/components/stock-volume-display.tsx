
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';


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
  const lineAndLabelY = fillPercentage > 50 ? indicatorHeight - 30 : indicatorHeight + 10;
  

  return (
    <div className="relative w-full flex flex-col items-center justify-end gap-2 pt-2 h-full overflow-visible">
        
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
                className="absolute bottom-0 left-0 w-full overflow-hidden"
                style={{ 
                    height: `${indicatorHeight}px`,
                    backgroundColor: indicatorColor,
                    transition: 'height 0.5s ease-in-out, background-color 0.5s ease-in-out',
                }}
            >
                 {/* Animated Waves */}
                <div className="absolute -bottom-1 left-0 w-full h-4">
                    <div 
                        className="absolute w-[200%] h-full bg-white/20 rounded-[45%] "
                        style={{
                            animation: 'wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
                            transform: 'translate3d(0, 0, 0)',
                            left: '-100%',
                            bottom: 0,
                        }}
                    />
                    <div 
                        className="absolute w-[200%] h-full bg-white/10 rounded-[40%] "
                        style={{
                            animation: 'wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 7s ease -1.25s infinite',
                            transform: 'translate3d(0, 0, 0)',
                             left: '-100%',
                            bottom: 0,
                        }}
                    />
                </div>
            </div>
            
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
                    transform: `translateY(${lineAndLabelY}px)`,
                    transition: 'transform 0.5s ease-in-out',
                    overflow: 'visible',
                    zIndex: 10
                }}
            >
                <svg width="60" height="40" viewBox="0 0 60 40" className="absolute -top-5 -left-px overflow-visible">
                   <path 
                     d="M 0,20 Q 20,20 30,10"
                     stroke={indicatorColor}
                     fill="none"
                     strokeWidth="2"
                     markerEnd="url(#arrowhead)"
                   />
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
                            <polygon points="0 0, 5 1.75, 0 3.5" fill={indicatorColor} />
                        </marker>
                    </defs>
                </svg>
                <div className="absolute text-sm font-semibold whitespace-nowrap" style={{ left: '35px', top: '-18px', color: indicatorColor }}>
                    {formatValue(currentStock)}{unit}
                </div>
            </div>
        </div>
        
        {/* Base Platform */}
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
