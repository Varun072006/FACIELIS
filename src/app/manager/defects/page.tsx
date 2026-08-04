'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { AlertTriangle, Wrench, Clock, MapPin, Eye, UserCheck } from 'lucide-react';

export default function DefectsPage() {
  const queryClient = useQueryClient();
  const [selectedDefect, setSelectedDefect] = useState<any | null>(null);

  const { data: defects, isLoading } = useQuery({ queryKey: ['defects'], queryFn: () => fetch('/api/defects').then((res) => res.json()) });
  const { data: technicians } = useQuery({ queryKey: ['technicians'], queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()) });

  const assignTechMutation = useMutation({
    mutationFn: async ({ defectId, technicianId }: { defectId: string; technicianId: string }) => {
      const res = await fetch(`/api/defects/${defectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId }),
      });
      if (!res.ok) throw new Error('Failed to assign technician');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      setSelectedDefect(null);
    },
  });

  return (
    <div className="space-y-6">
      <Navbar title="Defect Management & Technician Routing" />

      {/* Defects List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Open & Assigned Facility Defects</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading defects...</div>
        ) : Array.isArray(defects) && defects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Defect No</th>
                  <th className="p-3">Component / Asset</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority / Severity</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned Technician</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {defects.map((defect: any) => (
                  <tr key={defect.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-700">{defect.defectNo}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{defect.component?.name}</p>
                      <p className="text-[10px] text-gray-500">{defect.asset?.name}</p>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{defect.category}</td>
                    <td className="p-3">
                      <span className="font-bold text-[#173B72] mr-2">{defect.priority}</span>
                      <StatusBadge status={defect.severity} />
                    </td>
                    <td className="p-3 font-medium text-gray-800">{defect.department?.name}</td>
                    <td className="p-3 text-gray-700 font-semibold">
                      {defect.technician?.name || <span className="text-amber-600 font-normal italic">Auto-Assign Pending</span>}
                    </td>
                    <td className="p-3">
                      {defect.isOverdue ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">OVERDUE</span>
                      ) : (
                        <span className="text-gray-500 font-mono text-[10px]">
                          Due: {new Date(defect.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={defect.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedDefect(defect)}
                        className="px-3 py-1 rounded bg-[#173B72] text-white font-bold text-[11px] hover:bg-[#1e4a8e] transition-colors"
                      >
                        Reassign / View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">No active defects reported.</div>
        )}
      </div>

      {/* Assign Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Reassign Technician for {selectedDefect.defectNo}
            </h3>

            <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
              <p><strong>Target:</strong> {selectedDefect.component?.name}</p>
              <p><strong>Department:</strong> {selectedDefect.department?.name}</p>
              <p><strong>Evidence Remark:</strong> {selectedDefect.inspectionItem?.remark || 'N/A'}</p>
            </div>

            {selectedDefect.inspectionItem?.photoUrl && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-1">Auditor Geo-tagged Photo Evidence:</p>
                <img src={selectedDefect.inspectionItem.photoUrl} className="w-full h-40 object-cover rounded-lg border" />
              </div>
            )}

            <div className="text-xs">
              <label className="block font-semibold text-gray-700 mb-1">Select Qualified Technician</label>
              <select
                onChange={(e) => assignTechMutation.mutate({ defectId: selectedDefect.id, technicianId: e.target.value })}
                className="w-full p-2.5 border rounded-lg"
              >
                <option value="">-- Choose Technician --</option>
                {technicians?.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department?.name || 'Technician'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedDefect(null)}
                className="px-4 py-2 rounded-lg border text-xs font-bold text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
