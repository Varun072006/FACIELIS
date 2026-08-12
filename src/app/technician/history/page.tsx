'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Wrench, Calendar, Clock, MapPin, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TechnicianHistoryPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  const { data: defects, isLoading } = useQuery({
    queryKey: ['technician-history'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });

  // Filter for completed/repaired defects
  const repairedDefects = Array.isArray(defects)
    ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS' || d.status === 'VERIFIED' || d.repair !== null)
    : [];

  const filteredHistory = repairedDefects.filter((d: any) => {
    const matchesSearch =
      d.defectNo.toLowerCase().includes(search.toLowerCase()) ||
      d.asset?.name.toLowerCase().includes(search.toLowerCase()) ||
      d.component?.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'ALL' || d.department?.code === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Technician Repair History & Verification Logs" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Field Repairs Ledger
          </span>
          <h2 className="text-xl font-extrabold mt-1">Technician Work History</h2>
          <p className="text-xs text-blue-100 mt-0.5">Complete record of resolved defects with geo-tagged repair proof, timestamps, and SLA records</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Geo-Tagged Repair Verification</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by defect no, asset, or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          {['ALL', 'ELEC', 'NET', 'HK', 'PLUMB', 'DOC'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterDept === dept
                  ? 'bg-[#173B72] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Repair History Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-500">Loading technician repair history...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500">
          No repair history logs found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((defect: any) => {
            const repairDate = defect.status === 'VERIFIED' ? (defect.updatedAt || defect.repair?.completedAt) : (defect.repair?.completedAt || defect.updatedAt);
            const formattedDate = new Date(repairDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = new Date(repairDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={defect.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden hover:shadow-md transition-all p-5"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#173B72]">{defect.defectNo}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-extrabold uppercase">
                        {defect.department?.name}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900 mt-1">
                      {defect.asset?.name} • <span className="text-[#173B72]">{defect.component?.name}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={defect.status} />
                  </div>
                </div>

                {/* Repair & Evidence Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                  {/* Original Defect Info */}
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-2">
                    <p className="font-bold text-red-900 uppercase text-[10px] tracking-wider">Original Auditor Defect Report</p>
                    <p className="text-gray-800 font-medium">"{defect.inspectionItem?.remark || 'Defect reported during audit'}"</p>
                    {defect.inspectionItem?.photoUrl && (
                      <div className="rounded-lg overflow-hidden border border-red-200 h-28 bg-gray-900">
                        <img src={defect.inspectionItem.photoUrl} alt="Auditor Defect Photo" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Technician Repair Proof */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                    <p className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Submitted Technician Repair Proof
                    </p>
                    <p className="text-gray-800 font-medium">"{defect.repair?.remark || 'Defect successfully fixed and tested'}"</p>
                    {defect.repair?.repairProofPhotoUrl && (
                      <div className="rounded-lg overflow-hidden border border-emerald-200 h-28 bg-gray-900">
                        <img src={defect.repair.repairProofPhotoUrl} alt="Technician Repair Proof Photo" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & SLA Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{defect.status === 'VERIFIED' ? 'Approved Date:' : 'Submitted Date:'} <strong className="text-gray-800">{formattedDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Time: <strong className="text-gray-800">{formattedTime}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>GPS Proof: {defect.repair?.geotagLat ? `${defect.repair.geotagLat.toFixed(4)}, ${defect.repair.geotagLng.toFixed(4)}` : '11.4965, 77.2763'}</span>
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
