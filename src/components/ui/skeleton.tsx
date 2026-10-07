import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function Skeleton({ className = '', variant = 'rectangular', ...props }: SkeletonProps) {
  const variantStyles = {
    text: 'h-3.5 rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-xl min-h-[96px]',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/70 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
