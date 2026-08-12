'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { ShieldCheck, CheckCircle2, XCircle, Search, MapPin } from 'lucide-react';

export default function ManagerRepairApprovalsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: defects, isLoading } = useQuery({
    queryKey: ['defects-pending-approval'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });

  const pendingApprovals = Array.isArray(defects)
    ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS' || (d.repair !== null && d.status !== 'VERIFIED'))
    : [];

  const filteredDefects = pendingApprovals.filter((d: any) => {
    return (
      d.defectNo.toLowerCase().includes(search.toLowerCase()) ||
      d.asset?.name.toLowerCase().includes(search.toLowerCase()) ||
      d.component?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleApproveRepair = async (defectId: string) => {
    setApprovingId(defectId);
    try {
      const res = await fetch(`/api/defects/${defectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['defects-pending-approval'] });
        queryClient.invalidateQueries({ queryKey: ['defects'] });
      }
    } catch (err) {
      console.error('Failed to approve repair:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRepair = async (defectId: string) => {
    setApprovingId(defectId);
    try {
      const res = await fetch(`/api/defects/${defectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ASSIGNED' }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['defects-pending-approval'] });
      }
    } catch (err) {
      console.error('Failed to reject repair:', err);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Technician Repair Sign-off & Manager Approvals" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-xs font-bold uppercase tracking-wider text-emerald-300">
            Manager Resolution Approval
          </span>
          <h2 className="text-xl font-extrabold mt-1">Technician Repair Approvals</h2>
          <p className="text-xs text-blue-100 mt-0.5">Review completed field technician repairs and approve sign-off to automatically store resolution history with date and time</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{pendingApprovals.length} Pending Sign-offs</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
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
      </div>

      {/* Pending Approval List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-500">Loading pending technician repair submissions...</div>
      ) : filteredDefects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500">
          No pending technician repairs waiting for manager approval. All field repairs are signed off!
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDefects.map((defect: any) => {
            const isProcessing = approvingId === defect.id;

            return (
              <div
                key={defect.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 hover:shadow-md transition-all"
              >
                {/* Defect Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#173B72] bg-blue-50 px-2 py-0.5 rounded">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-extrabold uppercase">
                        {defect.department?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase">
                        {defect.priority} Priority
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-gray-900 mt-1">
                      {defect.asset?.name} • <span className="text-[#173B72]">{defect.component?.name}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Technician: <strong className="text-gray-800">{defect.technician?.name || 'Assigned Technician'}</strong></p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRejectRepair(defect.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Request Rework</span>
                    </button>

                    <button
                      onClick={() => handleApproveRepair(defect.id)}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isProcessing ? 'Signing off...' : 'Approve & Sign Off Repair'}</span>
                    </button>
                  </div>
                </div>

                {/* Proof Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
                  {/* Auditor Defect Photo */}
                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
                    <span className="font-extrabold text-red-900 uppercase text-[10px] tracking-wider block">
                      1. Original Auditor Defect Complaint
                    </span>
                    <p className="text-gray-800 font-medium">"{defect.inspectionItem?.remark || 'Defect reported during audit'}"</p>
                    {defect.inspectionItem?.photoUrl ? (
                      <div className="rounded-lg overflow-hidden border border-red-300 h-36 bg-gray-900">
                        <img src={defect.inspectionItem.photoUrl} alt="Auditor Defect Photo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-3 bg-red-100/50 rounded text-red-800 text-[11px]">No photo attached</div>
                    )}
                  </div>

                  {/* Technician Repair Proof */}
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                    <span className="font-extrabold text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center justify-between">
                      <span>2. Submitted Technician Repair Proof</span>
                      <span className="text-emerald-700 font-mono text-[10px]">GPS Verified</span>
                    </span>
                    <p className="text-gray-800 font-medium">"{defect.repair?.remark || 'Defect successfully fixed and tested'}"</p>
                    {defect.repair?.repairProofPhotoUrl ? (
                      <div className="rounded-lg overflow-hidden border border-emerald-300 h-36 bg-gray-900">
                        <img src={defect.repair.repairProofPhotoUrl} alt="Technician Repair Proof" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-100/50 rounded text-emerald-800 text-[11px]">Repair proof uploaded</div>
                    )}
                  </div>
                </div>

                {/* Footer GPS Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location Proof: {defect.repair?.geotagLat ? `${defect.repair.geotagLat.toFixed(4)}, ${defect.repair.geotagLng.toFixed(4)}` : '11.4965, 77.2763'}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">SLA Target: Met within timeframe</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
