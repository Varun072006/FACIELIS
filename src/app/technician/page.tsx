'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/providers/auth-provider';
import {
  Wrench,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  History,
  Camera,
  Layers,
} from 'lucide-react';
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
        return 'border-l-4 border-l-rose-600';
      case 'P2':
        return 'border-l-4 border-l-amber-500';
      case 'P3':
        return 'border-l-4 border-l-sky-500';
      case 'P4':
      default:
        return 'border-l-4 border-l-slate-300';
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
          <span>SLA Overdue</span>
        </span>
      );
    }

    if (diffHours <= 2) {
      const minutesLeft = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>SLA: {minutesLeft}m left (&lt; 2h!)</span>
        </span>
      );
    }

    const hoursLeft = Math.round(diffHours);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
        <span>SLA: ~{hoursLeft}h left</span>
      </span>
    );
  };

  const defectList = Array.isArray(defects) ? defects : [];
  const urgentCount = defectList.filter(
    (d: any) =>
      d.priority === 'P1' ||
      d.isOverdue ||
      (d.slaDeadline && new Date(d.slaDeadline).getTime() - Date.now() < 2 * 3600 * 1000)
  ).length;
  const pendingApprovalCount = defectList.filter(
    (d: any) => d.status === 'REPAIRED_PENDING_CROSS'
  ).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      <Navbar title="Field Repair Operations" />

      {/* Action Header Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold">
              <Wrench className="w-3.5 h-3.5 text-amber-700" />
              Field Maintenance
            </span>
            <span className="text-xs text-slate-400">Technician: {user?.name}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Assigned Repair Tickets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Examine auditor photo evidence, execute physical repairs, and upload geo-tagged resolution proof for manager clearance.
          </p>
        </div>
        <Link
          href="/technician/history"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
        >
          <History className="w-3.5 h-3.5" />
          <span>Repair History & Logs</span>
        </Link>
      </div>

      {/* KPI Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {isLoading ? (
          <>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned Jobs"
              value={defectList.length}
              subtitle="Active Field Tickets"
              icon={Wrench}
              variant="default"
            />
            <StatCard
              title="Urgent / SLA Alert"
              value={urgentCount}
              subtitle={urgentCount > 0 ? 'Immediate Attention' : 'All On Track'}
              icon={Clock}
              variant={urgentCount > 0 ? 'critical' : 'default'}
            />
            <StatCard
              title="Pending Approval"
              value={pendingApprovalCount}
              subtitle="Awaiting Manager Review"
              icon={CheckCircle2}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Assigned Jobs List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#173B72]" />
            <span>Assigned Repair Queue</span>
          </h3>
          <span className="text-xs text-slate-500">{defectList.length} total tickets</span>
        </div>

        {isLoading ? (
          <div className="space-y-3.5">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : defectList.length > 0 ? (
          <div className="space-y-3.5">
            {defectList.map((defect: any) => (
              <div
                key={defect.id}
                className={`bento-card overflow-hidden bg-white ${getPriorityBorderClass(
                  defect.priority
                )}`}
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {defect.defectNo}
                        </span>
                        {renderSlaChip(defect.slaDeadline)}
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-1">{defect.component?.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#173B72] shrink-0" />
                        <span>
                          {defect.asset?.venue?.name || 'Right Cabin'} • {defect.asset?.name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={defect.status} size="md" />
                    </div>
                  </div>

                  {/* Details + Photo Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    {/* Defect details */}
                    <div className="space-y-2 text-slate-600 bg-slate-50/60 p-3.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <strong className="text-slate-800">{defect.category}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Severity:</span>
                        <strong className="text-slate-800">{defect.severity}</strong>
                      </div>
                      <div className="pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Auditor Remark:</span>
                        <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-100">
                          "{defect.inspectionItem?.remark || 'No remark provided'}"
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 text-[11px] pt-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Deadline: {new Date(defect.slaDeadline).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Photo Evidence */}
                    <div className="flex flex-col">
                      <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>Auditor Photo Evidence</span>
                      </p>
                      {defect.inspectionItem?.photoUrl ? (
                        <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
                          <img
                            src={defect.inspectionItem.photoUrl}
                            alt="Auditor Defect Photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-28 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                          No photo attached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex justify-end">
                    {defect.status === 'REPAIRED_PENDING_CROSS' || defect.status === 'VERIFIED' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                          size="sm"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Submit Repair Proof
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
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
