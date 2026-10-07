'use client';

import { Navbar } from '@/components/layout/navbar';
import { ClipboardList, CheckCircle2, FileText, Sparkles, Layers } from 'lucide-react';

export default function AuditTemplatesPage() {
  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Audit Templates & Checklist Engine" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Template Catalog
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Inspection Checklists</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Audit Templates & Inspection Engine</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pre-configured inspection standards automatically dynamically injected into auditor field checklists.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <ClipboardList className="w-4 h-4 text-primary" />
          <span>Master Template Active</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Cabin / Room Inspection Master Template</h3>
            <p className="text-xs text-slate-500 mt-0.5">Auto-loads all 143 assets & sub-components dynamically for assigned auditors</p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            Active Master
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">1. Door & Window Inspection</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Door panel, handle, lock, hinges, frame seal, sliding glass, curtain fabric & rod</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">2. Electrical Table Inspection</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">4-seater & 2-seater table top, legs, switch boxes, socket ports, internal wiring</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">3. Workstation PC Inspection</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Display monitor, CPU tower, mouse, keyboard, Cat6 Ethernet connection</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">4. HVAC & Appliances</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Split AC indoor unit, remote, filter, condensate drain pipe, network printer</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">5. Ceiling, Lighting & Power</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Ceiling fans, regulators, LED fixtures, wiring, main switch boxes, MCB breakers</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-bold text-primary">6. Furniture & Infrastructure</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">60 Ergonomic chairs, tile floor surface, false ceiling panels, WiFi access point</p>
          </div>
        </div>
      </div>
    </div>
  );
}
