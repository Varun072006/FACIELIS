'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Wrench, Users, CheckCircle2, Clock } from 'lucide-react';

export default function AssignmentsPage() {
  const { data: technicians, isLoading } = useQuery({
    queryKey: ['technicians-workload'],
    queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Technician Workload & Skill Assignment Engine" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#173B72]" />
          <span>Active Technician Workload Distribution</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading technician workload...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {technicians?.map((t: any) => (
              <div key={t.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
                    <p className="text-[10px] text-gray-500">{t.department?.name || 'General Maintenance'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#173B72]/10 text-[#173B72] text-[10px] font-bold">
                    TECHNICIAN
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Email:</span>
                    <span className="font-mono text-[10px]">{t.email}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Building Scope:</span>
                    <span className="font-medium">{t.building?.name || 'Learning Center'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Assignment Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available for Routing
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
