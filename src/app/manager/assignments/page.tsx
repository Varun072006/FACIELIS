'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Wrench, Users, CheckCircle2, Clock, Mail, Building2, ShieldCheck } from 'lucide-react';

export default function AssignmentsPage() {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const { data: technicians, isLoading } = useQuery({
    queryKey: ['technicians-workload'],
    queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()),
  });

  const techList = Array.isArray(technicians) ? technicians : [];

  // Extract unique departments for tabs
  const departments = ['ALL', ...Array.from(new Set(techList.map((t: any) => t.department?.name).filter(Boolean)))];

  const filteredTechs = selectedDept === 'ALL'
    ? techList
    : techList.filter((t: any) => t.department?.name === selectedDept);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <Navbar title="Technician Workload & Skill Assignment Engine" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#173B72]">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-xs font-bold uppercase tracking-wider text-blue-200">
            Workload Balancer
          </span>
          <h2 className="text-xl font-black mt-1">Technician Assignment Roster</h2>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl leading-relaxed">
            Monitor technician active tickets, departmental skill alignment, and auto-dispatch workloads.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs text-xs font-bold shrink-0">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>{techList.length} Active Technicians</span>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {departments.map((dept: any) => (
          <button
            key={dept}
            type="button"
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedDept === dept
                ? 'bg-[#173B72] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {dept === 'ALL' ? `All Departments (${techList.length})` : dept}
          </button>
        ))}
      </div>

      {/* Technician Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : filteredTechs.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Technicians in Department"
          description="No field technicians currently mapped to the selected department filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechs.map((t: any) => (
            <Card key={t.id} className="p-5 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900">{t.name}</h4>
                  <p className="text-[11px] font-bold text-[#173B72] mt-0.5">
                    {t.department?.name || 'General Maintenance'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-black border border-blue-200">
                  READY
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email:</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-800 truncate max-w-[160px]">{t.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Campus Scope:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{t.building?.name || 'Main Campus LC'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-[11px]">Availability:</span>
                <span className="font-black text-emerald-700 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available for Auto-Dispatch
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

