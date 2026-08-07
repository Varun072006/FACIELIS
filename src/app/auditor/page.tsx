'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/providers/auth-provider';
import {
  ClipboardList,
  ArrowRight,
  MapPin,
  Calendar,
  Boxes,
  Clock,
  AlertTriangle,
  MessageSquareWarning,
  XCircle,
  CheckCircle2,
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

  // Filter out MISSED audits from the auditor's active task list
  const activeAudits = Array.isArray(audits)
    ? audits.filter((a: any) => a.status !== 'MISSED')
    : [];

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Auditor Inspection Dashboard & Task Registry" />

      {/* Hero Welcome */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Time-Bounded Inspection Tasks
        </span>
        <h2 className="text-xl font-extrabold">Welcome, Auditor {user?.name}</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          Complete inspections strictly within your assigned time window. Every defect requires mandatory geo-tagged evidence and remark.
        </p>
      </div>

      {/* Assigned Venues Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#173B72]" />
          <span>Active Assigned Venue Tasks</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-xl border">Loading assigned audits...</div>
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
                <div key={audit.id} className={`bg-white rounded-xl border p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow ${isExpired ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                        {isExpired && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-[10px]">
                            WINDOW EXPIRED
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-gray-900 mt-0.5">{audit.venue?.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#173B72]" />
                        <span>{audit.venue?.floor?.building?.name || 'Learning Center'} — {audit.venue?.floor?.name}</span>
                      </p>
                    </div>
                    <StatusBadge status={audit.status} />
                  </div>

                  {/* Scheduled Time Window */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#173B72]" />
                        <span>Assigned Time Interval:</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-gray-500 block">Start Window:</span>
                        <strong className="text-gray-900">{formattedStart}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Expiry Deadline:</span>
                        <strong className={isExpired ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>{formattedDue}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {isExpired ? (
                      <button
                        onClick={() => setFeedbackAuditId(audit.id)}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <MessageSquareWarning className="w-4 h-4" />
                        <span>Provide Non-Attendance Reason</span>
                      </button>
                    ) : (
                      <Link
                        href={`/auditor/inspect/${audit.id}`}
                        className="w-full py-2.5 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <span>{audit.status === 'COMPLETED' ? 'View Completed Audit' : 'Start Component Audit'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-400">
            No active assigned audits found for your account. All tasks are completed or up to date!
          </div>
        )}
      </div>

      {/* Non-Attendance Feedback Collection Modal */}
      {feedbackAuditId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-[10px]">
                  AUDIT WINDOW EXPIRED
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-1 flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-red-600" />
                  <span>Log Non-Attendance Feedback</span>
                </h3>
              </div>
              <button onClick={() => setFeedbackAuditId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              The assigned time window for this audit has expired. Please state why you were unable to attend or complete this audit during the scheduled window. Once submitted, this task will be logged for the manager and removed from your active checklist.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Predefined Non-Attendance Reason *</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  {PREDEFINED_REASONS.map((r, idx) => (
                    <option key={idx} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Additional Details / Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Provide additional details on shift conflicts, venue lockouts, or operational delays..."
                  value={customRemark}
                  onChange={(e) => setCustomRemark(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFeedbackAuditId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={missedFeedbackMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{missedFeedbackMutation.isPending ? 'Logging Feedback...' : 'Submit Feedback & Remove Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
