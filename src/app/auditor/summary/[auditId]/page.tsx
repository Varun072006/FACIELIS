'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { ScoreGauge } from '@/components/score-gauge';
import { CertificateBadge } from '@/components/certificate-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuditSummaryPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-5 pb-20 max-w-5xl mx-auto">
        <Navbar title="Loading Audit Summary..." />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!audit) return <div className="p-8 text-center text-xs text-rose-500">Audit not found</div>;

  const score = audit.score;
  const cert = audit.certificate;

  return (
    <div className="space-y-5 pb-20 max-w-5xl mx-auto">
      <Navbar title={`Audit Completed: ${audit.venue?.name}`} />

      {/* Enterprise Success Banner */}
      <div className="bg-white border border-emerald-300/80 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                AUDIT LOGGED
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700">{audit.auditNo}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 mt-0.5">
              Inspection Evaluated Successfully
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified by Deterministic Rule Engine and Score Aggregator.
            </p>
          </div>
        </div>

        <Link href="/auditor">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Score & Certificate Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Column */}
        <div className="md:col-span-1 space-y-3.5">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
            Score Engine Result
          </h3>
          {score && <ScoreGauge score={score.overallScore} isFit={score.isFit} />}

          {score && (
            <Card>
              <CardHeader className="p-3.5 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Housekeeping:</span>
                  <span className="font-bold text-slate-900 font-mono">{score.housekeepingScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Electrical:</span>
                  <span className="font-bold text-slate-900 font-mono">{score.electricalScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Plumbing:</span>
                  <span className="font-bold text-slate-900 font-mono">{score.plumbingScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Network:</span>
                  <span className="font-bold text-slate-900 font-mono">{score.networkScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Documentation:</span>
                  <span className="font-bold text-slate-900 font-mono">{score.documentationScore}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Certificate Column */}
        <div className="md:col-span-2 space-y-3.5">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
            Generated Certificate
          </h3>
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
            <Card className="p-8 text-center text-xs text-slate-500">
              Certificate generation pending.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
