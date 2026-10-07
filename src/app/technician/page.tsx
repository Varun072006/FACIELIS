'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/providers/auth-provider';
import { Wrench, Clock, MapPin, ArrowRight, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import Link from 'next/link';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const { data: defects, isLoading } = useQuery({
    queryKey: ['technician-defects', user?.id],
    queryFn: () => fetch(`/api/defects?technicianId=${user?.id || ''}`).then((res) => res.json()),
    enabled: !!user?.id,
  });

  const getPriorityBorderClass = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'P1':
        return 'border-l-4 border-l-red-600';
      case 'P2':
        return 'border-l-4 border-l-amber-500';
      case 'P3':
        return 'border-l-4 border-l-blue-600';
      case 'P4':
      default:
        return 'border-l-4 border-l-slate-400';
    }
  };

  const renderSlaChip = (slaDeadline: string) => {
    if (!slaDeadline) return null;
    const now = Date.now();
    const deadline = new Date(slaDeadline).getTime();
    const diffMs = deadline - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
          <AlertOctagon className="w-3 h-3 text-red-600 shrink-0" />
          <span>SLA Overdue</span>
        </span>
      );
    }

    if (diffHours <= 2) {
      const minutesLeft = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-50 text-red-700 border border-red-200 animate-pulse">
          <Clock className="w-3 h-3 text-red-600 shrink-0" />
          <span>SLA: {minutesLeft}m remaining (&lt; 2h!)</span>
        </span>
      );
    }

    const hoursLeft = Math.round(diffHours);
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
        <span>SLA: ~{hoursLeft}h remaining</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <Navbar title="Technician Repair Operations" />

      {/* Hero Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-sm space-y-2 border border-[#173B72]">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-blue-200">
          Field Operations
        </span>
        <h2 className="text-xl font-black">Welcome, Technician {user?.name}</h2>
        <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
          Review assigned repair jobs, examine original photo evidence, perform repairs, and submit geo-tagged repair proof for manager resolution approval.
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#173B72]" />
          <span>Your Assigned Repair Jobs</span>
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : Array.isArray(defects) && defects.length > 0 ? (
          <div className="space-y-4">
            {defects.map((defect: any) => (
              <Card
                key={defect.id}
                className={`overflow-hidden transition-all duration-150 ${getPriorityBorderClass(
                  defect.priority
                )}`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                          {defect.defectNo}
                        </span>
                        {renderSlaChip(defect.slaDeadline)}
                      </div>
                      <h4 className="font-black text-base text-slate-900 mt-1">{defect.component?.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#173B72] shrink-0" />
                        <span>{defect.asset?.venue?.name || 'Right Cabin'} • {defect.asset?.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={defect.status} size="md" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Defect details */}
                    <div className="space-y-2 text-slate-600 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                      <p><strong>Category:</strong> {defect.category}</p>
                      <p><strong>Severity:</strong> {defect.severity}</p>
                      <p><strong>Auditor Remark:</strong> "{defect.inspectionItem?.remark || 'No remark'}"</p>
                      <p className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong>SLA Deadline:</strong> {new Date(defect.slaDeadline).toLocaleString()}
                      </p>
                    </div>

                    {/* Photo Evidence */}
                    <div>
                      <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                        Auditor Defect Photo Evidence:
                      </p>
                      {defect.inspectionItem?.photoUrl ? (
                        <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
                          <img
                            src={defect.inspectionItem.photoUrl}
                            alt="Auditor Defect Photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                          No photo attached
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {defect.status === 'REPAIRED_PENDING_CROSS' || defect.status === 'VERIFIED' ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          {defect.status === 'VERIFIED'
                            ? 'Repair Approved & Verified'
                            : 'Repair Submitted (Pending Manager Approval)'}
                        </span>
                      </div>
                    ) : (
                      <Link href={`/technician/repair/${defect.id}`}>
                        <Button
                          variant="primary"
                          size="md"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Submit Repair Proof
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No Pending Repair Jobs"
            description="There are currently no repair tickets assigned to your department. All maintenance is up to date."
          />
        )}
      </div>
    </div>
  );
}

