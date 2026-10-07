'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, EmptyState } from '@/components/ui';
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

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Solved Component Queries & Technician Repair Logs" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-3">
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold uppercase tracking-wider border border-purple-400/30">
          Field Repair Assurance Log
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Technician Solved Queries & Fix Proofs</h2>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
          Review repair proofs, geo-tagged resolution locations, technician remarks, and completed fixes for components in your venue.
        </p>
      </div>

      {/* Repair Logs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-700" />
            <span>Completed Repair Verification Log</span>
          </h3>
          <span className="text-xs font-semibold text-gray-500">
            {Array.isArray(repairs) ? repairs.length : 0} Solved Repairs
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        ) : !Array.isArray(repairs) || repairs.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                icon={Wrench}
                title="No repair logs found"
                description="No technician repairs recorded for your venue yet. Completed fixes will appear here with proof photos."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repairs.map((repair: any) => {
              const defect = repair.defect;
              const componentName = defect?.component?.name || 'Component';
              const assetName = defect?.asset?.name || 'Asset';

              return (
                <Card
                  key={repair.id}
                  className="p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/60">
                          Defect: {defect?.defectNo}
                        </span>
                        <h4 className="font-extrabold text-base text-gray-900 mt-1.5">{componentName}</h4>
                        <p className="text-xs text-gray-500">{assetName} • Dept: {defect?.department?.name || 'General'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SOLVED</span>
                      </span>
                    </div>

                    {/* Technician & Resolution Info */}
                    <div className="space-y-2 text-xs mt-3">
                      <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-xl border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          <User className="w-3.5 h-3.5 text-[#173B72]" />
                          <span>Field Technician:</span>
                        </span>
                        <strong className="text-gray-900 font-extrabold">{repair.technician?.name || 'Technician'}</strong>
                      </div>

                      <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100/80 space-y-1">
                        <span className="font-bold text-purple-950 text-[11px] block">Technician Repair Remark:</span>
                        <p className="text-gray-700 italic font-serif text-xs leading-relaxed">
                          "{repair.remark || 'Repair completed successfully'}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>Geo-tag: {repair.geotagLat ? `${repair.geotagLat.toFixed(4)}, ${repair.geotagLng.toFixed(4)}` : 'Verified On-site'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(repair.completedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proof Photo Thumbnail */}
                  {repair.repairProofPhotoUrl && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-gray-400" /> Photo Proof of Repair:
                      </span>
                      <div className="rounded-xl overflow-hidden border border-gray-200 max-h-44 bg-black/5">
                        <img
                          src={repair.repairProofPhotoUrl}
                          alt="Repair Proof"
                          className="w-full h-44 object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
