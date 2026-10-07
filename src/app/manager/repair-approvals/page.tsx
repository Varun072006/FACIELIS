'use client';

import React, { useState, useDeferredValue, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
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
  Clock,
  User,
  Building,
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
        <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
          Resolution Verification
        </span>

        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'slider'
                ? 'bg-white text-primary shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('flip')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'flip'
                ? 'bg-white text-primary shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Flip</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'split'
                ? 'bg-white text-primary shadow-2xs'
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
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 select-none shadow-xs">
            {afterUrl ? (
              <img src={afterUrl} alt="Technician Repair Proof" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">No repair photo</div>
            )}
            <div className="absolute bottom-3 right-3 bg-emerald-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-md shadow-md z-10">
              AFTER (Repaired)
            </div>

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
                <div className="absolute bottom-3 left-3 bg-rose-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-md shadow-md z-10">
                  BEFORE (Defect)
                </div>
              </div>
            ) : null}

            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center text-[11px] font-bold border border-slate-300">
                ↔
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-semibold text-rose-600">Defect Before</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-semibold text-emerald-600">Repair After</span>
          </div>
        </div>
      )}

      {/* Mode 2: Tap to Flip */}
      {viewMode === 'flip' && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer group shadow-xs"
        >
          <img
            src={isFlipped ? afterUrl || beforeUrl : beforeUrl || afterUrl}
            alt="Inspection Comparison"
            className="w-full h-full object-cover transition-opacity duration-200"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold shadow-md text-white bg-slate-950/80 backdrop-blur-xs flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Tap Image to Flip</span>
          </div>

          <div
            className={`absolute bottom-3 right-3 font-semibold text-xs px-2.5 py-1 rounded-md shadow-md text-white ${
              isFlipped ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {isFlipped ? 'AFTER: TECHNICIAN REPAIR' : 'BEFORE: AUDITOR DEFECT'}
          </div>
        </div>
      )}

      {/* Mode 3: Split Side-by-Side */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-2">
            <span className="font-semibold text-rose-900 uppercase text-[10px] tracking-wider block">
              1. Auditor Defect Flag
            </span>
            <div className="rounded-lg overflow-hidden border border-rose-200 h-40 bg-slate-900">
              {beforeUrl ? (
                <img src={beforeUrl} alt="Auditor Defect" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-rose-700 text-xs">No photo</div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
            <span className="font-semibold text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center justify-between">
              <span>2. Technician Repair Proof</span>
              {geotagLat && <span className="text-emerald-700 font-mono text-[10px]">GPS Verified</span>}
            </span>
            <div className="rounded-lg overflow-hidden border border-emerald-200 h-40 bg-slate-900">
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
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <strong className="text-rose-700 font-semibold block mb-0.5">Auditor Complaint:</strong>
          <span>"{beforeRemark || 'Defect reported during audit'}"</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <strong className="text-emerald-700 font-semibold block mb-0.5">Technician Resolution:</strong>
          <span>"{afterRemark || 'Defect successfully repaired and verified'}"</span>
        </div>
      </div>
    </div>
  );
}

export default function ManagerRepairApprovalsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: defects, isLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });

  const pendingApprovals = useMemo(() => {
    if (!Array.isArray(defects)) return [];
    return defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS' || (d.repair !== null && d.status !== 'VERIFIED'));
  }, [defects]);

  const filteredDefects = useMemo(() => {
    const term = deferredSearch.toLowerCase();
    if (!term) return pendingApprovals;
    return pendingApprovals.filter((d: any) => {
      return (
        d.defectNo.toLowerCase().includes(term) ||
        d.asset?.name?.toLowerCase().includes(term) ||
        d.component?.name?.toLowerCase().includes(term)
      );
    });
  }, [pendingApprovals, deferredSearch]);

  const handleApproveRepair = async (defectId: string) => {
    setApprovingId(defectId);
    // Optimistic cache update
    const prevDefects = queryClient.getQueryData(['defects']);
    queryClient.setQueryData(['defects'], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((d: any) => d.id === defectId ? { ...d, status: 'VERIFIED' } : d);
    });

    try {
      const res = await fetch(`/api/defects/${defectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });

      if (!res.ok) {
        // Rollback on error
        queryClient.setQueryData(['defects'], prevDefects);
      }
    } catch (err) {
      console.error('Failed to approve repair:', err);
      queryClient.setQueryData(['defects'], prevDefects);
    } finally {
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
    }
  };

  const handleRejectRepair = async (defectId: string) => {
    setApprovingId(defectId);
    // Optimistic cache update
    const prevDefects = queryClient.getQueryData(['defects']);
    queryClient.setQueryData(['defects'], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((d: any) => d.id === defectId ? { ...d, status: 'ASSIGNED' } : d);
    });

    try {
      const res = await fetch(`/api/defects/${defectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ASSIGNED' }),
      });

      if (!res.ok) {
        queryClient.setQueryData(['defects'], prevDefects);
      }
    } catch (err) {
      console.error('Failed to reject repair:', err);
      queryClient.setQueryData(['defects'], prevDefects);
    } finally {
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Technician Repair Sign-off & Manager Approvals" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Sign-Off Desk
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Resolution Verification</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technician Repair Approvals</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review completed field technician repairs and approve sign-off to store resolution history with immutable timestamps.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{pendingApprovals.length} Pending Sign-offs</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by defect no, asset, or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{filteredDefects.length}</strong> items
        </span>
      </div>

      {/* Pending Approval List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : filteredDefects.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All Repairs Signed Off"
          description="There are no pending technician repair submissions waiting for manager sign-off. All field work is approved!"
        />
      ) : (
        <div className="space-y-5">
          {filteredDefects.map((defect: any) => {
            const isProcessing = approvingId === defect.id;

            return (
              <div key={defect.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden p-5 space-y-4 shadow-xs">
                {/* Defect Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        {defect.department?.name}
                      </span>
                      <StatusBadge status={defect.status} />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{defect.component?.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Asset: <span className="font-semibold text-slate-700">{defect.asset?.name}</span> • Venue: <span className="font-semibold text-slate-700">{defect.asset?.venue?.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectRepair(defect.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Request Rework</span>
                    </button>
                    <button
                      onClick={() => handleApproveRepair(defect.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Approving...' : 'Sign Off & Verify'}</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Comparison Widget */}
                <PhotoComparison
                  beforeUrl={defect.inspectionItem?.photoUrl}
                  afterUrl={defect.repair?.repairProofPhotoUrl}
                  beforeRemark={defect.inspectionItem?.remark}
                  afterRemark={defect.repair?.remark}
                  geotagLat={defect.repair?.geotagLat}
                  geotagLng={defect.repair?.geotagLng}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
