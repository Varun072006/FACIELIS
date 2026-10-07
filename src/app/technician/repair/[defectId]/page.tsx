'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PhotoCapture } from '@/components/photo-capture';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/providers/auth-provider';
import { Wrench, ArrowRight, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RepairSubmissionPage({ params }: { params: Promise<{ defectId: string }> }) {
  const { defectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [repairPhotoUrl, setRepairPhotoUrl] = useState<string | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect-detail', defectId],
    queryFn: () => fetch(`/api/defects/${defectId}`).then((res) => res.json()),
  });

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!repairPhotoUrl || !remark.trim()) {
      setErrorMessage('Both a geo-tagged repair proof photo and descriptive technician remark are mandatory.');
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
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to submit repair proof');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Repair submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pb-20 max-w-2xl mx-auto">
        <Navbar title="Loading Defect Details..." />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!defect) return <div className="p-8 text-center text-xs text-rose-500">Defect ticket not found</div>;

  return (
    <div className="space-y-5 pb-20 max-w-2xl mx-auto">
      <Navbar title={`Submit Repair: ${defect.defectNo}`} />

      {errorMessage && (
        <Toast
          variant="danger"
          title="Submission Incomplete"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/technician"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Jobs</span>
        </Link>
      </div>

      {/* Defect Overview Card */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {defect.defectNo}
            </span>
            <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {defect.priority} Priority
            </span>
          </div>
          <CardTitle className="mt-1 text-base">{defect.component?.name}</CardTitle>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#173B72]" />
            <span>{defect.asset?.venue?.name} • {defect.asset?.name}</span>
          </p>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5">
          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 text-xs space-y-1 text-amber-950">
            <p><strong>Category:</strong> {defect.category} • <strong>Severity:</strong> {defect.severity}</p>
            <p><strong>Auditor Remark:</strong> "{defect.inspectionItem?.remark || 'Defect reported during inspection'}"</p>
          </div>

          {defect.inspectionItem?.photoUrl && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Auditor Photo Evidence
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
                <img
                  src={defect.inspectionItem.photoUrl}
                  alt="Auditor Original Defect Evidence"
                  className="w-full h-40 object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repair Submission Form Card */}
      <Card>
        <form onSubmit={handleSubmitRepair}>
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#173B72]" />
              <span>Upload Geo-tagged Repair Evidence</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mandatory Technician Work Remark *
              </label>
              <textarea
                rows={3}
                placeholder="Describe physical repair actions performed (e.g. Replaced faulty wiring, sealed socket enclosure, tested voltage and load)..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#173B72] focus:border-[#173B72] outline-hidden text-slate-900"
                required
              />
            </div>

            <PhotoCapture
              label="Capture Geo-tagged Repair Proof Photo *"
              onPhotoCaptured={(url, photoLat, photoLng) => {
                setRepairPhotoUrl(url);
                setLat(photoLat);
                setLng(photoLng);
              }}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={submitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Submit Repair (Pending Manager Approval)
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
