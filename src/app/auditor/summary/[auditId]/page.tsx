'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { ScoreGauge } from '@/components/score-gauge';
import { CertificateBadge } from '@/components/certificate-badge';
import { CheckCircle2, ShieldCheck, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuditSummaryPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-500">Loading audit summary...</div>;
  if (!audit) return <div className="p-8 text-center text-xs text-red-500">Audit not found</div>;

  const score = audit.score;
  const cert = audit.certificate;

  return (
    <div className="space-y-6 pb-20">
      <Navbar title={`Audit Completed: ${audit.venue?.name}`} />

      {/* Success Banner */}
      <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-md flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Audit Submitted Successfully</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Audit No: {audit.auditNo} • Evaluated via Rule Engine & Score Engine
          </p>
        </div>
      </div>

      {/* Score & Certificate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900">Score Engine Result</h3>
          {score && <ScoreGauge score={score.overallScore} isFit={score.isFit} />}

          {score && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2">
              <h4 className="font-bold text-gray-800 uppercase tracking-wider">Category Scores:</h4>
              <div className="flex justify-between"><span>Housekeeping:</span><span className="font-bold">{score.housekeepingScore}%</span></div>
              <div className="flex justify-between"><span>Electrical:</span><span className="font-bold">{score.electricalScore}%</span></div>
              <div className="flex justify-between"><span>Plumbing:</span><span className="font-bold">{score.plumbingScore}%</span></div>
              <div className="flex justify-between"><span>Network:</span><span className="font-bold">{score.networkScore}%</span></div>
              <div className="flex justify-between"><span>Documentation:</span><span className="font-bold">{score.documentationScore}%</span></div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900">Generated Certificate</h3>
          {cert ? (
            <CertificateBadge
              certNo={cert.certificateNo}
              venueName={audit.venue?.name || 'Right Cabin'}
              buildingName="Learning Center 4th Floor — BIT Sathy"
              score={cert.overallScore}
              status={cert.fitnessStatus}
              validFrom={cert.validFrom}
              validUntil={cert.validUntil}
              approvedBy="Pending Manager Approval"
            />
          ) : (
            <div className="bg-white p-6 rounded-xl border text-center text-xs text-gray-500">
              Certificate generation pending.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/auditor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auditor Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
