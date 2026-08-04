import React from 'react';

export function ScoreGauge({ score, isFit }: { score: number; isFit?: boolean }) {
  let color = 'text-emerald-600';
  let stroke = '#16a34a';

  if (score < 65 || isFit === false) {
    color = 'text-red-600';
    stroke = '#dc2626';
  } else if (score < 85) {
    color = 'text-amber-600';
    stroke = '#d97706';
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-gray-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={stroke}
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${color}`}>{score}%</span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Score</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            isFit === false
              ? 'bg-red-100 text-red-800 border border-red-200'
              : score >= 85
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}
        >
          {isFit === false ? 'UNFIT (Critical Defects)' : score >= 85 ? 'FACILITY FIT' : 'CONDITIONAL'}
        </span>
      </div>
    </div>
  );
}
