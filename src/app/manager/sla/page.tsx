'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SLAPage() {
  const { data: defects } = useQuery({ queryKey: ['defects'], queryFn: () => fetch('/api/defects').then((res) => res.json()) });

  const total = Array.isArray(defects) ? defects.length : 0;
  const overdue = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;
  const resolved = Array.isArray(defects) ? defects.filter((d: any) => d.status === 'VERIFIED').length : 0;
  const rate = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

  return (
    <div className="space-y-6">
      <Navbar title="SLA Compliance Monitoring" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="SLA Compliance Rate" value={`${rate}%`} subtitle="Target > 95%" icon={ShieldCheck} variant="success" />
        <StatCard title="Total Defects Tracked" value={total} subtitle="Across 5 Departments" icon={Clock} variant="default" />
        <StatCard title="SLA Breach Count" value={overdue} subtitle="Escalations Active" icon={AlertTriangle} variant={overdue > 0 ? 'critical' : 'default'} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3">Department SLA Thresholds</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">Electrical Department</p>
            <p className="text-gray-500 mt-1">P1 Critical: 1-2 Hours</p>
            <p className="text-gray-500">P2 High: 4 Hours</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">Network Department</p>
            <p className="text-gray-500 mt-1">P2 Ethernet: 4 Hours</p>
            <p className="text-gray-500">P3 PC Display: 8 Hours</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">Plumbing Department</p>
            <p className="text-gray-500 mt-1">P2 AC Drain Leak: 4 Hours</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">Housekeeping</p>
            <p className="text-gray-500 mt-1">P3 Sanitation: 12 Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
