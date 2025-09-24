
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
    if (fillPercentage < 20) return '#ef4444'; // red-500
    if (fillPercentage < 60) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  }, [fillPercentage]);

  const containerHeight = 160;
  const indicatorHeight = (containerHeight * fillPercentage) / 100;
  
  // Adjust label position to avoid overlapping with container rim or bottom
  const getLabelYPosition = () => {
    const rawY = containerHeight - indicatorHeight;
    if (rawY < 20) return 20; // Keep it below the rim
    if (rawY > containerHeight - 25) return containerHeight - 25; // Keep it above the bottom text
    return rawY;
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-end gap-2 pt-2 h-full overflow-visible">
        
        {/* Main container */}
        <div 
            className="relative w-24 h-40"
        >
             {/* SVG Container for liquid and glass effect */}
            <svg width="100%" height="100%" viewBox="0 0 96 160" className="absolute top-0 left-0">
                <defs>
                    {/* This clipPath ensures the liquid and wave stay inside the glass body */}
                    <clipPath id="glass-body-clip">
                        <path d="M5 10 C 5 10, 5 155, 5 155 L 91 155 C 91 155, 91 10, 91 10 Z" />
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
                    <path d="M5 10 C 5 10, 5 155, 5 155 L 91 155 C 91 155, 91 10, 91 10" stroke="#a0aec0" strokeWidth="2" fill="url(#glassGradient)" />
                    {/* Top Rim */}
                    <path d="M5 10 C 5 -2, 91 -2, 91 10 C 91 22, 5 22, 5 10 Z" fill="#e2e8f0" stroke="#a0aec0" strokeWidth="2" />
                    {/* Bottom Base */}
                    <ellipse cx="48" cy="155" rx="43" ry="5" fill="#e2e8f0" stroke="#a0aec0" strokeWidth="2"/>
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
                <svg width="60" height="40" viewBox="0 0 60 40" className="absolute -top-5 -left-px overflow-visible">
                   <path 
                     d="M 0,20 Q 20,20 30,10"
                     stroke="#000000"
                     fill="none"
                     strokeWidth="2"
                     markerEnd="url(#arrowhead)"
                   />
                </svg>
                <div className="absolute text-sm font-semibold whitespace-nowrap" style={{ left: '35px', top: '-18px', color: '#000000' }}>
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
            <p className="text-sm font-semibold text-gray-700 h-10 flex items-start justify-center pt-1 text-center">
                {productName}
            </p>
        </div>
    </div>
  );
};
