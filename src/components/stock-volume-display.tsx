
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

  const style = {
    '--fill-percentage': `${fillPercentage}%`,
  } as React.CSSProperties;

  const getColorClass = () => {
    if (fillPercentage < 10) return 'text-red-500';
    if (fillPercentage < 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formattedStock = currentStock.toLocaleString(undefined, {
      minimumFractionDigits: unit === 'kg' ? 1 : 0,
      maximumFractionDigits: unit === 'kg' ? 1 : 0,
  });

  return (
    <div
      className={cn(
        'relative w-24 h-32 bg-gray-200 rounded-lg border-2 border-gray-400 flex items-end justify-center overflow-hidden shadow-inner'
      )}
    >
        {/* 3D Top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gray-300 rounded-t-lg border-b-2 border-gray-400" style={{ transform: 'perspective(100px) rotateX(30deg)', top: '-8px' }}></div>

        {/* Liquid */}
        <div
            className={cn('absolute bottom-0 left-0 right-0 w-full transition-all duration-500 ease-in-out', getColorClass())}
            style={{ height: `calc(${fillPercentage}%)`}}
        >
             <div className="absolute top-0 left-0 right-0 h-4 bg-current opacity-75" style={{ transform: 'perspective(100px) rotateX(30deg)', top: '-8px' }}></div>
        </div>

      {/* Text Display */}
      <div className="relative z-10 text-center text-gray-800 font-bold drop-shadow-sm pb-2">
            <div className="text-2xl">{formattedStock}</div>
            <div className="text-xs uppercase">{unit}</div>
      </div>
    </div>
  );
};
