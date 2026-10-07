'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { ScoreGauge } from '@/components/score-gauge';
import { CertificateBadge } from '@/components/certificate-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ShieldCheck, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuditSummaryPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        <Navbar title="Loading Audit Summary..." />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!audit) return <div className="p-8 text-center text-xs text-red-500">Audit not found</div>;

  const score = audit.score;
  const cert = audit.certificate;

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <Navbar title={`Audit Completed: ${audit.venue?.name}`} />

      {/* Success Banner */}
      <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-emerald-700">
        <div className="p-3.5 bg-white/15 rounded-2xl shrink-0 backdrop-blur-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">Audit Submitted Successfully</h2>
          <p className="text-xs text-emerald-100 mt-0.5 font-medium">
            Audit No: <span className="font-mono font-bold text-white">{audit.auditNo}</span> • Evaluated via Rule Engine & Score Engine
          </p>
        </div>
      </div>

      {/* Score & Certificate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Score Engine Result</h3>
          {score && <ScoreGauge score={score.overallScore} isFit={score.isFit} />}

          {score && (
            <Card>
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Housekeeping:</span>
                  <span className="font-bold text-slate-900">{score.housekeepingScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Electrical:</span>
                  <span className="font-bold text-slate-900">{score.electricalScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Plumbing:</span>
                  <span className="font-bold text-slate-900">{score.plumbingScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Network:</span>
                  <span className="font-bold text-slate-900">{score.networkScore}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Documentation:</span>
                  <span className="font-bold text-slate-900">{score.documentationScore}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Generated Certificate</h3>
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

      <div className="pt-2">
        <Link href="/auditor">
          <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Auditor Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

