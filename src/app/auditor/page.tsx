'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/providers/auth-provider';
import { ClipboardList, ArrowRight, MapPin, Calendar, Boxes } from 'lucide-react';
import Link from 'next/link';

export default function AuditorDashboard() {
  const { user } = useAuth();
  const { data: audits, isLoading } = useQuery({
    queryKey: ['auditor-audits', user?.id],
    queryFn: () => fetch(`/api/audits?auditorId=${user?.id || ''}`).then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Auditor Inspection Dashboard" />

      {/* Hero Welcome */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Assigned Inspections
        </span>
        <h2 className="text-xl font-extrabold">Welcome, Auditor {user?.name}</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          Select an assigned venue to initiate the component checklist. Every defect requires mandatory geo-tagged evidence and remark.
        </p>
      </div>

      {/* Assigned Venues Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#173B72]" />
          <span>Your Assigned Venues</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-xl border">Loading assigned audits...</div>
        ) : Array.isArray(audits) && audits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audits.map((audit: any) => (
              <div key={audit.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                    <h4 className="font-bold text-base text-gray-900">{audit.venue?.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#173B72]" />
                      <span>{audit.venue?.floor?.building?.name || 'Learning Center'} — {audit.venue?.floor?.name}</span>
                    </p>
                  </div>
                  <StatusBadge status={audit.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-500">Components:</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-[#173B72]" />
                      ~666 Items
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-500">Scheduled:</span>
                    <span className="font-semibold text-gray-800">{new Date(audit.scheduledDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/auditor/inspect/${audit.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{audit.status === 'COMPLETED' ? 'View Completed Audit' : 'Start Component Audit'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-400">
            No assigned audits found for your account. Please ask the manager to assign a venue.
          </div>
        )}
      </div>
    </div>
  );
}
