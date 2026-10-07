'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import {
  CheckSquare,
  AlertTriangle,
  ClipboardList,
  Wrench,
  Award,
  ArrowRight,
  ShieldAlert,
  Building2,
  Clock,
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

  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const now = new Date();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 15;

  const openDefectsCount = Array.isArray(ownerDefects)
    ? ownerDefects.filter((d: any) => d.status === 'OPEN' || d.status === 'ASSIGNED').length
    : 0;

  const latestAudit = Array.isArray(auditReports) && auditReports.length > 0 ? auditReports[0] : null;
  const missedAudit = Array.isArray(auditReports) ? auditReports.find((a: any) => a.status === 'MISSED') : null;
  const totalRepairs = Array.isArray(repairLogs) ? repairLogs.length : 0;

  const isLoadingAny = isBatchLoading || isDefectsLoading;

  return (
    <div className="space-y-5 pb-12">
      <Navbar title="Venue Owner Command Center" />

      {/* Enterprise Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Venue Stewardship
            </span>
            <span className="text-xs text-slate-400 font-mono">Owner: {user?.name || 'Venue Owner'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {venueName} Assurance Center
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-normal">
            Direct stewardship for all infrastructure in this venue. Complete 15-day verification cycles, report breakdowns, inspect official audit certificates, and clear missed audits.
          </p>
        </div>

        <div className="shrink-0">
          <Link href="/owner/questionnaire">
            <Button variant="primary" size="sm" className="shadow-2xs">
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              <span>15-Day Questionnaire</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Missed Audit Emergency Alert Banner */}
      {missedAudit && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-amber-950">Auditor Inspection Missed for Your Venue</h4>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">Action Required</span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-normal">
                Audit <strong className="font-mono">{missedAudit.auditNo}</strong> was missed due to official conflict. You are empowered to conduct an owner self-review and sign off on facility clearance.
              </p>
            </div>
          </div>
          <Link href="/owner/audit-reports" className="shrink-0">
            <Button variant="primary" size="sm" className="bg-amber-700 hover:bg-amber-800 text-white font-bold whitespace-nowrap">
              Review & Clear Audit
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {isLoadingAny ? (
          <>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
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
              title="Venue-Reported Defects"
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

      {/* Bento Core Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Questionnaire Bento Card */}
        <div className="bento-card p-4.5 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#173B72] flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Periodic Questionnaire</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Answer periodic component check questions. Auto-submits on the 15th day.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {answeredCount}/{totalQuestions} Answered
            </span>
            <Link
              href="/owner/questionnaire"
              className="font-semibold text-[#173B72] hover:text-[#1e4a8e] flex items-center gap-1"
            >
              <span>Open</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Defect Reporting Bento Card */}
        <div className="bento-card p-4.5 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Report Venue Defect</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Log component breakdowns or defects directly within your venue during operations.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-600">
              {openDefectsCount} Active Open
            </span>
            <Link
              href="/owner/defects"
              className="font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Report</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Auditor Reports Bento Card */}
        <div className="bento-card p-4.5 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Auditor Reports & Scores</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Inspect official auditor score breakdowns, fitness certificates, and review missed audits.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              {Array.isArray(auditReports) ? auditReports.length : 0} Reports
            </span>
            <Link
              href="/owner/audit-reports"
              className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Solved Repairs Bento Card */}
        <div className="bento-card p-4.5 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Solved Repair Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                View resolution proofs, repair photos, and technician remarks for defects fixed in your venue.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
              {totalRepairs} Fixes Logged
            </span>
            <Link
              href="/owner/repairs"
              className="font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
