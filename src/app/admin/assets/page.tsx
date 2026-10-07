'use client';

import React, { useState, Fragment, useMemo, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { PhotoCapture } from '@/components/photo-capture';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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
  const deferredSearch = useDeferredValue(search);
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
    placeholderData: (previousData) => previousData,
  });

  const filteredAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    const term = deferredSearch.toLowerCase().trim();
    return assets.filter((a: any) => {
      const matchesSearch =
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.serialNo.toLowerCase().includes(term);
      const matchesCat = selectedCat === 'ALL' || a.assetCategory?.code === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [assets, deferredSearch, selectedCat]);

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
    <div className="space-y-6 pb-16">
      <Navbar title="Asset & Component Inventory (BIT-Sathy Pilot)" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Equipment Catalog
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Asset & Component Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registered Assets & Reference Standards</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Learning Center 4th Floor Right Cabin • {filteredAssets.length} Assets Registered
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Asset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by asset name or serial no..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'DOOR', 'WIN_SLIDING', 'TAB_4S', 'TAB_2S', 'CHAIR', 'COMP', 'AC', 'FAN', 'LIGHT', 'PRINTER'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-[#173B72] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading asset inventory...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <TableHead className="py-2.5 w-8"></TableHead>
                    <TableHead className="py-2.5 w-14">Standard</TableHead>
                    <TableHead className="py-2.5">Serial No</TableHead>
                    <TableHead className="py-2.5">Asset Name</TableHead>
                    <TableHead className="py-2.5">Category</TableHead>
                    <TableHead className="py-2.5">Venue</TableHead>
                    <TableHead className="py-2.5">Belonging Components</TableHead>
                    <TableHead className="py-2.5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.map((asset: any) => {
                    const isExpanded = expandedAssetId === asset.id;
                    const catCode = asset.assetCategory?.code || 'ASSET';
                    const refImg = asset.assetCategory?.referenceImages?.[0]?.goodImageUrl || createStandardThumb(catCode);

                    return (
                      <Fragment key={asset.id}>
                        <TableRow
                          onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                          className="hover:bg-slate-50/60 cursor-pointer transition-colors text-xs"
                        >
                          <TableCell className="text-center text-slate-400">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </TableCell>
                          <TableCell>
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                              <img src={refImg} alt={asset.name} className="w-full h-full object-cover" />
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-primary">{asset.serialNo}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{asset.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {asset.assetCategory?.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">{asset.venue?.name || 'Right Cabin'}</TableCell>
                          <TableCell className="font-semibold text-slate-700">{asset.components?.length || 0} Components</TableCell>
                          <TableCell>
                            <StatusBadge status={asset.status} />
                          </TableCell>
                        </TableRow>

                        {/* Component Expansion */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                            <TableCell colSpan={8} className="p-4 pl-10 border-t border-b border-slate-200/80">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                                <div>
                                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                    <span>Belonging Sub-components for {asset.name}:</span>
                                  </h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5">Asset Code: {asset.serialNo} • Category: {asset.assetCategory?.name}</p>
                                </div>

                                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verified Quality Standard Attached</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {asset.components?.map((c: any) => (
                                  <div key={c.id} className="p-2 bg-white rounded-md border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                                    <span className="font-medium text-slate-800">{c.name}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{c.code.split('-CMP-')[1] ? `CMP-${c.code.split('-CMP-')[1]}` : c.code}</span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#173B72] text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Upload / Add New Asset</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Laser Printer 02 or 4-Seater Table 11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Serial Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty (e.g. LC4FRC-COMP-021)"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Asset Category *</label>
                <select
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden bg-white text-xs font-medium"
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
                <label className="block font-medium text-slate-700 mb-1">Belonging Sub-components (Comma Separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monitor Screen, CPU Tower, Optical Mouse, Mechanical Keyboard"
                  value={componentsInput}
                  onChange={(e) => setComponentsInput(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden text-xs"
                />
              </div>

              <div>
                <PhotoCapture
                  label="Upload / Capture Asset Reference Standard Image"
                  onPhotoCaptured={(url) => setImageUrl(url)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Creating Asset...' : 'Save & Register'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
