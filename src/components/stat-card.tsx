import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50/50 border-amber-200 text-amber-950',
    critical: 'bg-red-50/50 border-red-200 text-red-950',
  };

  const iconStyles = {
    default: 'bg-gray-100 text-[#173B72]',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-5 rounded-xl border ${variantStyles[variant]} shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span>{subtitle}</span>
          {trend && <span className="font-medium text-[#173B72]">{trend}</span>}
        </div>
      )}
    </div>
  );
}
