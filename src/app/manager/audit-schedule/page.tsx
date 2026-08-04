'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { ClipboardList, Plus, Calendar, User, MapPin } from 'lucide-react';

export default function AuditSchedulePage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [venueId, setVenueId] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const { data: audits, isLoading: loadingAudits } = useQuery({ queryKey: ['audits'], queryFn: () => fetch('/api/audits').then((res) => res.json()) });
  const { data: orgs } = useQuery({ queryKey: ['facilities'], queryFn: () => fetch('/api/facilities').then((res) => res.json()) });
  const { data: auditors } = useQuery({ queryKey: ['auditors'], queryFn: () => fetch('/api/users?role=AUDITOR').then((res) => res.json()) });

  const venues = orgs?.[0]?.campuses?.[0]?.buildings?.[0]?.floors?.[0]?.venues || [];

  const createAuditMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to schedule audit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      setShowModal(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAuditMutation.mutate({
      venueId: venueId || (venues[0]?.id ?? ''),
      auditorId: auditorId || (auditors?.[0]?.id ?? ''),
      scheduledDate: scheduledDate || new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <Navbar title="Audit Schedule & Auditor Assignment" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Manager Control
          </span>
          <h2 className="text-xl font-extrabold mt-1">Audit Scheduling Station</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Assign qualified auditors to venues. Once scheduled, auditors will receive the venue inspection checklist containing all 143 components.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white text-[#173B72] font-bold text-xs hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Audit</span>
        </button>
      </div>

      {/* Audits Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#173B72]" />
            <span>Scheduled & Active Audits</span>
          </h3>
        </div>

        {loadingAudits ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading audit schedules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Audit No</th>
                  <th className="p-3">Venue / Cabin</th>
                  <th className="p-3">Assigned Auditor</th>
                  <th className="p-3">Scheduled Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Fitness Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audits?.map((audit: any) => (
                  <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#173B72]">{audit.auditNo}</td>
                    <td className="p-3 font-bold text-gray-900">{audit.venue?.name} ({audit.venue?.code})</td>
                    <td className="p-3 font-semibold text-gray-800">{audit.auditor?.name}</td>
                    <td className="p-3 text-gray-600">{new Date(audit.scheduledDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <StatusBadge status={audit.status} />
                    </td>
                    <td className="p-3">
                      {audit.score ? (
                        <span className={`font-bold ${audit.score.isFit ? 'text-emerald-700' : 'text-red-700'}`}>
                          {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                        </span>
                      ) : (
                        <span className="text-gray-400 font-serif italic">Pending Audit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Schedule New Audit</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Target Venue</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                >
                  {venues.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign Auditor</label>
                <select
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                >
                  {auditors?.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Scheduled Audit Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B72] text-white font-bold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
