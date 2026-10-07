'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
} from 'lucide-react';

export default function SLAPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'dueSoon' | 'onTrack'>('all');

  const { data: defects, isLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });

  const allDefects = Array.isArray(defects) ? defects : [];
  const now = Date.now();

  const overdueList = allDefects.filter((d: any) => {
    if (d.status === 'VERIFIED') return false;
    const deadline = new Date(d.slaDeadline).getTime();
    return d.isOverdue || deadline < now;
  });

  const dueSoonList = allDefects.filter((d: any) => {
    if (d.status === 'VERIFIED') return false;
    const deadline = new Date(d.slaDeadline).getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 4;
  });

  const onTrackList = allDefects.filter((d: any) => {
    if (d.status === 'VERIFIED') return true;
    const deadline = new Date(d.slaDeadline).getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours > 4;
  });

  const total = allDefects.length;
  const overdueCount = overdueList.length;
  const rate = total > 0 ? Math.round(((total - overdueCount) / total) * 100) : 100;

  let currentList = allDefects;
  if (activeTab === 'overdue') currentList = overdueList;
  if (activeTab === 'dueSoon') currentList = dueSoonList;
  if (activeTab === 'onTrack') currentList = onTrackList;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <Navbar title="SLA Compliance Monitoring & Dispatch Tracker" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="SLA Compliance Rate"
          value={`${rate}%`}
          subtitle="Enterprise Benchmark: > 90%"
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard
          title="Total Defects Tracked"
          value={total}
          subtitle="Across Campus Facilities"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="SLA Breach Tickets"
          value={overdueCount}
          subtitle="Critical Escalations Active"
          icon={AlertTriangle}
          variant={overdueCount > 0 ? 'critical' : 'default'}
        />
      </div>

      {/* Status-Grouped Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'all'
              ? 'bg-[#173B72] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Tickets ({total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Overdue ({overdueList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dueSoon')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'dueSoon'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Due Soon (&le; 4h) ({dueSoonList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onTrack')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'onTrack'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>On Track ({onTrackList.length})</span>
        </button>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Tickets in this SLA Bucket"
          description={`No tickets currently matching the selected filter.`}
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((defect: any) => {
            const deadline = new Date(defect.slaDeadline).getTime();
            const diffHours = (deadline - now) / (1000 * 60 * 60);
            const isTicketOverdue = defect.status !== 'VERIFIED' && (defect.isOverdue || diffHours < 0);
            const isDueSoon = defect.status !== 'VERIFIED' && diffHours >= 0 && diffHours <= 4;

            return (
              <Card
                key={defect.id}
                className={`p-4 sm:p-5 transition-all ${
                  isTicketOverdue
                    ? 'border-l-4 border-l-red-600 bg-red-50/20'
                    : isDueSoon
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                    : 'border-l-4 border-l-emerald-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#173B72] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {defect.department?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-200">
                        {defect.priority}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 mt-1">
                      {defect.asset?.name} • <span className="text-[#173B72]">{defect.component?.name}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTicketOverdue && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-red-600" />
                        <span>SLA Breached</span>
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Due in &lt; 4 Hours</span>
                      </span>
                    )}
                    <StatusBadge status={defect.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: {defect.asset?.venue?.name || 'Right Cabin'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>SLA Deadline: {new Date(defect.slaDeadline).toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Technician: <strong className="text-slate-900">{defect.technician?.name || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Department SLA Thresholds Reference Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Department SLA Matrix Baseline</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-black text-[#173B72]">Electrical Department</p>
              <p className="text-slate-500 mt-1">P1 Critical: 1-2 Hours</p>
              <p className="text-slate-500">P2 High: 4 Hours</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-black text-[#173B72]">Network Department</p>
              <p className="text-slate-500 mt-1">P2 Ethernet: 4 Hours</p>
              <p className="text-slate-500">P3 PC Display: 8 Hours</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-black text-[#173B72]">Plumbing Department</p>
              <p className="text-slate-500 mt-1">P2 AC Drain Leak: 4 Hours</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="font-black text-[#173B72]">Housekeeping</p>
              <p className="text-slate-500 mt-1">P3 Sanitation: 12 Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

