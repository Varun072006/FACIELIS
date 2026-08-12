'use client';

import React, { useState, use, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PhotoCapture } from '@/components/photo-capture';
import { CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon, ArrowRight, Search, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react';

const ASSETS_PER_PAGE = 10;

// High-resolution real photo reference standards for all 15 BIT-Sathy asset categories
const GOOD_REFERENCE_GUIDES: Record<string, { title: string; goodImg: string; acceptableImg: string; defectiveImg: string; criteria: string[]; defectWarnings: string[] }> = {
  DOOR: {
    title: 'Entry Door Reference Standard',
    goodImg: '/images/door/good.jpg',
    acceptableImg: '/images/door/acceptable.jpg',
    defectiveImg: '/images/door/defective.jpg',
    criteria: ['Door panel surface clean with no deep scratches or dents', 'Handle turns smoothly and latch engages firmly', 'Hinges operate silently without sagging', 'Rubber seals intact along frame'],
    defectWarnings: ['Cracked frame or misaligned latch', 'Loose handle mechanism', 'Rusty hinges or torn weather stripping'],
  },
  WIN_SLIDING: {
    title: 'Sliding Glass Window & Curtain Standard',
    goodImg: '/images/win_sliding/good.jpg',
    acceptableImg: '/images/win_sliding/acceptable.jpg',
    defectiveImg: '/images/win_sliding/defective.jpg',
    criteria: ['Glass pane crystal clear without cracks or chips', 'Aluminum frame slides smoothly on rollers', 'Window latch locks securely', 'Curtain fabric clean and rod brackets firmly mounted'],
    defectWarnings: ['Cracked pane or broken seal', 'Stuck slide rail', 'Damaged or stained curtain fabric'],
  },
  WIN_HALF: {
    title: 'Half Wall Glass Window Standard',
    goodImg: '/images/win_half/good.jpg',
    acceptableImg: '/images/win_half/acceptable.jpg',
    defectiveImg: '/images/win_half/defective.jpg',
    criteria: ['Half wall glass pane securely mounted', 'Frame border sealed without gaps', 'Window lock functional', 'Curtain fabric clean'],
    defectWarnings: ['Loose glass mounting bracket', 'Chipped pane edge', 'Dirty or torn curtain'],
  },
  TAB_4S: {
    title: '4-Seater Table & Electrical Box Standard',
    goodImg: '/images/tab_4s/good.jpg',
    acceptableImg: '/images/tab_4s/acceptable.jpg',
    defectiveImg: '/images/tab_4s/defective.jpg',
    criteria: ['Laminate table top smooth and stain-free', 'Dual end electrical switch boxes fully enclosed', 'Socket ports hold plugs firmly without wobble', 'Internal wiring hidden and insulated'],
    defectWarnings: ['Burning smell, discoloration, or charring around socket', 'Loose socket ports or exposed wires', 'Wobbly legs or broken table edge'],
  },
  TAB_2S: {
    title: '2-Seater Table Standard',
    goodImg: '/images/tab_2s/good.jpg',
    acceptableImg: '/images/tab_2s/acceptable.jpg',
    defectiveImg: '/images/tab_2s/defective.jpg',
    criteria: ['Table top clean and level', 'Single electrical switch box firmly attached', 'Power sockets functional and grounded', 'Cable grommet intact'],
    defectWarnings: ['Cracked switch box faceplate', 'Sparking or loose wiring', 'Damaged table legs'],
  },
  CHAIR: {
    title: 'Ergonomic Office Chair Standard',
    goodImg: '/images/chair/good.jpg',
    acceptableImg: '/images/chair/acceptable.jpg',
    defectiveImg: '/images/chair/defective.jpg',
    criteria: ['Cushion fabric intact without tears', 'Hydraulic height adjustment smooth', 'All 5 base casters roll freely', 'Backrest and armrests firmly supported'],
    defectWarnings: ['Torn seat mesh/upholstery', 'Broken hydraulic lift sinking automatically', 'Missing or stuck caster wheels'],
  },
  COMP: {
    title: 'Workstation Computer PC Standard',
    goodImg: '/images/comp/good.jpg',
    acceptableImg: '/images/comp/acceptable.jpg',
    defectiveImg: '/images/comp/defective.jpg',
    criteria: ['Display monitor screen crisp with no dead pixels', 'CPU tower powered and fan running quietly', 'Keyboard and optical mouse clean and responsive', 'Cat6 Ethernet cable clipped firmly'],
    defectWarnings: ['Flickering monitor or cracked screen', 'Damaged or loose RJ45 Ethernet connector', 'Unresponsive keyboard/mouse'],
  },
  ROUTER: {
    title: 'WiFi Access Point / Router Standard',
    goodImg: '/images/router/good.jpg',
    acceptableImg: '/images/router/acceptable.jpg',
    defectiveImg: '/images/router/defective.jpg',
    criteria: ['Base unit LEDs green and active', 'Power cord and uplink Ethernet secure', 'Antennas positioned correctly', 'Wall mounting bracket stable'],
    defectWarnings: ['Red error status LEDs', 'Damaged power adapter insulation', 'Disconnected uplink cable'],
  },
  FLOOR: {
    title: 'Main Cabin Tiled Floor Standard',
    goodImg: '/images/floor/good.jpg',
    acceptableImg: '/images/floor/acceptable.jpg',
    defectiveImg: '/images/floor/defective.jpg',
    criteria: ['Tiled surface clean, dry, and slip-free', 'Grout lines intact', 'Skirting borders aligned', 'No cracked or loose tiles'],
    defectWarnings: ['Chipped or cracked tile', 'Spilled liquid hazard', 'Loose skirting board'],
  },
  CEILING: {
    title: 'False Ceiling Structure Standard',
    goodImg: '/images/ceiling/good.jpg',
    acceptableImg: '/images/ceiling/acceptable.jpg',
    defectiveImg: '/images/ceiling/defective.jpg',
    criteria: ['False ceiling panels clean without water stains', 'Grid framing perfectly horizontal', 'No sagging or missing tiles'],
    defectWarnings: ['Yellow water leak stain on panel', 'Sagging or displaced ceiling tile', 'Rusted T-bar grid'],
  },
  AC: {
    title: 'Split Air Conditioner Unit Standard',
    goodImg: '/images/ac/good.jpg',
    acceptableImg: '/images/ac/acceptable.jpg',
    defectiveImg: '/images/ac/defective.jpg',
    criteria: ['Indoor unit blower blowing cool air evenly', 'Air filter clean and dust-free', 'Remote controller responsive with battery', 'Condensate drain pipe draining without leaks'],
    defectWarnings: ['Water dripping from indoor unit', 'Abnormal rattle or grinding noise', 'No cooling output / frozen coils'],
  },
  FAN: {
    title: 'Ceiling Fan Standard',
    goodImg: '/images/fan/good.jpg',
    acceptableImg: '/images/fan/acceptable.jpg',
    defectiveImg: '/images/fan/defective.jpg',
    criteria: ['Fan motor runs quietly without humming', 'All 3 blades balanced and dust-free', 'Wall regulator controls speed smoothly', 'Ceiling hook & safety wire secure'],
    defectWarnings: ['Wobbly fan or loose canopy', 'Buzzing motor noise', 'Non-responsive wall regulator'],
  },
  LIGHT: {
    title: 'Ceiling Light Fixture Standard',
    goodImg: '/images/light/good_light.png',
    acceptableImg: '/images/light/acceptable_light.png',
    defectiveImg: '/images/light/defective_light.png',
    criteria: ['LED tube/panel turns on instantly without flickering', 'Diffuser cover clean and free of insects', 'Mounting clips firm', 'No humming ballast'],
    defectWarnings: ['Flickering or burnt LED element', 'Cracked light cover panel', 'Exposed ceiling wiring'],
  },
  SWITCH_MAIN: {
    title: 'Main Electrical Switch Box Standard',
    goodImg: '/images/switch_main/good.jpg',
    acceptableImg: '/images/switch_main/acceptable.jpg',
    defectiveImg: '/images/switch_main/defective.jpg',
    criteria: ['Switch panel faceplate clean and secured with screws', 'All switches toggle crisply with clear ON/OFF labeling', 'No heat buildup or burning odor', 'Indicator neon light functional'],
    defectWarnings: ['Cracked switch plate or missing screws', 'Loose or sparking switch toggles', 'Char marks or melting plastic around switches'],
  },
  PRINTER: {
    title: 'Laser Jet Printer Standard',
    goodImg: '/images/printer/good.jpg',
    acceptableImg: '/images/printer/acceptable.jpg',
    defectiveImg: '/images/printer/defective.jpg',
    criteria: ['Power & USB/Network cables firmly plugged', 'Paper tray loaded and aligned properly', 'Toner cartridge printing clear test page without streaks', 'Control panel LCD display active'],
    defectWarnings: ['Frequent paper jams', 'Black streaks or faint print output', 'Broken paper tray cover'],
  },
};

export default function AuditInspectionPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refModal, setRefModal] = useState<{ categoryCode: string; assetName: string; componentName?: string } | null>(null);

  // Form state: Map of componentId -> { status: 'GOOD' | 'DEFECTIVE', remark: string, photoUrl: string, geotagLat: number, geotagLng: number }
  const [results, setResults] = useState<Record<string, { status: 'GOOD' | 'DEFECTIVE'; remark?: string; photoUrl?: string; geotagLat?: number; geotagLng?: number }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  const allAssets = useMemo(() => audit?.venue?.assets || [], [audit]);

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return allAssets;
    return allAssets.filter((asset: any) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [allAssets, search]);

  const totalPages = Math.ceil(filteredAssets.length / ASSETS_PER_PAGE) || 1;

  const currentAssets = useMemo(() => {
    const start = (currentPage - 1) * ASSETS_PER_PAGE;
    return filteredAssets.slice(start, start + ASSETS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  // Calculate audit statistics
  const totalComponents = useMemo(() => {
    return allAssets.reduce((sum: number, asset: any) => sum + (asset.components?.length || 0), 0);
  }, [allAssets]);

  // TESTING MODE: All components default to GOOD unless marked DEFECTIVE
  const checkedCount = totalComponents;
  const defectiveCount = Object.values(results).filter((r) => r.status === 'DEFECTIVE').length;
  const goodCount = totalComponents - defectiveCount;
  const progressPercent = 100;

  const handleStatusChange = (componentId: string, status: 'GOOD' | 'DEFECTIVE') => {
    setResults((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        status,
        ...(status === 'GOOD' ? { remark: undefined, photoUrl: undefined, geotagLat: undefined, geotagLng: undefined } : {}),
      },
    }));
  };

  const handleRemarkChange = (componentId: string, remark: string) => {
    setResults((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        status: 'DEFECTIVE',
        remark,
      },
    }));
  };

  const handlePhotoCaptured = (componentId: string, url: string, lat?: number, lng?: number) => {
    setResults((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        status: 'DEFECTIVE',
        photoUrl: url,
        geotagLat: lat || 11.4965,
        geotagLng: lng || 77.2763,
      },
    }));
  };

  const handleSubmitAudit = async () => {
    setSubmitError('');

    // TESTING MODE: Mandatory click validation commented out as requested for fast testing
    /*
    if (checkedCount < totalComponents) {
      setSubmitError(`Audit incomplete: ${totalComponents - checkedCount} components remaining to be evaluated.`);
      return;
    }
    */

    const defectiveItems = Object.entries(results).filter(([_, val]) => val.status === 'DEFECTIVE');
    for (const [compId, val] of defectiveItems) {
      if (!val.remark || !val.photoUrl) {
        setSubmitError('Every DEFECTIVE item requires a remark and GeoTag photo evidence before submitting.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Build inspection items payload (default unselected items to GOOD)
      const items: any[] = [];
      allAssets.forEach((asset: any) => {
        asset.components?.forEach((comp: any) => {
          const val = results[comp.id] || { status: 'GOOD' };
          items.push({
            assetId: asset.id,
            componentId: comp.id,
            status: val.status,
            remark: val.remark,
            photoUrl: val.photoUrl,
            geotagLat: val.geotagLat,
            geotagLng: val.geotagLng,
          });
        });
      });

      const res = await fetch(`/api/audits/${auditId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit audit');
      }

      router.push(`/auditor/integrity/${auditId}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Audit submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#173B72] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-gray-600">Loading Venue Inspection Matrix...</p>
        </div>
      </div>
    );
  }

  const currentRefGuide = refModal ? GOOD_REFERENCE_GUIDES[refModal.categoryCode] || GOOD_REFERENCE_GUIDES.DOOR : null;

  return (
    <div className="space-y-6 pb-24">
      <Navbar title={`Venue Audit Checklist — ${audit?.venue?.name || 'Right Cabin'}`} />

      {/* Header Banner & Stats */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
                Audit No: {audit?.auditNo}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-extrabold uppercase text-emerald-300">
                Testing Mode (Default GOOD Active)
              </span>
            </div>
            <h2 className="text-2xl font-black mt-2 tracking-tight">{audit?.venue?.name}</h2>
            <p className="text-xs text-blue-100 mt-1">
              Bannari Amman Institute of Technology (BIT-Sathy) • Learning Center 4th Floor
            </p>
          </div>

          <button
            onClick={handleSubmitAudit}
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Submitting Audit...' : 'Submit Audit Checklist'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-200 font-medium">Total Components:</span>
            <p className="text-lg font-black text-white">{totalComponents}</p>
          </div>
          <div>
            <span className="text-blue-200 font-medium">Evaluated:</span>
            <p className="text-lg font-black text-emerald-300">{checkedCount} / {totalComponents}</p>
          </div>
          <div>
            <span className="text-emerald-300 font-medium">Good (Pass):</span>
            <p className="text-lg font-black text-emerald-400">{goodCount}</p>
          </div>
          <div>
            <span className="text-red-300 font-medium">Defective (Fail):</span>
            <p className="text-lg font-black text-red-400">{defectiveCount}</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
          <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter assets by name or serial no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{currentAssets.length}</span> of {filteredAssets.length} Assets
        </div>
      </div>

      {/* Asset Cards with Component Attendance Sheet */}
      <div className="space-y-4">
        {currentAssets.map((asset: any) => (
          <div key={asset.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Asset Header */}
            <div className="bg-gray-50/80 p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-900 shrink-0 shadow-2xs">
                  <img
                    src={GOOD_REFERENCE_GUIDES[asset.assetCategory?.code]?.goodImg || 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#173B72] bg-[#173B72]/10 px-2 py-0.5 rounded">
                      {asset.serialNo}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase">
                      {asset.assetCategory?.name || 'Asset'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-0.5">{asset.name}</h3>
                </div>
              </div>

              {/* View Good Reference Image Button */}
              <button
                onClick={() => setRefModal({ categoryCode: asset.assetCategory?.code || 'DOOR', assetName: asset.name })}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>View Real Reference Photo</span>
              </button>
            </div>

            {/* Components Attendance List */}
            <div className="divide-y divide-gray-100">
              {asset.components?.map((comp: any) => {
                const res = results[comp.id];
                const isDefective = res?.status === 'DEFECTIVE';
                const isGood = !isDefective; // Default all to GOOD for fast testing

                return (
                  <div key={comp.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-gray-900">{comp.name}</p>
                          <button
                            onClick={() => setRefModal({ categoryCode: asset.assetCategory?.code || 'DOOR', assetName: asset.name, componentName: comp.name })}
                            className="text-[10px] text-emerald-700 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Real Standard Photo</span>
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{comp.code}</p>
                      </div>

                      {/* GOOD / DEFECTIVE Radio Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(comp.id, 'GOOD')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isGood
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>GOOD</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(comp.id, 'DEFECTIVE')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isDefective
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>DEFECTIVE</span>
                        </button>
                      </div>
                    </div>

                    {/* Remarks & GeoTag Photo Form (Appears if DEFECTIVE) */}
                    {isDefective && (
                      <div className="mt-4 p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-800">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Defect Remarks & GeoTag Photo Evidence Required</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                            Auditor Remarks / Defect Description *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Burn marks around socket / torn cushion / cracked glass"
                            value={res?.remark || ''}
                            onChange={(e) => handleRemarkChange(comp.id, e.target.value)}
                            className="w-full p-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 bg-white"
                            required
                          />
                        </div>

                        <PhotoCapture
                          label="Capture Geo-tagged Defect Photo"
                          onPhotoCaptured={(url, lat, lng) => handlePhotoCaptured(comp.id, url, lat, lng)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
          <span className="font-bold text-gray-900">{totalPages}</span> ({filteredAssets.length} total assets)
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* View Good Reference Image Modal */}
      {refModal && currentRefGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin Verified Real Component Reference Standard
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{currentRefGuide.title}</span>
                </h3>
                <p className="text-xs text-gray-500">Asset: {refModal.assetName} {refModal.componentName ? `• ${refModal.componentName}` : ''}</p>
              </div>
              <button
                onClick={() => setRefModal(null)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Real Photo Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-emerald-300 bg-gray-900 relative shadow-sm">
                  <img
                    src={currentRefGuide.goodImg}
                    alt="Real Component - Good Condition"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>REAL COMPONENT PHOTO (PASS)</span>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-amber-300 bg-gray-900 relative shadow-sm">
                  <img
                    src={currentRefGuide.acceptableImg}
                    alt="Real Component - Acceptable Condition"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ACCEPTABLE STANDARD</span>
                  </div>
                </div>
              </div>

              {/* Good Acceptance Criteria */}
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 space-y-2">
                <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Good Condition Acceptance Criteria:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-950 font-medium pl-1">
                  {currentRefGuide.criteria.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defect Warnings */}
              <div className="bg-red-50/60 rounded-xl p-4 border border-red-200 space-y-2">
                <h4 className="font-extrabold text-xs text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Defect Warning Signs (Mark DEFECTIVE if present):</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-red-950 font-medium pl-1">
                  {currentRefGuide.defectWarnings.map((warn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setRefModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#173B72] text-[#ffffff] font-bold text-xs hover:bg-[#173B72]/90 transition-all"
              >
                Close Reference Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
