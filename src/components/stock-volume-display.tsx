
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
}) => {
  const unit = React.useMemo(() => (productName.toLowerCase().includes('kg') ? 'kg' : 'pcs'), [productName]);
  const fillPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
  
  const formatValue = (value: number) => {
    if (unit === 'kg') {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        });
    }
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
  };

  const indicatorColor = React.useMemo(() => {
    if (fillPercentage < 20) return '#f87171'; // red-400
    if (fillPercentage < 60) return '#facc15'; // yellow-400
    return '#3b82f6'; // blue-500
  }, [fillPercentage]);

  const containerHeight = 128; // Reduced from 160
  const indicatorHeight = (containerHeight * fillPercentage) / 100;
  
  // Adjust label position to avoid overlapping with container rim or bottom
  const getLabelYPosition = () => {
    const rawY = containerHeight - indicatorHeight;
    if (rawY < 16) return 16; // Keep it below the rim (was 20)
    if (rawY > containerHeight - 20) return containerHeight - 20; // Keep it above the bottom text (was 25)
    return rawY;
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-end gap-1 pt-2 h-full overflow-visible">
        
        {/* Main container */}
        <div 
            className="relative w-20 h-32" // Reduced from w-24 h-40
        >
             {/* SVG Container for liquid and glass effect */}
            <svg width="100%" height="100%" viewBox="0 0 80 128" className="absolute top-0 left-0">
                <defs>
                    {/* This clipPath ensures the liquid and wave stay inside the glass body */}
                    <clipPath id="glass-body-clip">
                        <path d="M4 8 C 4 8, 4 124, 4 124 L 76 124 C 76 124, 76 8, 76 8 Z" />
                    </clipPath>
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.3}} />
                        <stop offset="20%" style={{stopColor: 'white', stopOpacity: 0.1}} />
                        <stop offset="40%" style={{stopColor: 'white', stopOpacity: 0.05}} />
                        <stop offset="60%" style={{stopColor: 'white', stopOpacity: 0.05}} />
                        <stop offset="80%" style={{stopColor: 'white', stopOpacity: 0.1}} />
                        <stop offset="100%" style={{stopColor: 'white', stopOpacity: 0.3}} />
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
                        <polygon points="0 0, 5 1.75, 0 3.5" fill="#000000" />
                    </marker>
                </defs>

                {/* The liquid and wave, clipped by the path above */}
                <g clipPath="url(#glass-body-clip)">
                    <path
                        className="animate-wave-flow"
                        fill={indicatorColor}
                        style={{
                            transform: `translateY(${containerHeight - indicatorHeight}px)`,
                            transition: 'transform 0.5s ease-in-out, fill 0.5s ease-in-out',
                        }}
                    />
                </g>

                {/* Glass outline - drawn on top of the clipped liquid */}
                <g>
                    {/* Main body outline */}
                    <path d="M4 8 C 4 8, 4 124, 4 124 L 76 124 C 76 124, 76 8, 76 8" stroke="#a0aec0" strokeWidth="1.5" fill="url(#glassGradient)" />
                    {/* Top Rim */}
                    <path d="M4 8 C 4 -1.6, 76 -1.6, 76 8 C 76 17.6, 4 17.6, 4 8 Z" fill="#e2e8f0" stroke="#a0aec0" strokeWidth="1.5" />
                    {/* Bottom Base */}
                    <ellipse cx="40" cy="124" rx="36" ry="4" fill="#e2e8f0" stroke="#a0aec0" strokeWidth="1.5"/>
                </g>
            </svg>
            
            {/* Floating label and connecting line */}
             <div 
                className="absolute left-full top-0 w-px h-px"
                style={{
                    transform: `translateY(${getLabelYPosition()}px)`,
                    transition: 'transform 0.5s ease-in-out',
                    overflow: 'visible',
                    zIndex: 10
                }}
            >
                <svg width="50" height="30" viewBox="0 0 50 30" className="absolute -top-4 -left-px overflow-visible">
                   <path 
                     d="M 0,15 Q 15,15 25,10"
                     stroke="#000000"
                     fill="none"
                     strokeWidth="1.5"
                     markerEnd="url(#arrowhead)"
                   />
                </svg>
                <div className="absolute text-xs font-semibold whitespace-nowrap" style={{ left: '30px', top: '-14px', color: indicatorColor }}>
                    {formatValue(currentStock)}{unit}
                </div>
            </div>
        </div>
        
        {/* Base Platform */}
        <div className="w-24 h-1.5 bg-gray-300/60 rounded-full blur-sm" />
        
        {/* Labels: Total Size and Product Name */}
        <div className="text-center pt-1">
             <p className="text-[10px] text-gray-500">
                Size: {formatValue(maxStock)} {unit}
            </p>
            <p className="text-xs font-semibold text-gray-700 h-8 flex items-start justify-center pt-1 text-center">
                {productName}
            </p>
        </div>
    </div>
  );
};
