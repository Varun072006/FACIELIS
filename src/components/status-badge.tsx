import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Wrench,
  Activity,
  AlertOctagon,
  Calendar,
  ShieldAlert,
  HelpCircle,
  Check,
} from 'lucide-react';

export type StatusType =
  | 'PASS'
  | 'GOOD'
  | 'FIT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'OWNER_REVIEWED'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'REPAIRED_PENDING_CROSS'
  | 'FAIL'
  | 'DEFECTIVE'
  | 'UNFIT'
  | 'CRITICAL'
  | 'REOPENED'
  | 'MISSED'
  | 'CONDITIONAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'SCHEDULED'
  | 'EXPIRED'
  | 'AUTO_SUBMITTED'
  | 'SLA BREACHED'
  | 'OVERDUE'
  | string;

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ElementType;
  dotColor?: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Success / Verified / Fit
  PASS: { label: 'Pass', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  GOOD: { label: 'Good', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  FIT: { label: 'Fit', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 font-bold', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  ACTIVE: { label: 'Active', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  VERIFIED: { label: 'Verified', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  OWNER_REVIEWED: { label: 'Owner Reviewed', className: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80', icon: CheckCircle2, dotColor: 'bg-emerald-500' },

  // Warnings / Pending / In Progress
  OPEN: { label: 'Open', className: 'bg-amber-50/80 text-amber-700 border-amber-200/80', icon: AlertCircle, dotColor: 'bg-amber-500' },
  ASSIGNED: { label: 'Assigned', className: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80', icon: Wrench, dotColor: 'bg-indigo-500' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-sky-50/80 text-sky-700 border-sky-200/80', icon: Activity, dotColor: 'bg-sky-500' },
  PENDING: { label: 'Pending', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock, dotColor: 'bg-slate-400' },
  PENDING_REVIEW: { label: 'Pending Review', className: 'bg-blue-50/80 text-blue-700 border-blue-200/80', icon: Clock, dotColor: 'bg-blue-500' },
  REPAIRED_PENDING_CROSS: { label: 'Pending Approval', className: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80', icon: Clock, dotColor: 'bg-indigo-500' },
  CONDITIONAL: { label: 'Conditional', className: 'bg-amber-50/80 text-amber-700 border-amber-200/80', icon: AlertTriangle, dotColor: 'bg-amber-500' },

  // Critical / Failed / Unfit / SLA
  FAIL: { label: 'Fail', className: 'bg-rose-50/80 text-rose-700 border-rose-200/80 font-bold', icon: XCircle, dotColor: 'bg-rose-500' },
  DEFECTIVE: { label: 'Defective', className: 'bg-rose-50/80 text-rose-700 border-rose-200/80', icon: XCircle, dotColor: 'bg-rose-500' },
  UNFIT: { label: 'Unfit', className: 'bg-rose-50/80 text-rose-700 border-rose-200/80 font-bold', icon: XCircle, dotColor: 'bg-rose-500' },
  CRITICAL: { label: 'Critical', className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold', icon: AlertOctagon, dotColor: 'bg-rose-600' },
  REOPENED: { label: 'Reopened', className: 'bg-rose-50/80 text-rose-700 border-rose-200/80', icon: AlertTriangle, dotColor: 'bg-rose-500' },
  MISSED: { label: 'Missed', className: 'bg-rose-50/80 text-rose-700 border-rose-200/80', icon: ShieldAlert, dotColor: 'bg-rose-500' },
  OVERDUE: { label: 'Overdue', className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold', icon: AlertOctagon, dotColor: 'bg-rose-600' },
  'SLA BREACHED': { label: 'SLA Breached', className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold', icon: AlertOctagon, dotColor: 'bg-rose-600' },

  // Priorities & Severities
  HIGH: { label: 'High', className: 'bg-amber-50/80 text-amber-700 border-amber-200/80 font-medium', icon: AlertTriangle, dotColor: 'bg-amber-500' },
  MEDIUM: { label: 'Medium', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle, dotColor: 'bg-slate-400' },
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Check, dotColor: 'bg-slate-400' },
  P1: { label: 'P1 · Critical', className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', icon: AlertOctagon, dotColor: 'bg-rose-500' },
  P2: { label: 'P2 · High', className: 'bg-amber-50/80 text-amber-700 border-amber-200/80 font-semibold', icon: AlertTriangle, dotColor: 'bg-amber-500' },
  P3: { label: 'P3 · Medium', className: 'bg-sky-50/80 text-sky-700 border-sky-200/80', icon: HelpCircle, dotColor: 'bg-sky-500' },
  P4: { label: 'P4 · Low', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Check, dotColor: 'bg-slate-400' },

  // Neutral / Administrative
  SCHEDULED: { label: 'Scheduled', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Calendar, dotColor: 'bg-slate-400' },
  EXPIRED: { label: 'Expired', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock, dotColor: 'bg-slate-400' },
  AUTO_SUBMITTED: { label: 'Auto Submitted', className: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80', icon: Clock, dotColor: 'bg-indigo-500' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className = '',
  size = 'sm',
  showIcon = true,
}: StatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toUpperCase().trim();
  const config = STATUS_CONFIGS[normalized] || {
    label: status.replace(/_/g, ' '),
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
    dotColor: 'bg-slate-400',
  };

  const IconComponent = config.icon;
  const sizeClasses =
    size === 'md'
      ? 'px-2.5 py-0.5 text-xs gap-1.5'
      : 'px-2 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight transition-colors whitespace-nowrap ${config.className} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <IconComponent
          className={size === 'md' ? 'w-3 h-3 shrink-0' : 'w-2.5 h-2.5 shrink-0'}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
