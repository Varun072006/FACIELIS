'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Layers, Users, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui';

export default function DepartmentsPage() {
  const { data: depts, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetch('/api/departments').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });

  const deptList = Array.isArray(depts) ? depts : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Department Management" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Operational Units
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Service Coverage</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Functional Department Registry</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Departmental mapping across Electrical, Network, Plumbing, Housekeeping, and Documentation scopes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Layers className="w-4 h-4 text-primary" />
          <span>{deptList.length} Registered Units</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptList.map((dept: any) => (
            <div key={dept.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{dept.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Code: {dept.code}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">{dept.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Technicians:</span>
                  <span className="font-bold text-primary">{dept._count?.users || 0}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Defects:</span>
                  <span className="font-bold text-amber-600">{dept._count?.defects || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
