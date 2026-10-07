'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { CertificateBadge } from '@/components/certificate-badge';
import { Award, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ManagerCertificatesPage() {
  const { data: certs } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => fetch('/api/certificates').then((res) => res.json()),
  });

  const certList = Array.isArray(certs) ? certs : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Facility Certificate Approval Center" />

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Certification Authority
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Official Facility Badges</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Facility Certificate Approvals</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Official QR-verified fitness certification records issued upon successful audit completion and manager sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Award className="w-4 h-4 text-primary" />
          <span>{certList.length} Issued Certificates</span>
        </div>
      </div>

      <div className="space-y-4">
        {certList.length > 0 ? (
          certList.map((c: any) => (
            <div key={c.id} className="space-y-4">
              <CertificateBadge
                certNo={c.certificateNo}
                venueName={c.venue?.name || 'Right Cabin (Cabin 3)'}
                buildingName="Learning Center 4th Floor — BIT Sathy"
                score={c.overallScore}
                status={c.fitnessStatus}
                validFrom={c.validFrom}
                validUntil={c.validUntil}
                approvedBy="Facility Manager"
              />
            </div>
          ))
        ) : (
          <EmptyState
            icon={Award}
            title="No Issued Certificates"
            description="No certificates currently active. Official certificates are generated automatically upon completed audit verification."
          />
        )}
      </div>
    </div>
  );
}
