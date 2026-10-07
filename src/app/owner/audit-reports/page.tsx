'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Button, Modal, Skeleton, EmptyState } from '@/components/ui';
import { ScoreGauge } from '@/components/score-gauge';
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
  Sparkles,
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

  const auditList = Array.isArray(audits) ? audits : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Auditor Inspection Reports & Fitness Certification" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Audit Clearance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Official Facility Reports</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Auditor Reports & Substitute Review Station</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Inspect score breakdowns and fitness certifications. For audits marked missed due to conflicts, perform substitute sign-off to ensure venue continuity.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <ClipboardList className="w-4 h-4 text-primary" />
          <span>{auditList.length} Total Audits</span>
        </div>
      </div>

      {/* Reports List Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span>Auditor Reports & Missed Audit Queue</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : auditList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="No audit reports found"
              description="No auditor reports recorded for your venue yet. Completed audits will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditList.map((audit: any) => {
              const isMissed = audit.status === 'MISSED';
              const isOwnerReviewed = audit.status === 'OWNER_REVIEWED';

              return (
                <div key={audit.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {audit.auditNo}
                        </span>
                        <StatusBadge status={audit.status} />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{audit.venue?.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Assigned Auditor: <strong className="text-slate-700">{audit.auditor?.name || 'Unassigned'}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMissed && (
                        <button
                          onClick={() => {
                            setReviewAuditId(audit.id);
                            setSelectedAuditDetail(audit);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Owner Self-Review</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAuditDetail(audit)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Breakdown Cards */}
                  {audit.score ? (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Overall</span>
                        <strong className={`text-sm font-bold block mt-0.5 ${audit.score.isFit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                        </strong>
                      </div>
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Housekeeping</span>
                        <strong className="text-sm font-bold text-slate-800 block mt-0.5">{audit.score.housekeepingScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Electrical</span>
                        <strong className="text-sm font-bold text-slate-800 block mt-0.5">{audit.score.electricalScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Plumbing</span>
                        <strong className="text-sm font-bold text-slate-800 block mt-0.5">{audit.score.plumbingScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Network</span>
                        <strong className="text-sm font-bold text-slate-800 block mt-0.5">{audit.score.networkScore}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Docs</span>
                        <strong className="text-sm font-bold text-slate-800 block mt-0.5">{audit.score.documentationScore}%</strong>
                      </div>
                    </div>
                  ) : isMissed ? (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <MessageSquareWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block">Auditor Non-Attendance Reason:</strong>
                        <p className="italic mt-0.5">"{audit.missedReason || 'Auditor was absent due to official work'}"</p>
                      </div>
                    </div>
                  ) : isOwnerReviewed ? (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-bold block">Owner Substitute Review Cleared</strong>
                        <p className="text-[11px] font-mono mt-0.5">{audit.missedReason}</p>
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
      <Modal
        isOpen={!!reviewAuditId}
        onClose={() => setReviewAuditId(null)}
        title="Owner Review — Clear Missed Audit"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The assigned auditor was unable to audit venue <strong className="text-slate-900">{selectedAuditDetail?.venue?.name}</strong>. Inspect your venue components and sign your clearance declaration below.
          </p>

          <form onSubmit={handleOwnerReviewSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Owner Remarks & Verification Statement *
              </label>
              <textarea
                rows={4}
                placeholder="e.g. All components and assets in Right Cabin verified. Electrical, HVAC, network functional. Cleared by Venue Owner."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                required
              />
            </div>

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
              <strong className="font-bold block">Owner Declaration:</strong>
              <span>By confirming, you sign off on facility operational readiness in substitute of the missed auditor.</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewAuditId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={ownerReviewMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>{ownerReviewMutation.isPending ? 'Signing Review...' : 'Confirm & Clear Audit'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={!!selectedAuditDetail && !reviewAuditId}
        onClose={() => setSelectedAuditDetail(null)}
        title={`Audit Details — ${selectedAuditDetail?.auditNo || ''}`}
      >
        <div className="space-y-4">
          {selectedAuditDetail?.score ? (
            <div className="flex flex-col items-center">
              <ScoreGauge
                score={selectedAuditDetail.score.overallScore}
                isFit={selectedAuditDetail.score.isFit}
                size="md"
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              No computed score record for this audit.
            </div>
          )}

          <div className="text-xs space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Venue:</span>
              <span className="font-semibold text-slate-900">{selectedAuditDetail?.venue?.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status={selectedAuditDetail?.status} />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Assigned Auditor:</span>
              <span className="font-medium text-slate-900">{selectedAuditDetail?.auditor?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
