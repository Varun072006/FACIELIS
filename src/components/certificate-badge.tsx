import React from 'react';
import { ShieldCheck, Award, Calendar, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface CertificateProps {
  certNo: string;
  venueName: string;
  buildingName: string;
  score: number;
  status: 'FIT' | 'UNFIT' | 'CONDITIONAL';
  validFrom: string;
  validUntil: string;
  approvedBy?: string;
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
}: CertificateProps) {
  const isFit = status === 'FIT';

  return (
    <div className="bg-white border-4 border-[#173B72] rounded-2xl p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
      {/* Decorative Gold/Royal Seal Background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#173B72]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-[#173B72]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center border-b-2 border-gray-100 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#173B72] text-white mb-3 shadow-md">
          <Award className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-[#173B72] tracking-wider uppercase">FACIELIS ASSURANCE</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">FACILITY FITNESS CERTIFICATE</p>
        <p className="text-xs text-[#173B72] font-serif italic mt-1">"Where Facilities Earn Trust"</p>
      </div>

      {/* Body */}
      <div className="py-6 text-center space-y-4">
        <p className="text-xs text-gray-400 font-semibold uppercase">This is to certify that</p>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">{venueName}</h3>
        <p className="text-xs text-gray-500 font-medium">{buildingName} — Bannari Amman Institute of Technology</p>

        {/* Status Stamp */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-black border-2 shadow-sm ${
              status === 'FIT'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                : status === 'CONDITIONAL'
                ? 'bg-amber-50 text-amber-700 border-amber-500'
                : 'bg-red-50 text-red-700 border-red-500'
            }`}
          >
            {status === 'FIT' && <CheckCircle2 className="w-6 h-6" />}
            {status === 'CONDITIONAL' && <AlertTriangle className="w-6 h-6" />}
            {status === 'UNFIT' && <XCircle className="w-6 h-6" />}
            <span>STATUS: {status}</span>
          </div>
          <p className="text-sm font-bold text-gray-700 mt-2">Overall Fitness Score: <span className="text-[#173B72]">{score}%</span></p>
        </div>
      </div>

      {/* Footer details */}
      <div className="border-t-2 border-gray-100 pt-6 grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Certificate No</p>
          <p className="font-mono font-bold text-gray-800">{certNo}</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Approved By</p>
          <p className="font-bold text-gray-800">{approvedBy || 'Facility Manager'}</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Issue Date</p>
          <p className="font-medium text-gray-800">{new Date(validFrom).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Valid Until</p>
          <p className="font-medium text-gray-800">{new Date(validUntil).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
