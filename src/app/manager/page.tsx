'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  Award,
  Plus,
  ArrowUpRight,
  CheckSquare,
  Wrench,
  BarChart3,
  Clock,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';

export default function ManagerDashboard() {
  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => fetch('/api/audits').then((res) => res.json()),
  });
  const { data: defects, isLoading: defectsLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });
  const { data: certs, isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => fetch('/api/certificates').then((res) => res.json()),
  });

  const isLoading = auditsLoading || defectsLoading || certsLoading;

  const activeAudits = Array.isArray(audits) ? audits.length : 0;
  const pendingReviewAudits = Array.isArray(audits) ? audits.filter((a: any) => a.status === 'PENDING_REVIEW').length : 0;
  const pendingDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'OPEN' || d.status === 'ASSIGNED').length : 0;
  const pendingCrossDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS').length : 0;
  const overdueDefects = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;

  const auditSparkData = [
    { v: Math.max(1, pendingReviewAudits - 2) },
    { v: Math.max(2, pendingReviewAudits) },
    { v: Math.max(1, pendingReviewAudits + 1) },
    { v: Math.max(1, pendingReviewAudits) },
  ];

  const defectSparkData = [
    { v: Math.max(1, pendingDefects + 2) },
    { v: Math.max(2, pendingDefects + 1) },
    { v: Math.max(1, pendingDefects) },
    { v: Math.max(0, overdueDefects) },
  ];

  const repairSparkData = [
    { v: Math.max(0, pendingCrossDefects - 1) },
    { v: Math.max(1, pendingCrossDefects + 2) },
    { v: Math.max(1, pendingCrossDefects) },
  ];

  const certSparkData = [
    { v: 1 },
    { v: 3 },
    { v: 4 },
    { v: Array.isArray(certs) ? certs.length : 5 },
  ];

  return (
    <div className="space-y-5">
      <Navbar title="Operations Manager Command Center" />

      {/* Action Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Facility Operations
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Operations Manager Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Schedule audits, analyze score breakdowns, approve technician assignments, track defect resolution, and sign off facility certificates.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pendingReviewAudits > 0 && (
            <Link
              href="/manager/audit-schedule"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingReviewAudits} Awaiting Approval</span>
            </Link>
          )}
          <Link
            href="/manager/audit-schedule"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule New Audit</span>
          </Link>
        </div>
      </div>

      {/* Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {isLoading ? (
          <>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </>
        ) : (
          <>
            <StatCard
              title="Audits Pending Approval"
              value={pendingReviewAudits}
              subtitle="Manager Sign-off Needed"
              icon={ClipboardList}
              variant={pendingReviewAudits > 0 ? 'warning' : 'default'}
              sparkline={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={auditSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#d97706" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <StatCard
              title="Active Defects"
              value={pendingDefects}
              subtitle={`${overdueDefects} Overdue SLA`}
              icon={AlertTriangle}
              variant={overdueDefects > 0 ? 'critical' : 'warning'}
              sparkline={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defectSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#dc2626" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <StatCard
              title="Pending Repair Sign-offs"
              value={pendingCrossDefects}
              subtitle="Field Repairs Ready"
              icon={ShieldCheck}
              variant="default"
              sparkline={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={repairSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#173b72" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <StatCard
              title="Fitness Certificates"
              value={Array.isArray(certs) ? certs.length : 0}
              subtitle="Issued & Validated"
              icon={Award}
              variant="success"
              sparkline={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={certSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
          </>
        )}
      </div>

      {/* Bento Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Bento: Audits & Approval Queue */}
        <div className="bento-card p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#173B72]" />
              <h3 className="font-bold text-sm text-slate-900">Audits & Approval Queue</h3>
            </div>
            <Link
              href="/manager/audit-schedule"
              className="text-xs font-semibold text-[#173B72] hover:text-[#1e4a8e] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {Array.isArray(audits) && audits.length > 0 ? (
            <div className="space-y-2">
              {audits.slice(0, 4).map((audit: any) => (
                <div
                  key={audit.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                    <p className="font-semibold text-slate-900 truncate mt-0.5">{audit.venue?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">Auditor: {audit.auditor?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={audit.status} />
                    <Link
                      href="/manager/audit-schedule"
                      className="text-[11px] font-semibold text-[#173B72] bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      {audit.status === 'PENDING_REVIEW' ? 'Review & Approve' : 'View'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">No scheduled audits found.</div>
          )}
        </div>

        {/* Right Bento: Defects Lifecycle & Routing Queue */}
        <div className="bento-card p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Defect Triage & Routing Queue</h3>
            </div>
            <Link
              href="/manager/defects"
              className="text-xs font-semibold text-[#173B72] hover:text-[#1e4a8e] flex items-center gap-1"
            >
              <span>Track All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {Array.isArray(defects) && defects.length > 0 ? (
            <div className="space-y-2">
              {defects.slice(0, 4).map((defect: any) => (
                <div
                  key={defect.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs text-slate-700">{defect.defectNo}</span>
                    <p className="font-semibold text-slate-900 truncate mt-0.5">{defect.component?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {defect.department?.name || 'General'} • Priority: {defect.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={defect.status} />
                    <Link
                      href="/manager/defects"
                      className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">No active defects.</div>
          )}
        </div>
      </div>

      {/* Operational Quick Launch Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          href="/manager/assignments"
          className="bento-card p-3 flex items-center gap-2.5 hover:border-[#173B72] transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-700">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <span>Technician Assignments</span>
        </Link>
        <Link
          href="/manager/repair-approvals"
          className="bento-card p-3 flex items-center gap-2.5 hover:border-[#173B72] transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <span>Repair Approvals</span>
        </Link>
        <Link
          href="/manager/sla"
          className="bento-card p-3 flex items-center gap-2.5 hover:border-[#173B72] transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="p-1.5 rounded-md bg-rose-50 text-rose-700">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span>SLA Monitor</span>
        </Link>
        <Link
          href="/manager/reports"
          className="bento-card p-3 flex items-center gap-2.5 hover:border-[#173B72] transition-colors text-xs font-semibold text-slate-800"
        >
          <div className="p-1.5 rounded-md bg-sky-50 text-sky-700">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span>Facility Analytics</span>
        </Link>
      </div>
    </div>
  );
}
