'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ClipboardList, AlertTriangle, ShieldCheck, Wrench, Award, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const { data: audits } = useQuery({ queryKey: ['audits'], queryFn: () => fetch('/api/audits').then((res) => res.json()) });
  const { data: defects } = useQuery({ queryKey: ['defects'], queryFn: () => fetch('/api/defects').then((res) => res.json()) });
  const { data: certs } = useQuery({ queryKey: ['certificates'], queryFn: () => fetch('/api/certificates').then((res) => res.json()) });

  const activeAudits = Array.isArray(audits) ? audits.length : 0;
  const pendingDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'OPEN' || d.status === 'ASSIGNED').length : 0;
  const pendingCrossDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS').length : 0;
  const overdueDefects = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;

  return (
    <div className="space-y-6">
      <Navbar title="Facility Operations Manager — Control Center" />

      {/* Action Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">Operational Manager Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Schedule audits, assign technicians, monitor SLA deadlines, and validate facility certificates.</p>
        </div>
        <Link
          href="/manager/audit-schedule"
          className="px-4 py-2.5 rounded-xl bg-[#173B72] text-white font-bold text-xs hover:bg-[#1e4a8e] transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Audit</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Audit Schedules"
          value={activeAudits}
          subtitle="Auditors Assigned"
          icon={ClipboardList}
          variant="default"
        />
        <StatCard
          title="Active Defects"
          value={pendingDefects}
          subtitle={`${overdueDefects} Overdue`}
          icon={AlertTriangle}
          variant={overdueDefects > 0 ? 'critical' : 'warning'}
        />
        <StatCard
          title="Pending Cross-Audits"
          value={pendingCrossDefects}
          subtitle="Awaiting Verification"
          icon={ShieldCheck}
          variant="default"
        />
        <StatCard
          title="Fitness Certificates"
          value={Array.isArray(certs) ? certs.length : 0}
          subtitle="Audit Backed"
          icon={Award}
          variant="success"
        />
      </div>

      {/* Quick Action Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Audits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#173B72]" />
              <span>Assigned Audits Overview</span>
            </h3>
            <Link href="/manager/audit-schedule" className="text-xs font-bold text-[#173B72] hover:underline">View All</Link>
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
                  <StatusBadge status={audit.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No scheduled audits found.</div>
          )}
        </div>

        {/* Recent Defects */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recent Open Defects</span>
            </h3>
            <Link href="/manager/defects" className="text-xs font-bold text-[#173B72] hover:underline">Manage Defects</Link>
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
                  <StatusBadge status={defect.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No open defects.</div>
          )}
        </div>
      </div>
    </div>
  );
}
