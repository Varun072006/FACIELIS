'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  RotateCcw,
  Eye,
  ShieldCheck,
  Info,
  Calendar,
  FileCheck,
  Archive,
  Search,
  Filter,
  X,
  ArrowRight,
} from 'lucide-react';

export default function ManagerDefectsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDefect, setSelectedDefect] = useState<any | null>(null);
  const [newTechnicianId, setNewTechnicianId] = useState<string>('');

  const { data: defects, isLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => fetch('/api/defects').then((res) => res.json()),
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()),
  });

  const updateDefectMutation = useMutation({
    mutationFn: async ({ id, technicianId, status }: { id: string; technicianId?: string; status?: string }) => {
      const res = await fetch(`/api/defects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId, status }),
      });
      if (!res.ok) throw new Error('Failed to update defect routing/status');
      return res.json();
    },
    onSuccess: (updatedDefect) => {
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      setSelectedDefect(updatedDefect);
    },
  });

  const handleAssignTechnician = () => {
    if (!selectedDefect || !newTechnicianId || selectedDefect.status === 'VERIFIED') return;
    updateDefectMutation.mutate({
      id: selectedDefect.id,
      technicianId: newTechnicianId,
      status: 'ASSIGNED',
    });
  };

  const handleApproveRepair = () => {
    if (!selectedDefect || selectedDefect.status === 'VERIFIED') return;
    updateDefectMutation.mutate({
      id: selectedDefect.id,
      status: 'VERIFIED',
    });
  };

  const handleReopenDefect = () => {
    if (!selectedDefect || selectedDefect.status === 'VERIFIED') return;
    updateDefectMutation.mutate({
      id: selectedDefect.id,
      status: 'REOPENED',
    });
  };

  const allDefects = Array.isArray(defects) ? defects : [];

  const filteredDefects = allDefects
    .filter((d: any) => {
      if (activeFilter === 'OPEN') return d.status === 'OPEN';
      if (activeFilter === 'ASSIGNED') return d.status === 'ASSIGNED';
      if (activeFilter === 'REPAIRED_PENDING_CROSS') return d.status === 'REPAIRED_PENDING_CROSS';
      if (activeFilter === 'VERIFIED') return d.status === 'VERIFIED';
      if (activeFilter === 'REOPENED') return d.status === 'REOPENED';
      return true;
    })
    .filter((d: any) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.defectNo?.toLowerCase().includes(term) ||
        d.component?.name?.toLowerCase().includes(term) ||
        d.asset?.name?.toLowerCase().includes(term) ||
        d.category?.toLowerCase().includes(term) ||
        d.technician?.name?.toLowerCase().includes(term)
      );
    });

  const counts = {
    all: allDefects.length,
    open: allDefects.filter((d: any) => d.status === 'OPEN').length,
    assigned: allDefects.filter((d: any) => d.status === 'ASSIGNED').length,
    pendingCross: allDefects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS').length,
    verified: allDefects.filter((d: any) => d.status === 'VERIFIED').length,
    reopened: allDefects.filter((d: any) => d.status === 'REOPENED').length,
  };

  const hasSubmittedRepair = selectedDefect?.repair !== null && selectedDefect?.repair !== undefined;
  const isClosedVerified = selectedDefect?.status === 'VERIFIED';

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Defect Lifecycle & Field Routing Center" />

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Defect Triage & Routing</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Defect Lifecycle & Technician Routing</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Audit findings require technician assignment, repair validation, and final sign-off to close into facility history.
          </p>
        </div>

        {counts.pendingCross > 0 && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200/80 rounded-xl px-4 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">Requires Review</p>
              <p className="text-xs font-bold text-purple-950">{counts.pendingCross} Submitted Repairs</p>
            </div>
          </div>
        )}
      </div>

      {/* Bento Summary Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#173B72] text-white border-[#173B72] shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-80">All Defects</p>
          <p className="text-xl font-bold mt-0.5">{counts.all}</p>
        </button>

        <button
          onClick={() => setActiveFilter('OPEN')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'OPEN'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase opacity-80">Unassigned</p>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-xl font-bold mt-0.5">{counts.open}</p>
        </button>

        <button
          onClick={() => setActiveFilter('ASSIGNED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'ASSIGNED'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase opacity-80">Assigned</p>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-xl font-bold mt-0.5">{counts.assigned}</p>
        </button>

        <button
          onClick={() => setActiveFilter('REPAIRED_PENDING_CROSS')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'REPAIRED_PENDING_CROSS'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase opacity-80">Awaiting Sign-off</p>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <p className="text-xl font-bold mt-0.5">{counts.pendingCross}</p>
        </button>

        <button
          onClick={() => setActiveFilter('VERIFIED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'VERIFIED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase opacity-80">Closed History</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xl font-bold mt-0.5">{counts.verified}</p>
        </button>

        <button
          onClick={() => setActiveFilter('REOPENED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeFilter === 'REOPENED'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase opacity-80">Reopened</p>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-xl font-bold mt-0.5">{counts.reopened}</p>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defect no, asset, technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredDefects.length}</span> of {allDefects.length} defects
        </div>
      </div>

      {/* Defects Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading defects registry...</div>
        ) : filteredDefects.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="py-2.5">Defect ID</TableHead>
                  <TableHead className="py-2.5">Component / Asset</TableHead>
                  <TableHead className="py-2.5">Category</TableHead>
                  <TableHead className="py-2.5">Priority & Severity</TableHead>
                  <TableHead className="py-2.5">Department</TableHead>
                  <TableHead className="py-2.5">Assigned Tech</TableHead>
                  <TableHead className="py-2.5">SLA Target</TableHead>
                  <TableHead className="py-2.5">Status</TableHead>
                  <TableHead className="py-2.5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefects.map((defect: any) => {
                  const isUnassigned = defect.status === 'OPEN';
                  const isSubmittedRepair = defect.status === 'REPAIRED_PENDING_CROSS';
                  const isClosed = defect.status === 'VERIFIED';

                  return (
                    <TableRow key={defect.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                      <TableCell className="font-mono font-bold text-primary">
                        {defect.defectNo}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900 leading-tight">{defect.component?.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{defect.asset?.name}</p>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {defect.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{defect.priority}</span>
                          <StatusBadge status={defect.severity} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {defect.department?.name || '—'}
                      </TableCell>
                      <TableCell>
                        {defect.technician?.name ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{defect.technician.name}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            <Wrench className="w-3 h-3" /> Needs Assignment
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {defect.isOverdue ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            OVERDUE
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(defect.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={defect.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {isUnassigned ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        ) : isSubmittedRepair ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        ) : isClosed ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold text-[11px] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Archive className="w-3.5 h-3.5 text-slate-500" />
                            <span>History</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-[11px] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No defects found matching current filters.
          </div>
        )}
      </div>

      {/* Defect Lifecycle Detail & Evidence Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {selectedDefect.defectNo}
                  </span>
                  <StatusBadge status={selectedDefect.status} />
                  {isClosedVerified && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      Archived Record
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDefect.component?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asset: <span className="font-semibold text-slate-700">{selectedDefect.asset?.name}</span> • Venue: <span className="font-semibold text-slate-700">{selectedDefect.asset?.venue?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDefect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Informational Banner */}
            {selectedDefect.status === 'OPEN' ? (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-bold">Unassigned Defect:</strong> Select an available field technician below and confirm routing to initiate repair.
                </span>
              </div>
            ) : selectedDefect.status === 'ASSIGNED' ? (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong className="font-bold">Assigned to {selectedDefect.technician?.name}:</strong> Awaiting technician field repair & proof photo. Sign-off unlocks upon submission.
                </span>
              </div>
            ) : selectedDefect.status === 'REPAIRED_PENDING_CROSS' ? (
              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong className="font-bold">Technician Submitted Repair:</strong> Review the repair photo and GPS proof below. Click <strong>Approve & Sign Off</strong> to close defect into history.
                </span>
              </div>
            ) : isClosedVerified ? (
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-bold block">Defect Verified & Closed</strong>
                  <span>Repair approved by manager. Record is archived into permanent maintenance history.</span>
                </div>
              </div>
            ) : null}

            {/* Visual Lifecycle Stepper */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Defect Resolution Progress</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg border font-semibold bg-primary/10 border-primary/20 text-primary">
                  1. Reported
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${selectedDefect.status !== 'OPEN' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-400'}`}>
                  2. Assigned
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${hasSubmittedRepair ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  3. Repaired
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${isClosedVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                  4. Verified
                </div>
              </div>
            </div>

            {/* Photo & Proof Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Auditor Evidence */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-2">
                <span className="font-bold text-rose-900 uppercase text-[10px] tracking-wider block">
                  1. Auditor Defect Evidence
                </span>
                <p className="text-slate-800 font-medium">"{selectedDefect.inspectionItem?.remark || 'Defect flagged during audit'}"</p>
                {selectedDefect.inspectionItem?.photoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-rose-200 h-40 bg-slate-900">
                    <img src={selectedDefect.inspectionItem.photoUrl} alt="Auditor Defect Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-100/50 rounded text-rose-800 text-[11px]">No auditor photo attached</div>
                )}
              </div>

              {/* Technician Repair Proof */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center justify-between">
                  <span>2. Technician Repair Proof</span>
                  {selectedDefect.repair?.geotagLat && (
                    <span className="text-emerald-700 font-mono text-[10px]">GPS Verified</span>
                  )}
                </span>
                <p className="text-slate-800 font-medium">
                  "{selectedDefect.repair?.remark || 'No repair proof submitted yet'}"
                </p>
                {selectedDefect.repair?.repairProofPhotoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-emerald-200 h-40 bg-slate-900">
                    <img src={selectedDefect.repair.repairProofPhotoUrl} alt="Technician Repair Proof" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-8 bg-emerald-50/50 rounded-lg border border-dashed border-emerald-200 text-center text-emerald-700 text-xs italic font-medium">
                    Awaiting technician repair photo submission
                  </div>
                )}
              </div>
            </div>

            {/* Manager Actions Section */}
            {isClosedVerified ? (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Archive className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-bold text-emerald-950 block">Archived Maintenance Record</strong>
                    <span className="text-emerald-800">
                      Assigned Technician: <strong className="font-semibold">{selectedDefect.technician?.name || 'Assigned Tech'}</strong> • Closed on {new Date(selectedDefect.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Close Record
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Technician Routing & Sign-off</h4>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block font-medium text-slate-700 mb-1">Assign Available Technician</label>
                    <select
                      value={newTechnicianId}
                      onChange={(e) => setNewTechnicianId(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                    >
                      <option value="">-- Select Field Technician --</option>
                      {technicians?.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department?.name || 'Technician'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssignTechnician}
                    disabled={!newTechnicianId || updateDefectMutation.isPending}
                    className="px-4 py-2 mt-4 sm:mt-5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    Confirm Routing
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={handleReopenDefect}
                    disabled={updateDefectMutation.isPending}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Defect</span>
                  </button>

                  <button
                    onClick={handleApproveRepair}
                    disabled={!hasSubmittedRepair || updateDefectMutation.isPending}
                    className={`px-4 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-all ${
                      hasSubmittedRepair
                        ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-2xs'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    title={!hasSubmittedRepair ? 'Technician must submit repair proof photo before approval' : ''}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Sign Off</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
