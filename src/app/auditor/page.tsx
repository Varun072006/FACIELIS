'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/providers/auth-provider';
import {
  ClipboardList,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquareWarning,
  CheckCircle2,
  ShieldCheck,
  History,
} from 'lucide-react';
import Link from 'next/link';

const PREDEFINED_REASONS = [
  'Venue Locked / Occupied during scheduled shift',
  'Auditor Shift Conflict / Staff Shortage',
  'Asset / Component Machinery Unavailable for Inspection',
  'Emergency Facility Maintenance in Progress',
  'Other / Custom Reason',
];

export default function AuditorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackAuditId, setFeedbackAuditId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
  const [customRemark, setCustomRemark] = useState('');

  const { data: audits, isLoading } = useQuery({
    queryKey: ['auditor-audits', user?.id],
    queryFn: () => fetch(`/api/audits?auditorId=${user?.id || ''}`).then((res) => res.json()),
    enabled: !!user?.id,
  });

  const missedFeedbackMutation = useMutation({
    mutationFn: async ({ auditId, reason }: { auditId: string; reason: string }) => {
      const res = await fetch(`/api/audits/${auditId}/missed-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to submit non-attendance feedback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditor-audits'] });
      setFeedbackAuditId(null);
      setCustomRemark('');
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackAuditId) return;
    const finalReason =
      selectedReason === 'Other / Custom Reason'
        ? customRemark || 'Custom reason not specified'
        : `${selectedReason}${customRemark ? `: ${customRemark}` : ''}`;

    missedFeedbackMutation.mutate({ auditId: feedbackAuditId, reason: finalReason });
  };

  const activeAudits = Array.isArray(audits)
    ? audits.filter((a: any) => a.status !== 'MISSED')
    : [];

  const completedAuditsCount = activeAudits.filter((a: any) => a.status === 'COMPLETED').length;
  const pendingAuditsCount = activeAudits.filter((a: any) => a.status !== 'COMPLETED').length;

  return (
    <div className="space-y-5 pb-12">
      <Navbar title="Auditor Inspection Dashboard" />

      {/* Enterprise Shift Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ClipboardList className="w-3.5 h-3.5" />
              Field Inspection Shift
            </span>
            <span className="text-xs text-slate-400">Auditor: {user?.name}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Active Inspection Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Complete component inspections strictly within your assigned window. Geo-tagged evidence and remark are required for all non-compliance defects.
          </p>
        </div>
        <Link
          href="/auditor/history"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit History & Logs</span>
        </Link>
      </div>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {isLoading ? (
          <>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned Tasks"
              value={activeAudits.length}
              subtitle="Active Field Windows"
              icon={ClipboardList}
              variant="default"
            />
            <StatCard
              title="Pending Audits"
              value={pendingAuditsCount}
              subtitle="Awaiting Inspection"
              icon={Clock}
              variant={pendingAuditsCount > 0 ? 'warning' : 'default'}
            />
            <StatCard
              title="Completed Cycles"
              value={completedAuditsCount}
              subtitle="Submitted to Manager"
              icon={ShieldCheck}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Assigned Venues Bento Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#173B72]" />
            <span>Assigned Venue Tasks</span>
          </h3>
          <span className="text-xs text-slate-500">{activeAudits.length} total tasks</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : activeAudits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAudits.map((audit: any) => {
              const now = new Date();
              const due = audit.dueDate ? new Date(audit.dueDate) : null;
              const start = audit.startTime ? new Date(audit.startTime) : new Date(audit.scheduledDate);
              const isExpired = due ? now > due && audit.status !== 'COMPLETED' && audit.status !== 'PENDING_REVIEW' : false;

              const formattedStart = start.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
              const formattedDue = due ? due.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No Expiry';

              return (
                <div
                  key={audit.id}
                  className={`bento-card p-4.5 flex flex-col justify-between space-y-3.5 transition-all ${
                    isExpired ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                          {isExpired && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 font-bold text-[9px]">
                              WINDOW EXPIRED
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">{audit.venue?.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#173B72] shrink-0" />
                          <span>
                            {audit.venue?.floor?.building?.name || 'Learning Center'} — {audit.venue?.floor?.name}
                          </span>
                        </p>
                      </div>
                      <StatusBadge status={audit.status} size="sm" />
                    </div>

                    {/* Scheduled Interval */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center gap-1 text-slate-600 font-medium text-[11px] mb-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Scheduled Window</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Start:</span>
                          <strong className="text-slate-800">{formattedStart}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Expiry:</span>
                          <strong className={isExpired ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                            {formattedDue}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    {isExpired ? (
                      <button
                        onClick={() => setFeedbackAuditId(audit.id)}
                        className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquareWarning className="w-3.5 h-3.5" />
                        <span>Provide Non-Attendance Reason</span>
                      </button>
                    ) : (
                      <Link
                        href={`/auditor/inspect/${audit.id}`}
                        className="w-full py-2 px-3 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>{audit.status === 'COMPLETED' ? 'View Completed Audit' : 'Start Component Audit'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="All Inspection Tasks Complete"
            description="No active assigned audits found for your account. All tasks are completed or up to date!"
          />
        )}
      </div>

      {/* Non-Attendance Feedback Modal */}
      <Modal
        isOpen={!!feedbackAuditId}
        onClose={() => setFeedbackAuditId(null)}
        title="Log Non-Attendance Feedback"
        description="The assigned time window for this audit has expired. Please state why you were unable to complete this audit."
        maxWidth="md"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Predefined Reason *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:ring-1 focus:ring-[#173B72] focus:border-[#173B72]"
            >
              {PREDEFINED_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Additional Details / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="State shift conflicts, venue lockouts, or operational delays..."
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-[#173B72] focus:border-[#173B72]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeedbackAuditId(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={missedFeedbackMutation.isPending}
            >
              Submit Feedback & Remove Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
