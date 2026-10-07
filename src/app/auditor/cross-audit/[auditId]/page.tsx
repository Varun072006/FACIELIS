'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckCircle2, XCircle, ArrowRight, Wrench, ShieldCheck, Check } from 'lucide-react';

export default function CrossAuditPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const router = useRouter();

  const { data: audit, isLoading: loadingAudit } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  const { data: crossItems, isLoading: loadingCross } = useQuery({
    queryKey: ['cross-audit-items', audit?.venueId],
    queryFn: () => fetch(`/api/cross-audit?venueId=${audit?.venueId}`).then((res) => res.json()),
    enabled: !!audit?.venueId,
  });

  const [verifications, setVerifications] = useState<Record<string, { verified: boolean; remark: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = (defectId: string, verified: boolean) => {
    setVerifications((prev) => ({
      ...prev,
      [defectId]: {
        ...prev[defectId],
        verified,
      },
    }));
  };

  const submitCrossAudit = async () => {
    setSubmitting(true);
    try {
      if (crossItems?.repairedItemsToVerify) {
        for (const defect of crossItems.repairedItemsToVerify) {
          const v = verifications[defect.id] || { verified: true, remark: 'Repair verified good' };
          await fetch('/api/cross-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auditId,
              defectId: defect.id,
              verified: v.verified,
              auditorRemark: v.remark,
            }),
          });
        }
      }

      router.push(`/auditor/integrity/${auditId}`);
    } catch (err) {
      console.error('Cross audit submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAudit || loadingCross) {
    return (
      <div className="space-y-5 pb-20 max-w-4xl mx-auto">
        <Navbar title="Cross-Audit Validation Station" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const repairedItems = crossItems?.repairedItemsToVerify || [];

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      <Navbar title="Cross-Audit Validation Station" />

      {/* Step Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Step 2 of 3: Cross-Audit Verification
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Validate Previously Repaired Items
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Items previously repaired by technicians in this venue. Verify if physical repairs are effective or reopen defects for rework.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
          <span>{repairedItems.length} Items to Verify</span>
        </div>
      </div>

      {repairedItems.length > 0 ? (
        <div className="space-y-3.5">
          {repairedItems.map((defect: any) => {
            const currentVal = verifications[defect.id]?.verified ?? true;
            return (
              <div key={defect.id} className="bento-card p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#173B72]">{defect.defectNo}</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                      {defect.component?.name} ({defect.asset?.name})
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] text-[11px] font-semibold border border-blue-200/80 flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>Repaired by {defect.repair?.technician?.name || 'Technician'}</span>
                  </span>
                </div>

                {/* Evidence Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Original Defect Photo
                    </p>
                    {defect.inspectionItem?.photoUrl ? (
                      <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                        <img
                          src={defect.inspectionItem.photoUrl}
                          alt="Original Defect"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-36 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Technician Repair Proof
                    </p>
                    {defect.repair?.repairProofPhotoUrl ? (
                      <div className="h-36 rounded-lg overflow-hidden border border-emerald-300 bg-slate-900">
                        <img
                          src={defect.repair.repairProofPhotoUrl}
                          alt="Technician Repair Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-36 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center text-xs text-emerald-700">
                        Proof Submitted
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Is this repair effective?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerify(defect.id, true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        currentVal
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Good</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerify(defect.id, false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        !currentVal
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reopen Defect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No Repaired Items Requiring Cross-Audit"
          description="There are currently no technician repairs awaiting cross-audit verification in this venue."
        />
      )}

      {/* Next Step Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={submitCrossAudit}
          isLoading={submitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Integrity Questions
        </Button>
      </div>
    </div>
  );
}
