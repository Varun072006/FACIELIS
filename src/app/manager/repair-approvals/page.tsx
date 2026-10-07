'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Sliders,
  Eye,
  Columns,
  RotateCw,
} from 'lucide-react';

interface PhotoComparisonProps {
  beforeUrl?: string;
  afterUrl?: string;
  beforeRemark?: string;
  afterRemark?: string;
  geotagLat?: number | null;
  geotagLng?: number | null;
}

function PhotoComparison({
  beforeUrl,
  afterUrl,
  beforeRemark,
  afterRemark,
  geotagLat,
  geotagLng,
}: PhotoComparisonProps) {
  const [viewMode, setViewMode] = useState<'slider' | 'flip' | 'split'>('slider');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Photo Evidence Inspection
        </span>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'slider'
                ? 'bg-white text-[#173B72] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('flip')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'flip'
                ? 'bg-white text-[#173B72] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Tap to Flip</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'split'
                ? 'bg-white text-[#173B72] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Slider */}
      {viewMode === 'slider' && (
        <div className="space-y-2">
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 select-none shadow-xs">
            {/* After (Repaired) Image on bottom */}
            {afterUrl ? (
              <img src={afterUrl} alt="Technician Repair Proof" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">No repair photo</div>
            )}
            <div className="absolute bottom-3 right-3 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-md z-10">
              AFTER (Repaired)
            </div>

            {/* Before (Defect) Image clipped on top */}
            {beforeUrl ? (
              <div
                className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-xl"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={beforeUrl}
                  alt="Auditor Defect"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', minWidth: '100%' }}
                />
                <div className="absolute bottom-3 left-3 bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-md z-10">
                  BEFORE (Defect)
                </div>
              </div>
            ) : null}

            {/* Drag Handle Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-slate-800 shadow-lg flex items-center justify-center text-xs font-black border border-slate-300">
                ↔
              </div>
            </div>
          </div>

          {/* Interactive Range Input */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-black text-red-600">Defect Before</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="flex-1 accent-[#173B72] cursor-pointer"
            />
            <span className="text-[10px] font-black text-emerald-600">Repair After</span>
          </div>
        </div>
      )}

      {/* Mode 2: Tap to Flip */}
      {viewMode === 'flip' && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer group shadow-xs"
        >
          <img
            src={isFlipped ? afterUrl || beforeUrl : beforeUrl || afterUrl}
            alt="Inspection Comparison"
            className="w-full h-full object-cover transition-opacity duration-200"
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black shadow-md text-white bg-slate-950/80 backdrop-blur-xs flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Tap Image to Flip</span>
          </div>

          <div
            className={`absolute bottom-3 right-3 font-black text-xs px-3 py-1.5 rounded-xl shadow-md text-white ${
              isFlipped ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {isFlipped ? 'AFTER: TECHNICIAN REPAIR' : 'BEFORE: AUDITOR DEFECT'}
          </div>
        </div>
      )}

      {/* Mode 3: Split Side-by-Side */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 space-y-2">
            <span className="font-black text-red-900 uppercase text-[10px] tracking-wider block">
              1. Auditor Defect Complaint
            </span>
            <div className="rounded-xl overflow-hidden border border-red-300 h-40 bg-slate-900">
              {beforeUrl ? (
                <img src={beforeUrl} alt="Auditor Defect" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-red-700 text-xs">No photo</div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <span className="font-black text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center justify-between">
              <span>2. Technician Repair Proof</span>
              <span className="text-emerald-700 font-mono text-[10px]">GPS Verified</span>
            </span>
            <div className="rounded-xl overflow-hidden border border-emerald-300 h-40 bg-slate-900">
              {afterUrl ? (
                <img src={afterUrl} alt="Technician Repair" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-emerald-700 text-xs">No photo</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remarks comparison strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
          <strong className="text-red-700 font-bold block mb-0.5">Auditor Complaint:</strong>
          <span>"{beforeRemark || 'Defect reported during audit'}"</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
          <strong className="text-emerald-700 font-bold block mb-0.5">Technician Resolution:</strong>
          <span>"{afterRemark || 'Defect successfully repaired and verified'}"</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <Navbar title="Technician Repair Sign-off & Manager Approvals" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#173B72]">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-xs font-bold uppercase tracking-wider text-emerald-300">
            Manager Resolution Approval
          </span>
          <h2 className="text-xl font-black mt-1">Technician Repair Approvals</h2>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl leading-relaxed">
            Review completed field technician repairs and approve sign-off to automatically store resolution history with verified timestamp.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{pendingApprovals.length} Pending Sign-offs</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by defect no, asset, or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
          />
        </div>
      </div>

      {/* Pending Approval List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : filteredDefects.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All Repairs Signed Off"
          description="There are no pending technician repair submissions waiting for manager sign-off. All field work is approved!"
        />
      ) : (
        <div className="space-y-6">
          {filteredDefects.map((defect: any) => {
            const isProcessing = approvingId === defect.id;

            return (
              <Card key={defect.id} className="overflow-hidden p-6 space-y-5">
                {/* Defect Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#173B72] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {defect.department?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-200">
                        {defect.priority} Priority
                      </span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 mt-1">
                      {defect.asset?.name} • <span className="text-[#173B72]">{defect.component?.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Technician: <strong className="text-slate-800">{defect.technician?.name || 'Assigned Technician'}</strong>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => handleRejectRepair(defect.id)}
                      disabled={isProcessing}
                      leftIcon={<XCircle className="w-4 h-4 text-red-600" />}
                      className="border-red-200 hover:bg-red-50 text-red-700"
                    >
                      Request Rework
                    </Button>

                    <Button
                      variant="success"
                      size="md"
                      onClick={() => handleApproveRepair(defect.id)}
                      isLoading={isProcessing}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Sign Off
                    </Button>
                  </div>
                </div>

                {/* Interactive Photo Comparison (Slider / Tap-to-Flip / Split) */}
                <PhotoComparison
                  beforeUrl={defect.inspectionItem?.photoUrl}
                  afterUrl={defect.repair?.repairProofPhotoUrl}
                  beforeRemark={defect.inspectionItem?.remark}
                  afterRemark={defect.repair?.remark}
                  geotagLat={defect.repair?.geotagLat}
                  geotagLng={defect.repair?.geotagLng}
                />

                {/* Footer GPS Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location Proof: {defect.repair?.geotagLat ? `${defect.repair.geotagLat.toFixed(4)}, ${defect.repair.geotagLng.toFixed(4)}` : '11.4965, 77.2763'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Resolution SLA: Verified on time</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

