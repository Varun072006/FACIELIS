'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton, EmptyState } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import {
  Wrench,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function OwnerRepairsPage() {
  const { user } = useAuth();

  const { data: repairs, isLoading } = useQuery({
    queryKey: ['owner-repair-logs', user?.venueId],
    queryFn: () => fetch(`/api/owner/repair-logs?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  const repairList = Array.isArray(repairs) ? repairs : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Solved Component Queries & Technician Repair Logs" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Field Assurance Log
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Resolution Archive</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technician Solved Queries & Fix Proofs</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review completed repairs, geo-tagged resolution coordinates, technician remarks, and verified photographic evidence.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Wrench className="w-4 h-4 text-purple-600" />
          <span>{repairList.length} Solved Repairs</span>
        </div>
      </div>

      {/* Repair Logs Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        ) : repairList.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-8">
            <EmptyState
              icon={Wrench}
              title="No repair logs found"
              description="No technician repairs recorded for your venue yet. Completed fixes will appear here with proof photos."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repairList.map((repair: any) => {
              const defect = repair.defect;
              const componentName = defect?.component?.name || 'Component';
              const assetName = defect?.asset?.name || 'Asset';

              return (
                <div
                  key={repair.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          Defect: {defect?.defectNo}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1.5">{componentName}</h4>
                        <p className="text-xs text-slate-500">{assetName} • Dept: {defect?.department?.name || 'General'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SOLVED</span>
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Field Technician:</span>
                        </span>
                        <strong className="text-slate-900 font-semibold">{repair.technician?.name || 'Technician'}</strong>
                      </div>

                      <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 space-y-0.5">
                        <span className="font-semibold text-purple-900 text-[10px] uppercase tracking-wide block">Resolution Remark:</span>
                        <p className="text-slate-700 text-xs">
                          "{repair.remark || 'Repair completed successfully'}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{repair.geotagLat ? `GPS: ${repair.geotagLat.toFixed(4)}, ${repair.geotagLng.toFixed(4)}` : 'Verified On-site'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(repair.completedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {repair.repairProofPhotoUrl && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-slate-400" /> Photographic Proof:
                      </span>
                      <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40 bg-slate-950">
                        <img
                          src={repair.repairProofPhotoUrl}
                          alt="Repair Proof"
                          className="w-full h-40 object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
