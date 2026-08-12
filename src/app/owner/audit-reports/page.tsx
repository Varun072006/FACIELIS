'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/providers/auth-provider';
import {
  ClipboardList,
  Award,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileCheck,
  MessageSquareWarning,
  Send,
} from 'lucide-react';

export default function OwnerAuditReportsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewAuditId, setReviewAuditId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<any | null>(null);

  const { data: audits, isLoading } = useQuery({
    queryKey: ['owner-audit-reports', user?.venueId],
    queryFn: () => fetch(`/api/owner/audit-reports?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  const ownerReviewMutation = useMutation({
    mutationFn: async ({ auditId, remarks }: { auditId: string; remarks: string }) => {
      const res = await fetch(`/api/owner/missed-audit-review/${auditId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });
      if (!res.ok) throw new Error('Failed to submit owner review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-audit-reports'] });
      setReviewAuditId(null);
      setReviewRemarks('');
    },
  });

  const handleOwnerReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuditId) return;
    ownerReviewMutation.mutate({ auditId: reviewAuditId, remarks: reviewRemarks });
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Auditor Inspection Reports & Fitness Certification" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
          Official Auditor Reports & Substitute Reviews
        </span>
        <h2 className="text-xl font-black">Auditor Reports & Owner Self-Review Station</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          Review score breakdowns, fitness certificates, and inspection details. If an auditor missed an audit due to important work, you as Venue Owner can review and clear it here.
        </p>
      </div>

      {/* Reports List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#173B72]" />
            <span>Auditor Reports & Missed Audit Queue</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading audit reports...</div>
        ) : !Array.isArray(audits) || audits.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No auditor reports recorded for your venue yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {audits.map((audit: any) => {
              const isMissed = audit.status === 'MISSED';
              const isOwnerReviewed = audit.status === 'OWNER_REVIEWED';

              return (
                <div key={audit.id} className="p-5 hover:bg-gray-50/50 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                        <StatusBadge status={audit.status} />
                      </div>
                      <h4 className="font-bold text-base text-gray-900 mt-1">{audit.venue?.name}</h4>
                      <p className="text-xs text-gray-500">Assigned Auditor: {audit.auditor?.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMissed && (
                        <button
                          onClick={() => {
                            setReviewAuditId(audit.id);
                            setSelectedAuditDetail(audit);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 animate-pulse"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Owner Self-Review & Clear</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAuditDetail(audit)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Breakdown Cards */}
                  {audit.score ? (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Overall Score</span>
                        <strong className={`font-black ${audit.score.isFit ? 'text-emerald-700' : 'text-red-700'}`}>
                          {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                        </strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Housekeeping</span>
                        <strong className="font-bold text-gray-800">{audit.score.housekeepingScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Electrical</span>
                        <strong className="font-bold text-gray-800">{audit.score.electricalScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Plumbing</span>
                        <strong className="font-bold text-gray-800">{audit.score.plumbingScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Network</span>
                        <strong className="font-bold text-gray-800">{audit.score.networkScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block">Documentation</span>
                        <strong className="font-bold text-gray-800">{audit.score.documentationScore}%</strong>
                      </div>
                    </div>
                  ) : isMissed ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <MessageSquareWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-extrabold block">Auditor Non-Attendance Reason:</strong>
                        <p className="italic font-serif">"{audit.missedReason || 'Auditor was absent due to official work'}"</p>
                      </div>
                    </div>
                  ) : isOwnerReviewed ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-extrabold block">Owner Self-Review Signed & Cleared</strong>
                        <p className="text-[11px] font-mono">{audit.missedReason}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Missed Audit Owner Self-Review Modal */}
      {reviewAuditId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Owner Review — Clear Missed Audit</span>
              </h3>
              <button onClick={() => setReviewAuditId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              The assigned auditor was unable to audit venue <strong className="text-gray-900">{selectedAuditDetail?.venue?.name}</strong>. As Venue Owner, inspect your component state and sign your review declaration below.
            </p>

            <form onSubmit={handleOwnerReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Owner Remarks & Verification Statement *</label>
                <textarea
                  rows={4}
                  placeholder="e.g. All 143 assets and components in Right Cabin checked. Electrical switches, HVAC, and computer networks functional. Cleared by Venue Owner."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <strong className="font-bold block">Owner Self-Review Declaration:</strong>
                <span>By submitting, you sign off on facility operational readiness in substitute of the missed auditor.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewAuditId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ownerReviewMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{ownerReviewMutation.isPending ? 'Signing Review...' : 'Confirm & Clear Audit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
