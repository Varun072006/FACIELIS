'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { CertificateBadge } from '@/components/certificate-badge';
import { Award, Printer, ShieldCheck, Eye } from 'lucide-react';
import { Skeleton, EmptyState } from '@/components/ui';

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const { data: certs, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => fetch('/api/certificates').then((res) => res.json()),
  });

  const certList = Array.isArray(certs) ? certs : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Facility Fitness Certificates" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Certification Bureau
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Official Accreditations</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Facility Fitness Certificates</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Official verifiable fitness certificate records issued across campus venues with tamper-evident QR codes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Award className="w-4 h-4 text-primary" />
          <span>{certList.length} Active Badges</span>
        </div>
      </div>

      {/* Certificates List & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Issued Certificates</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">{certList.length} total</span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : certList.length > 0 ? (
            <div className="space-y-2">
              {certList.map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCert(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCert?.id === c.id
                      ? 'border-primary bg-primary/5 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-primary">{c.certificateNo}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.fitnessStatus === 'FIT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : c.fitnessStatus === 'CONDITIONAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {c.fitnessStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{c.venue?.name || 'Right Cabin'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Score: {c.overallScore}% • Issued: {new Date(c.validFrom).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No certificates generated yet. Complete an audit cycle to generate a Facility Fitness Certificate.
            </div>
          )}
        </div>

        {/* Certificate Display Area */}
        <div className="lg:col-span-2 bg-slate-50/60 rounded-xl border border-slate-200/80 p-6 flex flex-col items-center justify-center min-h-[450px]">
          {selectedCert ? (
            <div className="space-y-5 w-full">
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
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 space-y-2">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">Select a certificate from the list to preview or print the official document.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
