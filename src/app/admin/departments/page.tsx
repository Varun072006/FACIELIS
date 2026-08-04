'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Layers, Users, Wrench, AlertTriangle } from 'lucide-react';

export default function DepartmentsPage() {
  const { data: depts, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetch('/api/departments').then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Department Management" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts?.map((dept: any) => (
          <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#173B72]/10 text-[#173B72]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-gray-900">{dept.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">Code: {dept.code}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium">{dept.description}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Technicians:</span>
                <span className="font-bold text-[#173B72]">{dept._count?.users || 0}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Defects Handled:</span>
                <span className="font-bold text-amber-600">{dept._count?.defects || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
