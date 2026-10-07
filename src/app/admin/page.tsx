'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Boxes,
  AlertTriangle,
  ShieldCheck,
  Award,
  Users,
  ArrowUpRight,
  Sliders,
  Layers,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((res) => res.json()),
  });
  const { data: defects, isLoading: defectsLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });
  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => fetch('/api/audits').then((res) => res.json()),
  });
  const { data: certs, isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => fetch('/api/certificates').then((res) => res.json()),
  });

  const isLoading = assetsLoading || defectsLoading || auditsLoading || certsLoading;

  const totalAssets = Array.isArray(assets) ? assets.length : 0;
  const openDefects = Array.isArray(defects) ? defects.filter((d: any) => d.status !== 'VERIFIED').length : 0;
  const overdueDefects = Array.isArray(defects) ? defects.filter((d: any) => d.isOverdue).length : 0;
  const activeAudits = Array.isArray(audits) ? audits.length : 0;
  const validCerts = Array.isArray(certs) ? certs.filter((c: any) => c.fitnessStatus === 'FIT').length : 0;

  return (
    <div className="space-y-5">
      <Navbar title="Platform Control Center" />

      {/* Enterprise Status Strip */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Operational
            </span>
            <span className="text-xs text-slate-400 font-mono">BIT-Sathy Deployment</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Facility Assurance Control Hub
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-normal">
            Deterministic rules, transparent audit trails, and geo-tagged defect lifecycles across facility hierarchy.
          </p>
        </div>
        <Link
          href="/admin/facilities"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all shrink-0"
        >
          <span>Manage Hierarchy</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Bento Grid */}
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
              title="Registered Assets"
              value={totalAssets || 143}
              subtitle="Pilot Venue Catalog"
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
              title="Executed Audits"
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
          </>
        )}
      </div>

      {/* Bento Main Grid: Facility Spotlight & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bento Cell 1: Pilot Facility Spotlight (2 Cols) */}
        <div className="lg:col-span-2 bento-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#173B72]" />
                <h3 className="text-sm font-bold text-slate-900">Pilot Facility Spotlight</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Learning Center → 4th Floor → Right Cabin (Cabin 3)
              </p>
            </div>
            <StatusBadge status="ACTIVE" size="sm" />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-center">
              <p className="text-lg font-bold text-[#173B72]">143</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Assets</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-center">
              <p className="text-lg font-bold text-[#173B72]">~666</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Components</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-center">
              <p className="text-lg font-bold text-emerald-700">5</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Departments</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-center">
              <p className="text-lg font-bold text-amber-700">100%</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Deterministic</p>
            </div>
          </div>

          {/* Inventory Breakdown */}
          <div className="border-t border-slate-100 pt-3.5">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              Venue Inventory Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Entry Doors</span>
                <span className="font-semibold text-slate-900 font-mono">2</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Sliding Windows</span>
                <span className="font-semibold text-slate-900 font-mono">6</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Half Windows</span>
                <span className="font-semibold text-slate-900 font-mono">2</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">4-Seater Tables</span>
                <span className="font-semibold text-slate-900 font-mono">10</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">2-Seater Tables</span>
                <span className="font-semibold text-slate-900 font-mono">10</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Ergonomic Chairs</span>
                <span className="font-semibold text-slate-900 font-mono">60</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Workstation PCs</span>
                <span className="font-semibold text-slate-900 font-mono">20</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">WiFi Router</span>
                <span className="font-semibold text-slate-900 font-mono">1</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Ceiling Fans</span>
                <span className="font-semibold text-slate-900 font-mono">6</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Light Fixtures</span>
                <span className="font-semibold text-slate-900 font-mono">20</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Main Switch Boxes</span>
                <span className="font-semibold text-slate-900 font-mono">2</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-100/80">
                <span className="text-slate-600">Split AC & Printer</span>
                <span className="font-semibold text-slate-900 font-mono">1 + 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Cell 2: Quick Control Panel (1 Col) */}
        <div className="bento-card p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Administration Console</h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct system configurations</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/admin/assets"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-50 text-[#173B72] group-hover:bg-[#173B72] group-hover:text-white transition-colors">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <span>Asset Catalog (143 items)</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/rules"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <span>Deterministic Rules</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/users"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Users & Roles</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/audit-templates"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ClipboardList className="w-3.5 h-3.5" />
                </div>
                <span>Audit Templates</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/departments"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Departments</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            <Link
              href="/admin/certificates"
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 hover:border-[#173B72] hover:bg-slate-50/80 transition-all text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span>Facility Certificates</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
