
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockVolumeDisplayProps {
  currentStock: number;
  maxStock: number;
}

export const StockVolumeDisplay: React.FC<StockVolumeDisplayProps> = ({
  currentStock,
  maxStock,
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

  return (
    <div
      className={cn(
        'relative w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden bg-muted',
        getColorClass().replace('text-', 'border-')
      )}
    >
      <style jsx>{`
        .wave-container::before,
        .wave-container::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: var(--fill-percentage);
          width: 200%;
          height: 200%;
          border-radius: 40%;
          transform: translateX(-50%) translateY(50%);
          animation: spin 8s linear infinite;
        }

        .wave-container::before {
          background-color: currentColor;
          opacity: 0.5;
          animation-duration: 8s;
        }

        .wave-container::after {
          background-color: currentColor;
          opacity: 0.8;
          animation-duration: 10s;
        }

        @keyframes spin {
          0% {
            transform: translateX(-50%) translateY(50%) rotate(0deg);
          }
          100% {
            transform: translateX(-50%) translateY(50%) rotate(360deg);
          }
        }
      `}</style>
      <div
        className={cn('wave-container absolute inset-0', getColorClass())}
        style={style}
      ></div>
      <span className="relative z-10 text-2xl font-bold text-foreground">
        {Math.round(fillPercentage)}%
      </span>
    </div>
  );
};
