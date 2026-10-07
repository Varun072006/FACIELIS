'use client';

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  isFit?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNeedle?: boolean;
}

export function ScoreGauge({ score, isFit, size = 'md', showNeedle = true }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Color selection
  let color = 'text-emerald-700';
  let strokeColor = '#059669';
  let gradientId = 'gauge-fit';

  if (score < 65 || isFit === false) {
    color = 'text-rose-700';
    strokeColor = '#dc2626';
    gradientId = 'gauge-unfit';
  } else if (score < 85) {
    color = 'text-amber-700';
    strokeColor = '#d97706';
    gradientId = 'gauge-conditional';
  }

  // Dimension scaling
  const dimensions = {
    sm: { width: 90, height: 90, radius: 34, strokeWidth: 7, fontSize: 'text-base', labelSize: 'text-[9px]' },
    md: { width: 130, height: 130, radius: 46, strokeWidth: 8, fontSize: 'text-xl', labelSize: 'text-[10px]' },
    lg: { width: 160, height: 160, radius: 58, strokeWidth: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
  }[size];

  const arcDegree = 240;
  const radius = dimensions.radius;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcDegree / 360) * circumference;

  const clampedScore = Math.min(100, Math.max(0, animatedScore));
  const currentArcLength = (clampedScore / 100) * arcLength;
  const strokeDashoffset = mounted ? circumference - currentArcLength : circumference;

  const needleAngle = (clampedScore / 100) * arcDegree - arcDegree / 2;

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg
          className="w-full h-full transform"
          viewBox="0 0 140 140"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="gauge-fit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-conditional" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gauge-unfit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <filter id="needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth={dimensions.strokeWidth}
            stroke="#f1f5f9"
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(150 70 70)"
          />

          {/* Value Active Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth={dimensions.strokeWidth}
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(150 70 70)"
            className="transition-all duration-700 ease-out"
          />

          {/* Needle */}
          {showNeedle && (
            <g
              transform={`rotate(${needleAngle} 70 70)`}
              className="transition-transform duration-700 ease-out"
              filter="url(#needle-shadow)"
            >
              <line
                x1="70"
                y1="70"
                x2="70"
                y2="70 - radius + 6"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polygon
                points={`68.5,70 71.5,70 70,${70 - radius + 4}`}
                fill={strokeColor}
              />
              <circle cx="70" cy="70" r="4.5" fill="#1e293b" />
              <circle cx="70" cy="70" r="2" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Center Score Readout */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-3.5">
          <span className={`${dimensions.fontSize} font-bold tracking-tight ${color}`}>
            {clampedScore}%
          </span>
          <span className={`${dimensions.labelSize} text-slate-400 font-semibold uppercase tracking-wider`}>
            Score
          </span>
        </div>
      </div>

      {/* Fitness Pill Badge */}
      <div className="mt-1 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
            isFit === false
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : score >= 85
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isFit === false ? 'bg-rose-500' : score >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {isFit === false ? 'UNFIT' : score >= 85 ? 'FACILITY FIT' : 'CONDITIONAL'}
        </span>
      </div>
    </div>
  );
}
