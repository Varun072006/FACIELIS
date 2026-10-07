'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Skeleton, EmptyState } from '@/components/ui';
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
  Camera,
  Image as ImageIcon,
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
      <div className="bg-[#173B72] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            Direct Owner Escalation Channel
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">Report Venue Component Breakdowns</h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            During any point in the 15-day cycle, as Venue Owner you can log breakdowns directly for immediate Facility Manager review and technician dispatch.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs transition-all shadow-md shrink-0 border-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Report New Defect</span>
        </Button>
      </div>

      {/* Reported Defects History Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
          <CardTitle className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Owner-Reported Defect Log</span>
          </CardTitle>
          <span className="text-xs text-gray-500 font-semibold">
            {Array.isArray(defects) ? defects.length : 0} Total Logged
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !Array.isArray(defects) || defects.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={CheckCircle2}
              title="No defects reported"
              description="No defects reported for this venue yet. If any facility component breaks down, log it here."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                  Report Defect
                </Button>
              }
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Defect ID</th>
                  <th className="p-3.5">Issue Title</th>
                  <th className="p-3.5">Target Asset</th>
                  <th className="p-3.5">Priority / Severity</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Reported On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-700">{d.defectNo}</td>
                    <td className="p-3.5">
                      <strong className="font-bold text-gray-900 block">{d.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{d.description}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">{d.assetName}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-extrabold border border-blue-200/60">
                          {d.priority}
                        </span>
                        <StatusBadge status={d.severity} />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Report Defect Modal Primitive */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Report Venue Defect / Breakdown"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Defect Title *</label>
            <input
              type="text"
              placeholder="e.g. AC unit leaking condensation on desk 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Asset / Component</label>
            <select
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
            >
              <option value="">-- Choose Venue Asset --</option>
              {Array.isArray(assets) &&
                assets.map((a: any) => (
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
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-hidden"
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
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-hidden"
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
              placeholder="Provide exact component location and failure observation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Photo Evidence (Optional)</label>
            <div className="p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center gap-1.5 text-center">
              <Camera className="w-5 h-5 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {uploading && <p className="text-[11px] text-blue-600 font-semibold mt-1 animate-pulse">Uploading photo...</p>}
              {photoUrl && <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Photo attached successfully</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createDefectMutation.isPending}
              className="bg-[#173B72] hover:bg-[#122e5a] text-white font-extrabold"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{createDefectMutation.isPending ? 'Submitting...' : 'Submit Defect Report'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
