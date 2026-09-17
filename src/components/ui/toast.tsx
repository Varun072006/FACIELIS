import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
} from 'lucide-react';

export interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}: ToastProps) {
  const configs = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-950',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-950',
      icon: AlertOctagon,
      iconColor: 'text-red-600',
    },
  };

  const config = configs[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`rounded-xl border p-4 shadow-xs flex items-start gap-3 transition-all duration-150 ${config.container} ${className}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-xs space-y-0.5">
        {title && <p className="font-extrabold tracking-tight">{title}</p>}
        <div className="font-medium opacity-90 leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
