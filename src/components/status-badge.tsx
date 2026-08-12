import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['PASS', 'GOOD', 'VERIFIED', 'FIT', 'ACTIVE', 'COMPLETED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['FAIL', 'DEFECTIVE', 'UNFIT', 'CRITICAL', 'REOPENED'].includes(normalized)) {
    styles = 'bg-red-50 text-red-700 border-red-200';
  } else if (['OPEN', 'ASSIGNED', 'PENDING', 'P1', 'P2', 'HIGH', 'CONDITIONAL'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['REPAIRED_PENDING_CROSS', 'IN_PROGRESS'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  let displayText = status.replace(/_/g, ' ');
  if (normalized === 'REPAIRED_PENDING_CROSS') {
    displayText = 'PENDING APPROVAL';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {displayText}
    </span>
  );
}

