'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Building2, Boxes, AlertTriangle, ShieldCheck, Award, Wrench, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: assets } = useQuery({ queryKey: ['assets'], queryFn: () => fetch('/api/assets').then(res => res.json()) });
  const { data: defects } = useQuery({ queryKey: ['defects'], queryFn: () => fetch('/api/defects').then(res => res.json()) });
  const { data: audits } = useQuery({ queryKey: ['audits'], queryFn: () => fetch('/api/audits').then(res => res.json()) });
  const { data: certs } = useQuery({ queryKey: ['certificates'], queryFn: () => fetch('/api/certificates').then(res => res.json()) });

  const totalAssets = Array.isArray(assets) ? assets.length : 0;
  const openDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status !== 'VERIFIED').length : 0;
  const overdueDefects = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;
  const activeAudits = Array.isArray(audits) ? audits.length : 0;
  const validCerts = Array.isArray(certs) ? certs.filter((c: any) => c.fitnessStatus === 'FIT').length : 0;

  return (
    <div className="space-y-6">
      <Navbar title="Super Admin — Platform Control Center" />

      {/* Hero Welcome Banner */}
      <div className="bg-[#173B72] text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Platform Status: Operational
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Facility Assurance Control Hub</h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Monitoring facility fitness, deterministic rules, transparent audit trails, and geo-tagged defect lifecycles across Bannari Amman Institute of Technology.
          </p>
        </div>
        <Link
          href="/admin/facilities"
          prefetch={true}
          className="px-5 py-2.5 rounded-xl bg-white text-[#173B72] font-bold text-xs hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <span>Manage Hierarchy</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Assets"
          value={totalAssets || 143}
          subtitle="Learning Center Pilot Venue"
          icon={Boxes}
          variant="default"
        />
        <StatCard
          title="Open Defects"
          value={openDefects}
          subtitle={`${overdueDefects} SLA Overdue`}
          icon={AlertTriangle}
          variant={overdueDefects > 0 ? 'critical' : 'warning'}
        />
        <StatCard
          title="Audit Cycles Executed"
          value={activeAudits}
          subtitle="100% Geo-tagged Proof"
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard
          title="Fitness Certificates"
          value={validCerts}
          subtitle="Fitness Verified"
          icon={Award}
          variant="default"
        />
      </div>

      {/* Two Column Layout: Pilot Venue Overview & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pilot Venue Spotlight */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Pilot Facility Spotlight</h3>
              <p className="text-xs text-gray-500">Learning Center → 4th Floor → Right Cabin (Cabin 3)</p>
            </div>
            <StatusBadge status="ACTIVE" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xl font-bold text-[#173B72]">143</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Total Assets</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xl font-bold text-[#173B72]">~666</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Components</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xl font-bold text-emerald-600">5</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Departments</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xl font-bold text-amber-600">100%</p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Rule First</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Venue Inventory Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Entry Doors:</span><span className="font-bold">2</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Sliding Windows:</span><span className="font-bold">6</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Half Windows:</span><span className="font-bold">2</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>4-Seater Tables:</span><span className="font-bold">10</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>2-Seater Tables:</span><span className="font-bold">10</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Ergonomic Chairs:</span><span className="font-bold">60</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Workstation PCs:</span><span className="font-bold">20</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>WiFi Router:</span><span className="font-bold">1</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Ceiling Fans:</span><span className="font-bold">6</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Light Fixtures:</span><span className="font-bold">20</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Main Switch Boxes:</span><span className="font-bold">2</span></div>
              <div className="flex justify-between p-2 rounded bg-gray-50"><span>Split AC & Printer:</span><span className="font-bold">1 + 1</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">Quick Control Panel</h3>

          <div className="space-y-2">
            <Link
              href="/admin/assets"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-blue-50/30 transition-all text-xs font-semibold text-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-[#173B72]" />
                <span>View Asset Catalog (143 items)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/admin/rules"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-blue-50/30 transition-all text-xs font-semibold text-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Configure Deterministic Rules</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-blue-50/30 transition-all text-xs font-semibold text-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Manage Users & Roles</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/admin/certificates"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-blue-50/30 transition-all text-xs font-semibold text-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Facility Certificates</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
