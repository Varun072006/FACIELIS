'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
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
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboard() {
  const { user } = useAuth();

  // Fetch venue owner questionnaire batch
  const { data: batch } = useQuery({
    queryKey: ['owner-batch', user?.venueId],
    queryFn: () => fetch(`/api/owner/batch?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch owner reported defects
  const { data: ownerDefects } = useQuery({
    queryKey: ['owner-defects', user?.venueId],
    queryFn: () => fetch(`/api/owner/defects?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch venue audit reports
  const { data: auditReports } = useQuery({
    queryKey: ['owner-audit-reports', user?.venueId],
    queryFn: () => fetch(`/api/owner/audit-reports?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch technician repair logs for venue
  const { data: repairLogs } = useQuery({
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

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Venue Owner — Facility Assurance Command Center" />

      {/* Hero Welcome Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            Responsible Venue Owner Portal
          </span>
          <h2 className="text-xl font-black mt-2">Welcome, {user?.name || 'Venue Owner'}</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            You are responsible for all components in <strong className="text-white underline">{venueName}</strong>. Answer 15-day facility questionnaires, report defects, review auditor reports, and oversee missed audit reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/owner/questionnaire"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Answer 15-Day Questionnaire</span>
          </Link>
        </div>
      </div>

      {/* Missed Audit Emergency Alert Banner */}
      {missedAudit && (
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm">Auditor Inspection Missed for Your Venue!</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Audit <strong className="font-mono">{missedAudit.auditNo}</strong> was missed by the auditor due to important work. As Venue Owner, you are empowered to review the venue status and mark it clear.
              </p>
            </div>
          </div>
          <Link
            href="/owner/audit-reports"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            Review & Clear Audit
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Core Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Questionnaire Action Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#173B72] flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Periodic 15-Day Questionnaire</h3>
              <p className="text-xs text-gray-500 mt-1">
                Answer ~30 periodic component check questions sent by manager. Auto-submits on 15th day.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {answeredCount}/{totalQuestions} Answered
            </span>
            <Link
              href="/owner/questionnaire"
              className="text-xs font-bold text-[#173B72] hover:underline flex items-center gap-1"
            >
              Open Questionnaire <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Defect Reporting Action Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Report Venue Defect</h3>
              <p className="text-xs text-gray-500 mt-1">
                Log component breakdowns or defects directly within your venue during the 15-day period.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-600">
              {openDefectsCount} Active Open
            </span>
            <Link
              href="/owner/defects"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Report Defect <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Auditor Reports Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Auditor Reports & Scores</h3>
              <p className="text-xs text-gray-500 mt-1">
                Inspect official auditor score breakdowns, fitness certificates, and review missed audits.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700">
              {Array.isArray(auditReports) ? auditReports.length : 0} Reports Recorded
            </span>
            <Link
              href="/owner/audit-reports"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              View Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Solved Technician Repairs Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Solved Technician Repairs</h3>
              <p className="text-xs text-gray-500 mt-1">
                View resolution proofs, repair photos, and technician remarks for defects fixed in your venue.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700">
              {totalRepairs} Fixes Logged
            </span>
            <Link
              href="/owner/repairs"
              className="text-xs font-bold text-purple-800 hover:underline flex items-center gap-1"
            >
              View Repair Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
