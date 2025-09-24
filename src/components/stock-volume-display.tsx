
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
  
  const lineY = containerHeight - indicatorHeight;

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-2 pt-2 h-[260px] overflow-visible">
        <p className="text-sm font-semibold text-gray-700 text-center h-10 flex items-center">
            {productName}
        </p>

        {/* Main container */}
        <div className="relative w-28 h-40 mt-1">
            {/* SVG Glass Container */}
            <svg width="100%" height="100%" viewBox="0 0 112 160" className="absolute top-0 left-0">
                <defs>
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.5}} />
                        <stop offset="20%" style={{stopColor: '#f0f0f0', stopOpacity: 0.2}} />
                        <stop offset="50%" style={{stopColor: '#e0e0e0', stopOpacity: 0.1}} />
                        <stop offset="80%" style={{stopColor: '#f0f0f0', stopOpacity: 0.2}} />
                        <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0.5}} />
                    </linearGradient>
                </defs>
                
                {/* Main Body */}
                <path d="M 6 10 C 6 10, 6 150, 6 150 C 6 157, 106 157, 106 150 C 106 150, 106 10, 106 10" fill="url(#glassGradient)" stroke="#cccccc" strokeWidth="0.5"/>

                {/* Bottom Base */}
                <ellipse cx="56" cy="150" rx="50" ry="8" fill="#d1d5db" opacity="0.6"/>
                <ellipse cx="56" cy="150" rx="50" ry="8" stroke="#a0a0a0" fill="none" strokeWidth="1"/>

                {/* Top Rim */}
                <path d="M 56, 18 A 50 8 0 0 0 6 10 H 106 A 50 8 0 0 0 56 18 Z" fill="#e5e7eb" opacity="0.7"/>
                <ellipse cx="56" cy="10" rx="50" ry="8" stroke="#b0b0b0" fill="none" strokeWidth="1.5"/>
            </svg>

            {/* Inner colored box representing stock level */}
            <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] rounded-b-md"
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
                    <div className="absolute left-0 top-0 h-px" style={{ width: '20px', backgroundColor: indicatorColor }} />
                    <div className="absolute left-[20px] top-[-20px] w-px" style={{ height: '20px', backgroundColor: indicatorColor }} />
                    <div className="absolute text-sm font-semibold whitespace-nowrap" style={{ left: '25px', top: '-38px', color: indicatorColor }}>
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
