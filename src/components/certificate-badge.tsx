'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, QrCode, Printer, Share2, Check } from 'lucide-react';

interface CertificateProps {
  certNo: string;
  venueName: string;
  buildingName: string;
  score: number;
  status: 'FIT' | 'UNFIT' | 'CONDITIONAL';
  validFrom: string;
  validUntil: string;
  approvedBy?: string;
  qrData?: string;
}

export function CertificateBadge({
  certNo,
  venueName,
  buildingName,
  score,
  status,
  validFrom,
  validUntil,
  approvedBy,
  qrData,
}: CertificateProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        typeof window !== 'undefined' ? window.location.href : `FACIELIS Certificate #${certNo}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Print & Share Controls Bar (Hidden during Print) */}
      <div className="print:hidden flex items-center justify-end gap-2.5 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
          <span>{copied ? 'Link Copied' : 'Share'}</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#173B72] hover:bg-[#122e5a] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate</span>
        </button>
      </div>

      {/* Official Certificate Canvas */}
      <div className="bg-white border-8 border-double border-[#173B72] rounded-3xl p-8 sm:p-10 shadow-2xl max-w-2xl mx-auto relative overflow-hidden print:border-4 print:shadow-none print:max-w-none print:m-0 print:p-8 print:rounded-none">
        {/* Subtle Security Guilloche Background Watermark Pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] text-[#173B72]"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="guilloche" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,3" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <path d="M 0 40 Q 20 0, 40 40 T 80 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 0 40 Q 20 80, 40 40 T 80 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>

        {/* Ambient Corner Blurs */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#173B72]/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-[#173B72]/5 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Outer Golden Border Accent */}
        <div className="border border-amber-400/60 p-6 sm:p-8 rounded-2xl relative bg-white/90 backdrop-blur-xs">
          {/* Certificate Header */}
          <div className="text-center border-b-2 border-amber-200/80 pb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#173B72] to-[#255eb5] text-amber-300 mb-3 shadow-lg ring-4 ring-amber-400/30">
              <Award className="w-11 h-11" />
            </div>
            <h2 className="text-3xl font-black text-[#173B72] tracking-wider uppercase font-serif">
              FACIELIS ASSURANCE
            </h2>
            <p className="text-xs font-extrabold text-amber-800 uppercase tracking-[0.25em] mt-1">
              OFFICIAL FACILITY FITNESS CERTIFICATE
            </p>
            <p className="text-xs text-[#173B72] font-serif italic mt-1">
              "Where Facilities Earn Trust Through Deterministic Precision"
            </p>
          </div>

          {/* Certificate Body */}
          <div className="py-6 text-center space-y-3 relative">
            {/* Center Background Institutional Stamp Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
              <div className="w-72 h-72 rounded-full border-8 border-dashed border-[#173B72] flex items-center justify-center text-center font-black text-xs uppercase tracking-widest p-4">
                FACIELIS OFFICIAL ASSURANCE SEAL • CERTIFIED VENUE
              </div>
            </div>

            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              This is to certify and officially endorse that the facility
            </p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight font-serif">
              {venueName}
            </h3>
            <p className="text-xs text-gray-600 font-medium max-w-md mx-auto">
              {buildingName}
            </p>

            {/* Fitness Status & Overall Score Stamp */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div
                className={`inline-flex items-center gap-2.5 px-8 py-3 rounded-full text-lg font-black border-2 shadow-sm uppercase tracking-wide ${
                  status === 'FIT'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                    : status === 'CONDITIONAL'
                    ? 'bg-amber-50 text-amber-800 border-amber-500'
                    : 'bg-red-50 text-red-800 border-red-500'
                }`}
              >
                {status === 'FIT' && <CheckCircle2 className="w-7 h-7 text-emerald-600" />}
                {status === 'CONDITIONAL' && <AlertTriangle className="w-7 h-7 text-amber-600" />}
                {status === 'UNFIT' && <XCircle className="w-7 h-7 text-red-600" />}
                <span>FACILITY STATUS: {status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 bg-gray-100/80 border border-gray-200/60 px-4 py-1.5 rounded-full">
                <span className="text-xs text-gray-600 font-semibold">Verified Aggregate Score:</span>
                <span className="text-base font-black text-[#173B72]">{score}%</span>
              </div>
            </div>
          </div>

          {/* Footer Audit Details & QR Verification */}
          <div className="border-t-2 border-amber-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-700">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 text-left">
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Certificate No</p>
                <p className="font-mono font-bold text-gray-900 text-xs">{certNo}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Authorized Sign-Off</p>
                <p className="font-bold text-gray-900">{approvedBy || 'Facility Manager'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Issue Date</p>
                <p className="font-medium text-gray-800">{new Date(validFrom).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Valid Until</p>
                <p className="font-medium text-gray-800">{new Date(validUntil).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Cryptographic QR Code Representation */}
            <div className="flex flex-col items-center shrink-0 p-3 bg-gray-50 border border-gray-200 rounded-2xl shadow-2xs">
              <div className="w-24 h-24 bg-white border border-gray-300 rounded-xl p-2 flex items-center justify-center shadow-inner">
                <QrCode className="w-full h-full text-[#173B72]" />
              </div>
              <span className="text-[9px] font-mono text-gray-600 font-bold mt-1.5 uppercase tracking-wider">
                SCAN TO VERIFY
              </span>
              <span className="text-[8px] font-mono text-gray-400 truncate max-w-[100px]">
                {certNo.slice(0, 12)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
