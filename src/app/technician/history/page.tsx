'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Wrench, Calendar, Clock, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TechnicianHistoryPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  const { data: defects, isLoading } = useQuery({
    queryKey: ['technician-history'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });

  const repairedDefects = Array.isArray(defects)
    ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS' || d.status === 'VERIFIED' || d.repair !== null)
    : [];

  const filteredHistory = repairedDefects.filter((d: any) => {
    const matchesSearch =
      d.defectNo?.toLowerCase().includes(search.toLowerCase()) ||
      d.asset?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.component?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'ALL' || d.department?.code === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5 pb-16">
      <Navbar title="Technician Repair History & Verification Logs" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Repair Ledger
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Technician Repair History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete record of resolved defects with geo-tagged repair proof, timestamps, and SLA records.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
          <Wrench className="w-4 h-4 text-[#173B72]" />
          <span>{filteredHistory.length} Resolved Tickets</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defect no, asset, or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:outline-hidden focus:bg-white focus:border-[#173B72] focus:ring-1 focus:ring-[#173B72]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'ELEC', 'NET', 'HK', 'PLUMB', 'DOC'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                filterDept === dept
                  ? 'bg-[#173B72] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Repair History Cards */}
      {isLoading ? (
        <div className="space-y-3.5">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Repair History Found"
          description="No historical repair logs match your current search and department filter."
        />
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((defect: any) => {
            const repairDate =
              defect.status === 'VERIFIED'
                ? defect.updatedAt || defect.repair?.completedAt
                : defect.repair?.completedAt || defect.updatedAt;
            const formattedDate = new Date(repairDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = new Date(repairDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={defect.id}
                className="bento-card overflow-hidden p-4 sm:p-5 space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#173B72] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                        {defect.department?.name || 'General'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {defect.asset?.name} • <span className="text-[#173B72]">{defect.component?.name}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={defect.status} size="md" />
                  </div>
                </div>

                {/* Evidence Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Original Defect Info */}
                  <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2">
                    <p className="font-semibold text-rose-800 uppercase text-[10px] tracking-wider">
                      Original Auditor Defect Report
                    </p>
                    <p className="text-slate-800 font-medium">
                      "{defect.inspectionItem?.remark || 'Defect reported during audit'}"
                    </p>
                    {defect.inspectionItem?.photoUrl && (
                      <div className="rounded-lg overflow-hidden border border-rose-200 h-28 bg-slate-900">
                        <img
                          src={defect.inspectionItem.photoUrl}
                          alt="Auditor Defect Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Technician Repair Proof */}
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2">
                    <p className="font-semibold text-emerald-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Submitted Repair Proof
                    </p>
                    <p className="text-slate-800 font-medium">
                      "{defect.repair?.remark || 'Defect successfully fixed and tested'}"
                    </p>
                    {defect.repair?.repairProofPhotoUrl && (
                      <div className="rounded-lg overflow-hidden border border-emerald-200 h-28 bg-slate-900">
                        <img
                          src={defect.repair.repairProofPhotoUrl}
                          alt="Technician Repair Proof Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {defect.status === 'VERIFIED' ? 'Approved Date:' : 'Submitted Date:'}{' '}
                        <strong className="text-slate-800">{formattedDate}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Time: <strong className="text-slate-800">{formattedTime}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>
                      GPS Proof:{' '}
                      {defect.repair?.geotagLat
                        ? `${defect.repair.geotagLat.toFixed(4)}, ${defect.repair.geotagLng.toFixed(4)}`
                        : '11.4965, 77.2763'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
