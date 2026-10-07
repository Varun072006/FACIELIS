import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
  sparkline?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  sparkline,
  children,
  className = '',
}: StatCardProps) {
  // Enterprise restrained semantic styling
  const variantStyles = {
    default: {
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-[#173B72]',
      trendColor: 'text-[#173B72]',
      accentBar: '',
    },
    success: {
      border: 'border-emerald-200/90',
      iconBg: 'bg-emerald-50 text-emerald-700',
      trendColor: 'text-emerald-700 font-semibold',
      accentBar: 'border-t-2 border-t-emerald-500',
    },
    warning: {
      border: 'border-amber-200/90',
      iconBg: 'bg-amber-50 text-amber-700',
      trendColor: 'text-amber-700 font-semibold',
      accentBar: 'border-t-2 border-t-amber-500',
    },
    critical: {
      border: 'border-rose-200/90',
      iconBg: 'bg-rose-50 text-rose-700',
      trendColor: 'text-rose-700 font-semibold',
      accentBar: 'border-t-2 border-t-rose-500',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`bento-card p-4 sm:p-4.5 bg-white border ${style.border} ${style.accentBar} rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className={`p-1.5 rounded-lg ${style.iconBg} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-feature-numeric">
            {value}
          </h3>
          {sparkline && <div className="w-24 h-7 shrink-0">{sparkline}</div>}
        </div>
      </div>

      {children}

      {(subtitle || trend) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`shrink-0 ml-1.5 ${style.trendColor}`}>{trend}</span>
          )}
        </div>
      )}
    </div>
  );
}
