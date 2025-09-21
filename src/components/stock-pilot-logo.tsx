
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const StockPilotLogo = React.memo(function StockPilotLogo({ className }: { className?: string }) {
  const graphPath = "M20 60C30 50, 35 70, 40 65C45 60, 50 40, 55 45C60 50, 65 30, 70 35C75 40, 80 25, 85 30";
  
  const [rotation, setRotation] = useState({ s: 0, m: 0, h: 0 });

  useEffect(() => {
    // This effect runs only on the client, preventing hydration errors.
    const updateClock = () => {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours();
      setRotation({
        s: s * 6,
        m: m * 6 + s / 10,
        h: h * 30 + m / 2,
      });
    };
    
    updateClock(); // Initial set
    const intervalId = setInterval(updateClock, 1000);
    
    return () => clearInterval(intervalId); // Cleanup
  }, []);

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
            0% { offset-distance: 0%; }
            100% { offset-distance: 100%; }
          }
          .path-follower {
            offset-path: path(${graphPath});
            animation: followPath 4s linear infinite;
          }
          .clock-face {
            stroke: #22C55E;
            stroke-width: 4;
            fill: #22C55E1A;
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

          {/* Real Clock */}
          <g transform="translate(75, 65)">
              <circle className="clock-face" r="14" />
              <line y1="-8" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" style={{ transform: `rotate(${rotation.h}deg)`, transformOrigin: '0 0' }} />
              <line y1="-11" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" style={{ transform: `rotate(${rotation.m}deg)`, transformOrigin: '0 0' }} />
              <line y1="-12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" style={{ transform: `rotate(${rotation.s}deg)`, transformOrigin: '0 0' }} />
              <circle r="1.5" fill="#22C55E" />
          </g>
        </svg>
      </div>
    </div>
  );
});

StockPilotLogo.displayName = 'StockPilotLogo';
