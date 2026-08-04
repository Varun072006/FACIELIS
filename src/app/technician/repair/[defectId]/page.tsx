'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PhotoCapture } from '@/components/photo-capture';
import { useAuth } from '@/providers/auth-provider';
import { Wrench, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RepairSubmissionPage({ params }: { params: Promise<{ defectId: string }> }) {
  const { defectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [repairPhotoUrl, setRepairPhotoUrl] = useState<string | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect-detail', defectId],
    queryFn: () => fetch(`/api/defects/${defectId}`).then((res) => res.json()),
  });

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairPhotoUrl || !remark) {
      alert('Repair photo proof and remark are mandatory');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defectId,
          technicianId: user?.id || defect.technicianId,
          repairProofPhotoUrl: repairPhotoUrl,
          geotagLat: lat,
          geotagLng: lng,
          remark,
        }),
      });

      if (res.ok) {
        router.push('/technician');
      }
    } catch (err) {
      console.error('Repair submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-500">Loading defect details...</div>;
  if (!defect) return <div className="p-8 text-center text-xs text-red-500">Defect not found</div>;

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      <Navbar title={`Submit Repair: ${defect.defectNo}`} />

      {/* Defect Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="font-mono font-bold text-xs text-amber-700">{defect.defectNo}</span>
          <h3 className="font-extrabold text-lg text-gray-900">{defect.component?.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{defect.asset?.venue?.name} • {defect.asset?.name}</p>
        </div>

        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs space-y-1 text-amber-900">
          <p><strong>Priority:</strong> {defect.priority} • <strong>Severity:</strong> {defect.severity}</p>
          <p><strong>Auditor Remark:</strong> {defect.inspectionItem?.remark || 'Defect reported'}</p>
        </div>

        {defect.inspectionItem?.photoUrl && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">Auditor Original Photo Evidence:</p>
            <img src={defect.inspectionItem.photoUrl} className="w-full h-40 object-cover rounded-lg border" />
          </div>
        )}
      </div>

      {/* Repair Form */}
      <form onSubmit={handleSubmitRepair} className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Wrench className="w-4 h-4 text-[#173B72]" />
          <span>Upload Geo-tagged Repair Evidence</span>
        </h4>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Mandatory Technician Work Remark
          </label>
          <textarea
            rows={3}
            placeholder="Describe repair actions performed (e.g. Replaced faulty wiring, sealed socket enclosure, tested voltage)..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
            required
          />
        </div>

        <PhotoCapture
          label="Capture Geo-tagged Repair Proof Photo"
          onPhotoCaptured={(url, photoLat, photoLng) => {
            setRepairPhotoUrl(url);
            setLat(photoLat);
            setLng(photoLng);
          }}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Submitting Repair Proof...' : 'Submit Repair (Pending Cross-Audit)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
