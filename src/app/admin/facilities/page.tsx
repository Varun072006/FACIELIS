'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Building2, ChevronRight, MapPin, Layers, Home, Boxes, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui';

export default function FacilitiesPage() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => fetch('/api/facilities').then((res) => res.json()),
  });

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Facility Hierarchy — Organization Tree" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Architecture & Hierarchy
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Spatial Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Facility Infrastructure Hierarchy</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Complete architectural tree: Organization &rarr; Campus &rarr; Building &rarr; Floor &rarr; Venue &rarr; Assets.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {orgs?.map((org: any) => (
              <div key={org.id} className="border border-slate-200/80 rounded-xl overflow-hidden">
                {/* Org Header */}
                <div className="bg-[#173B72] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{org.name}</h4>
                      <p className="text-xs text-blue-200 mt-0.5">{org.address} • Code: <strong className="font-mono text-white">{org.code}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Campuses */}
                <div className="p-4 space-y-4 bg-slate-50/50">
                  {org.campuses?.map((campus: any) => (
                    <div key={campus.id} className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Campus: {campus.name} ({campus.code})</span>
                      </div>

                      {/* Buildings */}
                      <div className="space-y-3 sm:pl-3">
                        {campus.buildings?.map((bldg: any) => (
                          <div key={bldg.id} className="bg-slate-50/70 rounded-lg border border-slate-200/80 p-3 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-primary" />
                                <span>Building: {bldg.name} ({bldg.code})</span>
                              </span>
                            </div>

                            {/* Floors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:pl-3">
                              {bldg.floors?.map((floor: any) => (
                                <div key={floor.id} className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs shadow-2xs">
                                  <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                    <span>{floor.name} (Level {floor.level})</span>
                                  </p>
                                  {/* Venues */}
                                  <div className="space-y-1.5">
                                    {floor.venues?.map((v: any) => (
                                      <div key={v.id} className="p-2 rounded-md bg-blue-50/40 border border-blue-100/80 flex items-center justify-between">
                                        <div>
                                          <span className="font-bold text-primary block">{v.name}</span>
                                          <span className="text-[10px] text-slate-500 font-mono">Code: {v.code}</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                          {v._count?.assets || 143} Assets
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
