'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/providers/auth-provider';
import { Wrench, Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const { data: defects, isLoading } = useQuery({
    queryKey: ['technician-defects', user?.id],
    queryFn: () => fetch(`/api/defects?technicianId=${user?.id || ''}`).then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Technician Repair Operations" />

      {/* Hero Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Field Operations
        </span>
        <h2 className="text-xl font-extrabold">Welcome, Technician {user?.name}</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          Review assigned repair jobs, examine original photo evidence, perform repairs, and submit geo-tagged repair proof for cross-audit validation.
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#173B72]" />
          <span>Your Assigned Repair Jobs</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-xl border">Loading repair jobs...</div>
        ) : Array.isArray(defects) && defects.length > 0 ? (
          <div className="space-y-4">
            {defects.map((defect: any) => (
              <div key={defect.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-amber-700">{defect.defectNo}</span>
                    <h4 className="font-bold text-base text-gray-900">{defect.component?.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#173B72]" />
                      <span>{defect.asset?.venue?.name || 'Right Cabin'} • {defect.asset?.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#173B72] text-xs">{defect.priority}</span>
                    <StatusBadge status={defect.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Defect details */}
                  <div className="space-y-2">
                    <p className="text-gray-600"><strong>Category:</strong> {defect.category}</p>
                    <p className="text-gray-600"><strong>Severity:</strong> {defect.severity}</p>
                    <p className="text-gray-600"><strong>Auditor Remark:</strong> {defect.inspectionItem?.remark || 'No remark'}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <strong>SLA Deadline:</strong> {new Date(defect.slaDeadline).toLocaleString()}
                    </p>
                  </div>

                  {/* Photo Evidence */}
                  <div>
                    <p className="font-bold text-gray-700 text-[11px] uppercase mb-1">Auditor Defect Photo:</p>
                    {defect.inspectionItem?.photoUrl ? (
                      <img src={defect.inspectionItem.photoUrl} className="w-full h-32 object-cover rounded-lg border" />
                    ) : (
                      <div className="h-32 bg-gray-50 border rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No photo attached
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  {defect.status === 'REPAIRED_PENDING_CROSS' || defect.status === 'VERIFIED' ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Repair Submitted (Pending Cross-Audit)</span>
                    </div>
                  ) : (
                    <Link
                      href={`/technician/repair/${defect.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <span>Submit Repair Proof</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-400">
            No pending repair jobs assigned to your department.
          </div>
        )}
      </div>
    </div>
  );
}
