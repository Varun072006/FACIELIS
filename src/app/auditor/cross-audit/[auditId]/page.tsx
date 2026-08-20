'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CheckCircle2, XCircle, ArrowRight, Wrench } from 'lucide-react';

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

  if (loadingAudit || loadingCross) return <div className="p-8 text-center text-xs text-gray-500">Loading cross-audit verification...</div>;

  const repairedItems = crossItems?.repairedItemsToVerify || [];

  return (
    <div className="space-y-6 pb-20">
      <Navbar title="Cross-Audit Validation Station" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Step 2 of 3: Cross-Audit Verification
        </span>
        <h2 className="text-xl font-extrabold">Validate Previously Repaired Items</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          The system automatically displays items previously repaired by technicians in this venue. Verify if repairs are effective or reopen defects for rework.
        </p>
      </div>

      {repairedItems.length > 0 ? (
        <div className="space-y-4">
          {repairedItems.map((defect: any) => {
            const currentVal = verifications[defect.id]?.verified ?? true;
            return (
              <div key={defect.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-blue-700">{defect.defectNo}</span>
                    <h4 className="font-bold text-sm text-gray-900">{defect.component?.name} ({defect.asset?.name})</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Repaired by {defect.repair?.technician?.name || 'Technician'}</span>
                  </span>
                </div>

                {/* Evidence Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Defect Photo */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Original Defect Photo</p>
                    {defect.inspectionItem?.photoUrl ? (
                      <img src={defect.inspectionItem.photoUrl} alt="Original Defect" className="w-full h-36 object-cover rounded-lg border" />
                    ) : (
                      <div className="h-36 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Photo</div>
                    )}
                  </div>

                  {/* Technician Repair Proof */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Technician Repair Proof</p>
                    {defect.repair?.repairProofPhotoUrl ? (
                      <img src={defect.repair.repairProofPhotoUrl} alt="Technician Repair Proof" className="w-full h-36 object-cover rounded-lg border border-emerald-300" />
                    ) : (
                      <div className="h-36 bg-emerald-50 rounded-lg flex items-center justify-center text-xs text-emerald-700">Proof Submitted</div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Is the repair effective?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(defect.id, true)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        currentVal
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified Good</span>
                    </button>

                    <button
                      onClick={() => handleVerify(defect.id, false)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        !currentVal
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reopen Defect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-500">
          No pending repaired items requiring cross-audit validation in this venue.
        </div>
      )}

      {/* Next Step Button */}
      <div className="flex justify-end">
        <button
          onClick={submitCrossAudit}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
        >
          <span>{submitting ? 'Submitting...' : 'Proceed to Integrity Questions'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
