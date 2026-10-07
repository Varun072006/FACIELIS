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
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 text-slate-900',
    success: 'bg-emerald-50/40 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50/40 border-amber-200 text-amber-950',
    critical: 'bg-red-50/40 border-red-200 text-red-950',
  };

  const iconStyles = {
    default: 'bg-slate-100 text-[#173B72]',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-5 rounded-2xl border ${variantStyles[variant]} shadow-xs flex flex-col justify-between transition-all hover:shadow-md bg-white`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{value}</h3>
            {sparkline && <div className="flex-1 max-w-[110px] h-9">{sparkline}</div>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconStyles[variant]} shrink-0 shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {children}
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
          <span className="truncate">{subtitle}</span>
          {trend && <span className="font-bold text-[#173B72] shrink-0 ml-1">{trend}</span>}
        </div>
      )}
    </div>
  );
}
