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
  User,
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
    <div className="space-y-6 pb-16">
      <Navbar title="SLA Compliance Monitoring & Dispatch Tracker" />

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Compliance Monitor
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Service Level Assurance</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">SLA Compliance & Ticket Escalations</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time compliance tracking across campus facilities. Monitor breach velocity, approaching deadlines, and technician response times.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{rate}% Overall Compliance</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="SLA Compliance Rate"
          value={`${rate}%`}
          subtitle="Benchmark Target: > 90%"
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard
          title="Total Tickets Tracked"
          value={total}
          subtitle="Across Campus Facilities"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="SLA Breach Tickets"
          value={overdueCount}
          subtitle={overdueCount > 0 ? 'Requires Priority Dispatch' : 'Zero Breaches Active'}
          icon={AlertTriangle}
          variant={overdueCount > 0 ? 'critical' : 'success'}
        />
      </div>

      {/* Status-Grouped Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-[#173B72] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Tickets ({total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Overdue ({overdueList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dueSoon')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'dueSoon'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Due Soon (&le; 4h) ({dueSoonList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onTrack')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'onTrack'
              ? 'bg-emerald-600 text-white shadow-2xs'
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
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Tickets in this SLA Bucket"
          description="No tickets currently matching the selected filter."
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((defect: any) => {
            const deadline = new Date(defect.slaDeadline).getTime();
            const diffHours = (deadline - now) / (1000 * 60 * 60);
            const isTicketOverdue = defect.status !== 'VERIFIED' && (defect.isOverdue || diffHours < 0);
            const isDueSoon = defect.status !== 'VERIFIED' && diffHours >= 0 && diffHours <= 4;

            return (
              <div
                key={defect.id}
                className={`bg-white rounded-xl border p-4 transition-all shadow-xs space-y-3 ${
                  isTicketOverdue
                    ? 'border-l-4 border-l-rose-500 border-slate-200'
                    : isDueSoon
                    ? 'border-l-4 border-l-amber-500 border-slate-200'
                    : 'border-l-4 border-l-emerald-500 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {defect.defectNo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        {defect.department?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-200">
                        {defect.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {defect.asset?.name} • <span className="text-primary">{defect.component?.name}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTicketOverdue && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        <span>SLA Breached</span>
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Due in &lt; 4 Hours</span>
                      </span>
                    )}
                    <StatusBadge status={defect.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: <strong className="text-slate-800 font-medium">{defect.asset?.venue?.name || 'Right Cabin'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>SLA Deadline: <strong className="text-slate-800 font-medium">{new Date(defect.slaDeadline).toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Technician: <strong className="text-slate-800 font-semibold">{defect.technician?.name || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Department SLA Thresholds Reference Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Department SLA Baseline Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
            <p className="font-bold text-primary">Electrical</p>
            <p className="text-slate-500 mt-1">P1 Critical: 1-2 Hours</p>
            <p className="text-slate-500">P2 High: 4 Hours</p>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
            <p className="font-bold text-primary">Network</p>
            <p className="text-slate-500 mt-1">P2 Ethernet: 4 Hours</p>
            <p className="text-slate-500">P3 PC Display: 8 Hours</p>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
            <p className="font-bold text-primary">Plumbing</p>
            <p className="text-slate-500 mt-1">P2 AC Drain: 4 Hours</p>
            <p className="text-slate-500">P3 Fixtures: 12 Hours</p>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
            <p className="font-bold text-primary">Housekeeping</p>
            <p className="text-slate-500 mt-1">P3 Sanitation: 12 Hours</p>
            <p className="text-slate-500">P4 Waste: 24 Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
