'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
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
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold uppercase tracking-wider border border-purple-400/30">
          Field Repair Assurance Log
        </span>
        <h2 className="text-xl font-black">Technician Solved Queries & Fix Proofs</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          Review repair proofs, geo-tagged resolution locations, technician remarks, and completed fixes for components in your venue.
        </p>
      </div>

      {/* Repair Logs Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-700" />
          <span>Completed Repair Verification Log</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-xl border">Loading technician repair logs...</div>
        ) : !Array.isArray(repairs) || repairs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-400">
            No technician repairs recorded for your venue yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repairs.map((repair: any) => {
              const defect = repair.defect;
              const componentName = defect?.component?.name || 'Component';
              const assetName = defect?.asset?.name || 'Asset';

              return (
                <div key={repair.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        Defect: {defect?.defectNo}
                      </span>
                      <h4 className="font-extrabold text-base text-gray-900 mt-1">{componentName}</h4>
                      <p className="text-xs text-gray-500">{assetName} • Dept: {defect?.department?.name || 'General'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SOLVED</span>
                    </span>
                  </div>

                  {/* Technician & Resolution Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="flex items-center gap-1.5 font-bold text-gray-700">
                        <User className="w-3.5 h-3.5 text-[#173B72]" />
                        <span>Field Technician:</span>
                      </span>
                      <strong className="text-gray-900">{repair.technician?.name || 'Technician'}</strong>
                    </div>

                    <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-100 space-y-1">
                      <span className="font-bold text-purple-950 text-[11px] block">Technician Repair Remark:</span>
                      <p className="text-gray-700 italic font-serif text-xs">"{repair.remark || 'Repair completed successfully'}"</p>
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

                  {/* Proof Photo Thumbnail */}
                  {repair.repairProofPhotoUrl && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Photo Proof of Repair:
                      </span>
                      <div className="rounded-xl overflow-hidden border border-gray-200 max-h-40 bg-black/5">
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
