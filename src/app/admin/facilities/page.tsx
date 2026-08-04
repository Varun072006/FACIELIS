'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Building2, ChevronRight, MapPin, Layers, Home, Boxes } from 'lucide-react';

export default function FacilitiesPage() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => fetch('/api/facilities').then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="Facility Hierarchy — Organization Tree" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">BIT-Sathy Campus Structure</h3>
        <p className="text-xs text-gray-500 mb-6">Organization → Campus → Building → Floor → Venue / Cabin → Assets</p>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading facility structure...</div>
        ) : (
          <div className="space-y-6">
            {orgs?.map((org: any) => (
              <div key={org.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Org Header */}
                <div className="bg-[#173B72] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5" />
                    <div>
                      <h4 className="font-bold text-base">{org.name}</h4>
                      <p className="text-xs text-blue-200">{org.address} • Code: {org.code}</p>
                    </div>
                  </div>
                </div>

                {/* Campuses */}
                <div className="p-4 space-y-4 bg-gray-50/50">
                  {org.campuses?.map((campus: any) => (
                    <div key={campus.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
                        <MapPin className="w-4 h-4 text-[#173B72]" />
                        <span>Campus: {campus.name} ({campus.code})</span>
                      </div>

                      {/* Buildings */}
                      <div className="space-y-3 pl-4">
                        {campus.buildings?.map((bldg: any) => (
                          <div key={bldg.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                              <span className="flex items-center gap-2">
                                <Home className="w-3.5 h-3.5 text-[#173B72]" />
                                Building: {bldg.name} ({bldg.code})
                              </span>
                            </div>

                            {/* Floors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                              {bldg.floors?.map((floor: any) => (
                                <div key={floor.id} className="bg-white p-3 rounded border border-gray-200 text-xs">
                                  <p className="font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
                                    <Layers className="w-3.5 h-3.5 text-[#173B72]" />
                                    {floor.name} (Level {floor.level})
                                  </p>
                                  {/* Venues */}
                                  <div className="space-y-1">
                                    {floor.venues?.map((v: any) => (
                                      <div key={v.id} className="p-2 rounded bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                                        <div>
                                          <span className="font-bold text-[#173B72]">{v.name}</span>
                                          <span className="text-[10px] text-gray-500 block">Code: {v.code}</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
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
