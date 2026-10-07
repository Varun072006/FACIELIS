'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Button, Modal, Skeleton, EmptyState } from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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

  const defectList = Array.isArray(defects) ? defects : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Report Venue Defects & Component Issues" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Direct Owner Escalation
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Breakdown Dispatch</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report Venue Defects & Issues</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Log immediate equipment or facility component breakdowns for direct Manager review and field technician dispatch.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="shrink-0 text-xs shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          <span>Report New Defect</span>
        </Button>
      </div>

      {/* Reported Defects History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Owner-Reported Defect Log</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            {defectList.length} Total Logged
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading logged defects...</div>
        ) : defectList.length === 0 ? (
          <div className="p-8">
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="py-2.5">Defect ID</TableHead>
                  <TableHead className="py-2.5">Issue Title</TableHead>
                  <TableHead className="py-2.5">Target Asset</TableHead>
                  <TableHead className="py-2.5">Priority & Severity</TableHead>
                  <TableHead className="py-2.5">Status</TableHead>
                  <TableHead className="py-2.5">Reported On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defectList.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                    <TableCell className="font-mono font-bold text-primary">{d.defectNo}</TableCell>
                    <TableCell>
                      <strong className="font-semibold text-slate-900 block leading-tight">{d.title}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{d.description}</span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{d.assetName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                          {d.priority}
                        </span>
                        <StatusBadge status={d.severity} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-[11px]">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Report Defect Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Report Venue Defect / Breakdown"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Defect Title *</label>
            <input
              type="text"
              placeholder="e.g. AC unit leaking condensation on desk 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Asset / Component</label>
            <select
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
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
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              >
                <option value="P1">P1 — Emergency</option>
                <option value="P2">P2 — Urgent</option>
                <option value="P3">P3 — Moderate</option>
                <option value="P4">P4 — Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Issue Description *</label>
            <textarea
              rows={3}
              placeholder="Provide exact component location and failure observation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Photo Evidence (Optional)</label>
            <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 text-center">
              <Camera className="w-5 h-5 text-slate-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {uploading && <p className="text-[11px] text-primary font-semibold mt-1 animate-pulse">Uploading photo...</p>}
              {photoUrl && <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Photo attached successfully</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{createDefectMutation.isPending ? 'Submitting...' : 'Submit Defect'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
