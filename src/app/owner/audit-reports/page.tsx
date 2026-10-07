'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Skeleton, EmptyState } from '@/components/ui';
import { ScoreGauge } from '@/components/score-gauge';
import { CertificateBadge } from '@/components/certificate-badge';
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
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

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
      <div className="bg-[#173B72] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
          Official Auditor Reports & Substitute Reviews
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Auditor Reports & Owner Self-Review Station
        </h2>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
          Review score breakdowns, fitness certificates, and inspection details. If an auditor missed an audit due to official conflicts, you as Venue Owner can perform substitute review and clear the venue for operational continuity.
        </p>
      </div>

      {/* Reports List Card */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
          <CardTitle className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#173B72]" />
            <span>Auditor Reports & Missed Audit Queue</span>
          </CardTitle>
          <span className="text-xs text-gray-500 font-semibold">
            {Array.isArray(audits) ? audits.length : 0} Total Audits
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : !Array.isArray(audits) || audits.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="No audit reports found"
              description="No auditor reports recorded for your venue yet. Completed audits will appear here."
            />
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {audits.map((audit: any) => {
              const isMissed = audit.status === 'MISSED';
              const isOwnerReviewed = audit.status === 'OWNER_REVIEWED';

              return (
                <div key={audit.id} className="p-5 sm:p-6 hover:bg-gray-50/60 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#173B72] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                          {audit.auditNo}
                        </span>
                        <StatusBadge status={audit.status} />
                      </div>
                      <h4 className="font-extrabold text-base text-gray-900 mt-1">{audit.venue?.name}</h4>
                      <p className="text-xs text-gray-500">Assigned Auditor: {audit.auditor?.name || 'Unassigned'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMissed && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setReviewAuditId(audit.id);
                            setSelectedAuditDetail(audit);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md animate-pulse"
                        >
                          <ShieldAlert className="w-4 h-4 mr-1" />
                          <span>Owner Self-Review & Clear</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAuditDetail(audit)}
                        className="text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-gray-500" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </div>

                  {/* Score Breakdown Cards */}
                  {audit.score ? (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Overall Score</span>
                        <strong className={`text-base font-black ${audit.score.isFit ? 'text-emerald-700' : 'text-red-700'}`}>
                          {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                        </strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Housekeeping</span>
                        <strong className="text-base font-bold text-gray-800">{audit.score.housekeepingScore}%</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Electrical</span>
                        <strong className="text-base font-bold text-gray-800">{audit.score.electricalScore}%</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Plumbing</span>
                        <strong className="text-base font-bold text-gray-800">{audit.score.plumbingScore}%</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Network</span>
                        <strong className="text-base font-bold text-gray-800">{audit.score.networkScore}%</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Documentation</span>
                        <strong className="text-base font-bold text-gray-800">{audit.score.documentationScore}%</strong>
                      </div>
                    </div>
                  ) : isMissed ? (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <MessageSquareWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-extrabold block">Auditor Non-Attendance Reason:</strong>
                        <p className="italic font-serif mt-0.5">"{audit.missedReason || 'Auditor was absent due to official work'}"</p>
                      </div>
                    </div>
                  ) : isOwnerReviewed ? (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-extrabold block">Owner Self-Review Signed & Cleared</strong>
                        <p className="text-[11px] font-mono mt-0.5">{audit.missedReason}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Missed Audit Owner Self-Review Modal */}
      <Modal
        isOpen={!!reviewAuditId}
        onClose={() => setReviewAuditId(null)}
        title="Owner Review — Clear Missed Audit"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            The assigned auditor was unable to audit venue{' '}
            <strong className="text-gray-900">{selectedAuditDetail?.venue?.name}</strong>. As Venue Owner, inspect your venue components and sign your clearance declaration below.
          </p>

          <form onSubmit={handleOwnerReviewSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Owner Remarks & Verification Statement *
              </label>
              <textarea
                rows={4}
                placeholder="e.g. All components and assets in Right Cabin verified. Electrical, HVAC, network functional. Cleared by Venue Owner."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                required
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
              <strong className="font-bold block">Owner Self-Review Declaration:</strong>
              <span>By submitting, you legally sign off on facility operational readiness in substitute of the missed auditor.</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>{ownerReviewMutation.isPending ? 'Signing Review...' : 'Confirm & Clear Audit'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Audit Detail / Score Gauge Modal */}
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
            <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
              No computed score record for this audit.
            </div>
          )}

          <div className="text-xs space-y-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Venue:</span>
              <span className="font-bold text-gray-900">{selectedAuditDetail?.venue?.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Status:</span>
              <StatusBadge status={selectedAuditDetail?.status} />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Assigned Auditor:</span>
              <span className="font-semibold text-gray-900">{selectedAuditDetail?.auditor?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
