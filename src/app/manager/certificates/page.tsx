'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { CertificateBadge } from '@/components/certificate-badge';
import { Award, CheckCircle2 } from 'lucide-react';

export default function ManagerCertificatesPage() {
  const { data: certs } = useQuery({ queryKey: ['certificates'], queryFn: () => fetch('/api/certificates').then((res) => res.json()) });

  return (
    <div className="space-y-6">
      <Navbar title="Facility Certificate Approval Center" />

      <div className="space-y-4">
        {Array.isArray(certs) && certs.length > 0 ? (
          certs.map((c: any) => (
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
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-gray-500">
            No pending certificate approvals. Certificates will populate upon audit completion.
          </div>
        )}
      </div>
    </div>
  );
}
