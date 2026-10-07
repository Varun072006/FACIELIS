'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Wrench, Users, CheckCircle2, Clock, Mail, Building2, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="space-y-6 pb-16">
      <Navbar title="Technician Workload & Skill Assignment Engine" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Workforce Roster
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Skill & Load Balancer</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technician Workload & Skill Assignment</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Monitor technician operational load, departmental skill alignment, and automated ticket dispatch readiness.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Users className="w-4 h-4 text-primary" />
          <span>{techList.length} Registered Technicians</span>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-3">
        {departments.map((dept: any) => (
          <button
            key={dept}
            type="button"
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedDept === dept
                ? 'bg-[#173B72] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {dept === 'ALL' ? `All Departments (${techList.length})` : dept}
          </button>
        ))}
      </div>

      {/* Technician Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
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
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-3.5"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {t.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'TC'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{t.name}</h4>
                    <p className="text-[11px] font-semibold text-primary mt-0.5">
                      {t.department?.name || 'General Maintenance'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  READY
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email:</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[170px]">{t.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Campus Scope:</span>
                  </span>
                  <span className="font-medium text-slate-800">{t.building?.name || 'Main Campus LC'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Dispatch Status:</span>
                <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-Dispatch Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
