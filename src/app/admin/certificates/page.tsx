'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { CertificateBadge } from '@/components/certificate-badge';
import { Award, Printer, ShieldCheck, Eye } from 'lucide-react';

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const { data: certs, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => fetch('/api/certificates').then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Facility Fitness Certificates" />

      {/* Certificates List & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#173B72]" />
            <span>Generated Certificates</span>
          </h3>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500">Loading certificates...</div>
          ) : Array.isArray(certs) && certs.length > 0 ? (
            <div className="space-y-2">
              {certs.map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCert(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCert?.id === c.id
                      ? 'border-[#173B72] bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#173B72]">{c.certificateNo}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.fitnessStatus === 'FIT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.fitnessStatus === 'CONDITIONAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.fitnessStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-1">{c.venue?.name || 'Right Cabin'}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Score: {c.overallScore}% • Issued: {new Date(c.validFrom).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-lg">
              No certificates generated yet. Complete an audit cycle to generate a Facility Fitness Certificate.
            </div>
          )}
        </div>

        {/* Certificate Display Area */}
        <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[450px]">
          {selectedCert ? (
            <div className="space-y-4 w-full">
              <CertificateBadge
                certNo={selectedCert.certificateNo}
                venueName={selectedCert.venue?.name || 'Right Cabin (Cabin 3)'}
                buildingName="Learning Center 4th Floor — BIT Sathy"
                score={selectedCert.overallScore}
                status={selectedCert.fitnessStatus}
                validFrom={selectedCert.validFrom}
                validUntil={selectedCert.validUntil}
                approvedBy="Facility Manager"
              />
              <div className="flex justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-[#173B72] text-white font-bold text-xs shadow-md flex items-center gap-2 hover:bg-[#1e4a8e] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 space-y-2">
              <Award className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs font-medium">Select a certificate from the left list to view or print the official document.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
