'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/providers/auth-provider';
import {
  AlertTriangle,
  Plus,
  Boxes,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

export default function OwnerDefectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [assetName, setAssetName] = useState('');
  const [priority, setPriority] = useState('P3');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch venue assets for dropdown
  const { data: assets } = useQuery({
    queryKey: ['assets', user?.venueId],
    queryFn: () => fetch(`/api/assets?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Fetch owner reported defects
  const { data: defects, isLoading } = useQuery({
    queryKey: ['owner-defects', user?.venueId],
    queryFn: () => fetch(`/api/owner/defects?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  const createDefectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/owner/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit defect report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-defects'] });
      setShowModal(false);
      setTitle('');
      setAssetName('');
      setDescription('');
      setPhotoUrl('');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result, type: 'owner_defects' }),
        });
        const data = await res.json();
        if (res.ok && data.url) setPhotoUrl(data.url);
      } catch (e) {
        console.error('Upload failed', e);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDefectMutation.mutate({
      venueId: user?.venueId,
      ownerId: user?.id,
      title,
      description,
      assetName: assetName || 'General Venue Asset',
      priority,
      severity,
      photoUrl,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Report Venue Defects & Component Issues" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            Owner Escalation Channel
          </span>
          <h2 className="text-xl font-black mt-2">Report Venue Component Breakdowns</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Within the 15-day period, as Venue Owner you can report any defect directly to the Facility Manager for rapid technician routing.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Defect</span>
        </button>
      </div>

      {/* Reported Defects History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Owner-Reported Defect Log</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading defect reports...</div>
        ) : !Array.isArray(defects) || defects.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No defect reports submitted yet. Clean facility!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Defect ID</th>
                  <th className="p-3">Issue Title</th>
                  <th className="p-3">Target Asset</th>
                  <th className="p-3">Priority / Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reported On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-700">{d.defectNo}</td>
                    <td className="p-3">
                      <strong className="font-bold text-gray-900 block">{d.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{d.description}</span>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{d.assetName}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-extrabold">
                          {d.priority}
                        </span>
                        <StatusBadge status={d.severity} />
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[11px]">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Defect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl my-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Report Venue Defect / Issue</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Defect Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AC unit leaking water on desk 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#173B72]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Asset / Component</label>
                <select
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="">-- Choose Venue Asset --</option>
                  {Array.isArray(assets) && assets.map((a: any) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.serialNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="P1">P1 — Emergency</option>
                    <option value="P2">P2 — Urgent</option>
                    <option value="P3">P3 — Moderate</option>
                    <option value="P4">P4 — Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise breakdown details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#173B72]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Photo Evidence (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded-lg bg-gray-50 text-xs"
                />
                {uploading && <p className="text-[10px] text-blue-600 font-semibold mt-1">Uploading photo...</p>}
                {photoUrl && <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Photo attached</p>}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDefectMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{createDefectMutation.isPending ? 'Submitting...' : 'Submit Defect Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
