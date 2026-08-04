'use client';

import { Navbar } from '@/components/layout/navbar';
import { ClipboardList, CheckCircle2, FileText } from 'lucide-react';

export default function AuditTemplatesPage() {
  return (
    <div className="space-y-6">
      <Navbar title="Audit Templates & Checklist Engine" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Cabin / Room Inspection Template</h3>
            <p className="text-xs text-gray-500">Auto-loads all 143 assets & sub-components dynamically for assigned auditors</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            Active Master Template
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">1. Door & Window Inspection</p>
            <p className="text-gray-500 mt-1">Door panel, handle, lock, hinges, frame seal, sliding glass, curtain fabric & rod</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">2. Electrical Table Inspection</p>
            <p className="text-gray-500 mt-1">4-seater & 2-seater table top, legs, switch boxes, socket ports, internal wiring</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">3. Workstation PC Inspection</p>
            <p className="text-gray-500 mt-1">Display monitor, CPU tower, mouse, keyboard, Cat6 Ethernet connection</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">4. HVAC & Appliances</p>
            <p className="text-gray-500 mt-1">Split AC indoor unit, remote, filter, condensate drain pipe, network printer</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">5. Ceiling, Lighting & Power</p>
            <p className="text-gray-500 mt-1">Ceiling fans, regulators, LED fixtures, wiring, main switch boxes, MCB breakers</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-bold text-[#173B72]">6. Furniture & Infrastructure</p>
            <p className="text-gray-500 mt-1">60 Ergonomic chairs, tile floor surface, false ceiling panels, WiFi access point</p>
          </div>
        </div>
      </div>
    </div>
  );
}
