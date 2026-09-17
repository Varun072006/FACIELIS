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
  | string;

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ElementType;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Success / Positive
  PASS: { label: 'Pass', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  GOOD: { label: 'Good', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  FIT: { label: 'Fit', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  ACTIVE: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  VERIFIED: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  OWNER_REVIEWED: { label: 'Owner Reviewed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },

  // Warnings / Actions Required
  OPEN: { label: 'Open', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  ASSIGNED: { label: 'Assigned', className: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Wrench },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-sky-50 text-sky-700 border-sky-200', icon: Activity },
  PENDING: { label: 'Pending', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  PENDING_REVIEW: { label: 'Pending Review', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  REPAIRED_PENDING_CROSS: { label: 'Pending Approval', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  CONDITIONAL: { label: 'Conditional', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },

  // Critical / Failures / Hazards
  FAIL: { label: 'Fail', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  DEFECTIVE: { label: 'Defective', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  UNFIT: { label: 'Unfit', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-300 font-black', icon: AlertOctagon },
  REOPENED: { label: 'Reopened', className: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
  MISSED: { label: 'Missed', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert },

  // Priorities & Severities
  HIGH: { label: 'High', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
  MEDIUM: { label: 'Medium', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle },
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Check },
  P1: { label: 'P1 - Critical', className: 'bg-red-50 text-red-700 border-red-200 font-black', icon: AlertOctagon },
  P2: { label: 'P2 - High', className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold', icon: AlertTriangle },
  P3: { label: 'P3 - Medium', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: HelpCircle },
  P4: { label: 'P4 - Low', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Check },

  // Administrative / Batches
  SCHEDULED: { label: 'Scheduled', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Calendar },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: Clock },
  AUTO_SUBMITTED: { label: 'Auto Submitted', className: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
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
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: HelpCircle,
  };

  const IconComponent = config.icon;
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs gap-1.5' : 'px-2.5 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs transition-colors ${config.className} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'md' ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} />}
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

