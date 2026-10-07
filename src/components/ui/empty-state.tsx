import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-dashed border-slate-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-2.5 ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-2xs">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div className="max-w-sm space-y-0.5">
        <h4 className="font-bold text-sm text-slate-900">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-1.5">{action}</div>}
    </div>
  );
}
