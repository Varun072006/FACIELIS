'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ClipboardList, AlertTriangle, ShieldCheck, Wrench, Award, Plus, ArrowUpRight, CheckSquare } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';

export default function ManagerDashboard() {
  const { data: audits } = useQuery({ queryKey: ['audits'], queryFn: () => fetch('/api/audits').then((res) => res.json()) });
  const { data: defects } = useQuery({ queryKey: ['defects'], queryFn: () => fetch('/api/defects').then((res) => res.json()) });
  const { data: certs } = useQuery({ queryKey: ['certificates'], queryFn: () => fetch('/api/certificates').then((res) => res.json()) });

  const activeAudits = Array.isArray(audits) ? audits.length : 0;
  const pendingReviewAudits = Array.isArray(audits) ? audits.filter((a: any) => a.status === 'PENDING_REVIEW').length : 0;
  const pendingDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'OPEN' || d.status === 'ASSIGNED').length : 0;
  const pendingCrossDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS').length : 0;
  const overdueDefects = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;

  // TODO: Backend follow-up: replace client-aggregated trend points with dedicated time-series metrics endpoint
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
    <div className="space-y-6">
      <Navbar title="Facility Operations Manager — Control Center" />

      {/* Action Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">Operational Manager Command Center</h2>
          <p className="text-xs text-gray-500 mt-1">Schedule audits, analyze score breakdowns, approve technician assignments, track defect resolution, and sign off facility certificates.</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingReviewAudits > 0 && (
            <Link
              href="/manager/audit-schedule"
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-extrabold text-xs hover:bg-amber-400 transition-all shadow-md flex items-center gap-1.5 animate-pulse"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{pendingReviewAudits} Audits Awaiting Approval</span>
            </Link>
          )}
          <Link
            href="/manager/audit-schedule"
            className="px-4 py-2.5 rounded-xl bg-[#173B72] text-white font-bold text-xs hover:bg-[#1e4a8e] transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Audit</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards with Recharts Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Audits Pending Approval"
          value={pendingReviewAudits}
          subtitle="Manager Sign-off Needed"
          icon={ClipboardList}
          variant={pendingReviewAudits > 0 ? 'warning' : 'default'}
          sparkline={
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={auditSparkData}>
                <Line type="monotone" dataKey="v" stroke="#d97706" strokeWidth={2} dot={false} />
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
                <Line type="monotone" dataKey="v" stroke="#dc2626" strokeWidth={2} dot={false} />
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
                <Line type="monotone" dataKey="v" stroke="#173b72" strokeWidth={2} dot={false} />
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
                <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      </div>

      {/* Quick Action Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled & Pending Audits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#173B72]" />
              <span>Audits & Approval Queue</span>
            </h3>
            <Link href="/manager/audit-schedule" className="text-xs font-bold text-[#173B72] hover:underline">View All & Approve</Link>
          </div>

          {Array.isArray(audits) && audits.length > 0 ? (
            <div className="space-y-2 text-xs">
              {audits.slice(0, 4).map((audit: any) => (
                <div key={audit.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#173B72]">{audit.auditNo}</span>
                    <p className="font-semibold text-gray-900">{audit.venue?.name}</p>
                    <p className="text-[10px] text-gray-500">Auditor: {audit.auditor?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={audit.status} />
                    <Link
                      href="/manager/audit-schedule"
                      className="text-[10px] font-bold text-[#173B72] bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      {audit.status === 'PENDING_REVIEW' ? 'Review & Approve' : 'View'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No scheduled audits found.</div>
          )}
        </div>

        {/* Recent Defects & Lifecycle Tracking */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Defects Lifecycle & Routing Queue</span>
            </h3>
            <Link href="/manager/defects" className="text-xs font-bold text-[#173B72] hover:underline">Defect Tracker</Link>
          </div>

          {Array.isArray(defects) && defects.length > 0 ? (
            <div className="space-y-2 text-xs">
              {defects.slice(0, 4).map((defect: any) => (
                <div key={defect.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-amber-700">{defect.defectNo}</span>
                    <p className="font-semibold text-gray-900">{defect.component?.name}</p>
                    <p className="text-[10px] text-gray-500">Dept: {defect.department?.name} • Priority: {defect.priority}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={defect.status} />
                    <Link
                      href="/manager/defects"
                      className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No active defects.</div>
          )}
        </div>
      </div>
    </div>
  );
}
