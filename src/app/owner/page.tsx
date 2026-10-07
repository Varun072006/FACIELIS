'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton, EmptyState } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import {
  Building2,
  CheckSquare,
  AlertTriangle,
  ClipboardList,
  Wrench,
  Award,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboard() {
  const { user } = useAuth();

  // Fetch venue owner questionnaire batch
  const { data: batch, isLoading: isBatchLoading } = useQuery({
    queryKey: ['owner-batch', user?.venueId],
    queryFn: () => fetch(`/api/owner/batch?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch owner reported defects
  const { data: ownerDefects, isLoading: isDefectsLoading } = useQuery({
    queryKey: ['owner-defects', user?.venueId],
    queryFn: () => fetch(`/api/owner/defects?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch venue audit reports
  const { data: auditReports, isLoading: isAuditsLoading } = useQuery({
    queryKey: ['owner-audit-reports', user?.venueId],
    queryFn: () => fetch(`/api/owner/audit-reports?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch technician repair logs for venue
  const { data: repairLogs, isLoading: isRepairsLoading } = useQuery({
    queryKey: ['owner-repair-logs', user?.venueId],
    queryFn: () => fetch(`/api/owner/repair-logs?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  const venueName = batch?.venue?.name || 'Right Cabin (Cabin 3)';
  const totalQuestions = batch?.questions?.length || 30;
  const answeredCount = batch?.responses?.length || 0;

  // Days remaining calculation
  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const now = new Date();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 15;

  const openDefectsCount = Array.isArray(ownerDefects)
    ? ownerDefects.filter((d: any) => d.status === 'OPEN' || d.status === 'ASSIGNED').length
    : 0;

  const latestAudit = Array.isArray(auditReports) && auditReports.length > 0 ? auditReports[0] : null;
  const missedAudit = Array.isArray(auditReports) ? auditReports.find((a: any) => a.status === 'MISSED') : null;
  const totalRepairs = Array.isArray(repairLogs) ? repairLogs.length : 0;

  const isLoadingAny = isBatchLoading && isDefectsLoading;

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Venue Owner — Facility Assurance Command Center" />

      {/* Hero Welcome Banner */}
      <div className="bg-[#173B72] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Responsible Venue Owner Portal</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Welcome, {user?.name || 'Venue Owner'}</h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            You hold direct stewardship for all physical infrastructure and components in{' '}
            <strong className="text-white underline decoration-emerald-400 decoration-2 underline-offset-2">
              {venueName}
            </strong>
            . Complete 15-day verification cycles, report breakdowns, inspect official audit certificates, and clear missed audits.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link href="/owner/questionnaire">
            <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs shadow-lg border-0">
              <CheckSquare className="w-4 h-4 mr-1.5" />
              <span>Answer 15-Day Questionnaire</span>
            </Button>
          </Link>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Missed Audit Emergency Alert Banner */}
      {missedAudit && (
        <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-amber-950">Auditor Inspection Missed for Your Venue!</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">Action Required</span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Audit <strong className="font-mono font-bold">{missedAudit.auditNo}</strong> was missed by the auditor due to official conflict. As Venue Owner, you are empowered to conduct an owner self-review and sign off on facility clearance.
              </p>
            </div>
          </div>
          <Link href="/owner/audit-reports" className="shrink-0">
            <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold whitespace-nowrap">
              Review & Clear Audit
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingAny ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <StatCard
              title="15-Day Questionnaire"
              value={`${answeredCount}/${totalQuestions}`}
              subtitle={`${daysLeft} Days Left in Cycle`}
              icon={CheckSquare}
              variant={answeredCount < totalQuestions ? 'warning' : 'success'}
            />
            <StatCard
              title="Owner-Reported Defects"
              value={openDefectsCount}
              subtitle="Direct Venue Reports"
              icon={AlertTriangle}
              variant={openDefectsCount > 0 ? 'critical' : 'default'}
            />
            <StatCard
              title="Latest Audit Score"
              value={latestAudit?.score ? `${latestAudit.score.overallScore}%` : 'N/A'}
              subtitle={latestAudit?.score?.isFit ? 'Fitness Verified (FIT)' : 'Pending / Review'}
              icon={Award}
              variant={latestAudit?.score?.isFit ? 'success' : 'default'}
            />
            <StatCard
              title="Solved Repairs Logs"
              value={totalRepairs}
              subtitle="Technician Fixes Verified"
              icon={Wrench}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Core Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Questionnaire Action Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#173B72] flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Periodic 15-Day Questionnaire</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Answer ~30 periodic component check questions sent by manager. Auto-submits on 15th day.
              </p>
            </div>
          </CardContent>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {answeredCount}/{totalQuestions} Answered
            </span>
            <Link
              href="/owner/questionnaire"
              className="text-xs font-bold text-[#173B72] hover:underline flex items-center gap-1"
            >
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Defect Reporting Action Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Report Venue Defect</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Log component breakdowns or defects directly within your venue during the 15-day period.
              </p>
            </div>
          </CardContent>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-600">
              {openDefectsCount} Active Open
            </span>
            <Link
              href="/owner/defects"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Auditor Reports Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Auditor Reports & Scores</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Inspect official auditor score breakdowns, fitness certificates, and review missed audits.
              </p>
            </div>
          </CardContent>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {Array.isArray(auditReports) ? auditReports.length : 0} Reports
            </span>
            <Link
              href="/owner/audit-reports"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Solved Technician Repairs Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Solved Technician Repairs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                View resolution proofs, repair photos, and technician remarks for defects fixed in your venue.
              </p>
            </div>
          </CardContent>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              {totalRepairs} Fixes Logged
            </span>
            <Link
              href="/owner/repairs"
              className="text-xs font-bold text-purple-800 hover:underline flex items-center gap-1"
            >
              <span>Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
