

import React from 'react';
import { cn } from '@/lib/utils';

export const StockPilotLogo = React.memo(function StockPilotLogo({ className }: { className?: string }) {
  const graphPath = "M20 60C30 50, 35 70, 40 65C45 60, 50 40, 55 45C60 50, 65 30, 70 35C75 40, 80 25, 85 30";
  
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-white shadow-md',
        className
      )}
    >
      <style>
        {`
          @keyframes followPath {
            0% {
              offset-distance: 0%;
            }
            100% {
              offset-distance: 100%;
            }
          }
          .path-follower {
            offset-path: path("${graphPath}");
            animation: followPath 4s linear infinite;
          }
        `}
      </style>
      <div className="h-full w-full">
        <svg
          className="h-full w-full text-black"
          viewBox="-10 -10 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Graph Axis */}
          <path d="M20 80H80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 20V80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 35H25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 50H25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 65H25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M35 80V75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 80V75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M65 80V75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

          {/* Graph Line */}
          <path
            d={graphPath}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Animated Circle */}
          <circle className="path-follower" r="5" fill="#22C55E" />

          {/* Clock */}
          <g stroke="#22C55E">
            <circle cx="75" cy="65" r="14" fill="#22C55E" fillOpacity="0.1" />
            <path d="M75 60 V65 H79" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
});

StockPilotLogo.displayName = 'StockPilotLogo';
