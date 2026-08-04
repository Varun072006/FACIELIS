'use client';

import React, { useState, Fragment, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { PhotoCapture } from '@/components/photo-capture';
import { Boxes, Search, ChevronDown, ChevronRight, Layers, ChevronLeft, Plus, X, Upload, CheckCircle2, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

const createStandardThumb = (categoryCode: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90">
    <rect width="120" height="90" fill="#173B72" rx="8"/>
    <text x="60" y="42" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900">${categoryCode}</text>
    <text x="60" y="62" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-size="9" font-weight="700">VERIFIED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [categoryCode, setCategoryCode] = useState('COMP');
  const [componentsInput, setComponentsInput] = useState('Main Chassis Surface, Electrical Cable, Power Switch');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then((res) => res.json()),
  });

  const filteredAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter((a: any) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNo.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'ALL' || a.assetCategory?.code === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [assets, search, selectedCat]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  const handleFilterChange = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const componentNames = componentsInput
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          serialNo: serialNo || undefined,
          categoryCode,
          componentNames,
          imageUrl: imageUrl || undefined,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        setShowAddModal(false);
        setName('');
        setSerialNo('');
        setImageUrl('');
      }
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Navbar title="Asset & Component Inventory (BIT-Sathy Pilot)" />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#173B72]/10 text-[#173B72]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-gray-900">Registered Venue Assets & Reference Standards</h2>
            <p className="text-xs text-gray-500">Learning Center 4th Floor Right Cabin • {filteredAssets.length} Assets Registered</p>
          </div>
        </div>

        {/* Upload / Add Asset Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add New Asset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by asset name or serial no..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'DOOR', 'WIN_SLIDING', 'TAB_4S', 'TAB_2S', 'CHAIR', 'COMP', 'AC', 'FAN', 'LIGHT', 'PRINTER'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-[#173B72] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading asset inventory...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 w-16">Standard</th>
                    <th className="p-3">Serial No</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Venue</th>
                    <th className="p-3">Belonging Components</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAssets.map((asset: any) => {
                    const isExpanded = expandedAssetId === asset.id;
                    const catCode = asset.assetCategory?.code || 'ASSET';
                    const refImg = asset.assetCategory?.referenceImages?.[0]?.goodImageUrl || createStandardThumb(catCode);

                    return (
                      <Fragment key={asset.id}>
                        <tr
                          onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                          className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                        >
                          <td className="p-3 text-center text-gray-400">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-[#173B72]" /> : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="p-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 shrink-0">
                              <img src={refImg} alt={asset.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#173B72]">{asset.serialNo}</td>
                          <td className="p-3 font-bold text-gray-900">{asset.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                              {asset.assetCategory?.name}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{asset.venue?.name || 'Right Cabin'}</td>
                          <td className="p-3 font-bold text-gray-700">{asset.components?.length || 0} Components</td>
                          <td className="p-3">
                            <StatusBadge status={asset.status} />
                          </td>
                        </tr>

                        {/* Component Expansion */}
                        {isExpanded && (
                          <tr className="bg-gray-50/70">
                            <td colSpan={8} className="p-4 pl-12 border-t border-b border-gray-200">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                                <div>
                                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-[#173B72]" />
                                    Belonging Sub-components for {asset.name}:
                                  </h4>
                                  <p className="text-[11px] text-gray-500 mt-0.5">Asset Code: {asset.serialNo} • Category: {asset.assetCategory?.name}</p>
                                </div>

                                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verified Quality Standard Attached</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {asset.components?.map((c: any) => (
                                  <div key={c.id} className="p-2.5 bg-white rounded-lg border border-gray-200 text-xs flex items-center justify-between shadow-2xs">
                                    <span className="font-semibold text-gray-800">{c.name}</span>
                                    <span className="text-[10px] font-mono text-gray-400">{c.code.split('-CMP-')[1] ? `CMP-${c.code.split('-CMP-')[1]}` : c.code}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-bold text-gray-900">{totalPages}</span>
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
          </>
        )}
      </div>

      {/* Add / Upload New Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#173B72] text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold">Upload / Add New Asset</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Laser Printer 02 or 4-Seater Table 11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Serial Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty (e.g. LC4FRC-COMP-021)"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-[#173B72] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Asset Category *</label>
                <select
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden bg-white font-semibold"
                >
                  <option value="DOOR">Entry Door</option>
                  <option value="WIN_SLIDING">Sliding Glass Window</option>
                  <option value="WIN_HALF">Half Wall Window</option>
                  <option value="TAB_4S">4-Seater Table</option>
                  <option value="TAB_2S">2-Seater Table</option>
                  <option value="CHAIR">Ergonomic Chair</option>
                  <option value="COMP">Computer System</option>
                  <option value="ROUTER">WiFi Router</option>
                  <option value="FLOOR">Floor Surface</option>
                  <option value="CEILING">Ceiling Surface</option>
                  <option value="AC">Air Conditioner</option>
                  <option value="FAN">Ceiling Fan</option>
                  <option value="LIGHT">Light Fixture</option>
                  <option value="SWITCH_MAIN">Main Switch Box</option>
                  <option value="PRINTER">Printer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Belonging Sub-components (Comma Separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monitor Screen, CPU Tower, Optical Mouse, Mechanical Keyboard"
                  value={componentsInput}
                  onChange={(e) => setComponentsInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                />
              </div>

              <div>
                <PhotoCapture
                  label="Upload / Capture Asset Reference Standard Image"
                  onPhotoCaptured={(url) => setImageUrl(url)}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#173B72] text-white font-black hover:bg-[#1e4a8e] transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Creating Asset...' : 'Save & Register Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
