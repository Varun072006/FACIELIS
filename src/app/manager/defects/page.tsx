'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
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
} from 'lucide-react';

export default function ManagerDefectsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
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

  const filteredDefects = Array.isArray(defects)
    ? defects.filter((d: any) => {
        if (activeFilter === 'OPEN') return d.status === 'OPEN';
        if (activeFilter === 'ASSIGNED') return d.status === 'ASSIGNED';
        if (activeFilter === 'REPAIRED_PENDING_CROSS') return d.status === 'REPAIRED_PENDING_CROSS';
        if (activeFilter === 'VERIFIED') return d.status === 'VERIFIED';
        if (activeFilter === 'REOPENED') return d.status === 'REOPENED';
        return true;
      })
    : [];

  const counts = {
    all: Array.isArray(defects) ? defects.length : 0,
    open: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'OPEN').length : 0,
    assigned: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'ASSIGNED').length : 0,
    pendingCross: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'REPAIRED_PENDING_CROSS').length : 0,
    verified: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'VERIFIED').length : 0,
    reopened: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'REOPENED').length : 0,
  };

  const hasSubmittedRepair = selectedDefect?.repair !== null && selectedDefect?.repair !== undefined;
  const isClosedVerified = selectedDefect?.status === 'VERIFIED';

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Defect Lifecycle & Field Technician Routing Center" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            End-to-End Maintenance Tracking
          </span>
          <h2 className="text-xl font-extrabold mt-1">Manual Technician Assignment & Repair Approval Center</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Audit defects are logged in unassigned state. Manually assign field technicians, monitor repair proofs, and approve completed resolutions into history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {counts.pendingCross > 0 && (
            <span className="px-3 py-2 rounded-xl bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{counts.pendingCross} Submitted Repairs Awaiting Approval</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Defect Pipeline Filter:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'ALL' ? 'bg-[#173B72] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter('OPEN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'OPEN' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unassigned ({counts.open})
            </button>
            <button
              onClick={() => setActiveFilter('ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'ASSIGNED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assigned ({counts.assigned})
            </button>
            <button
              onClick={() => setActiveFilter('REPAIRED_PENDING_CROSS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'REPAIRED_PENDING_CROSS' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted Repairs ({counts.pendingCross})
            </button>
            <button
              onClick={() => setActiveFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed History ({counts.verified})
            </button>
            <button
              onClick={() => setActiveFilter('REOPENED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'REOPENED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reopened ({counts.reopened})
            </button>
          </div>
        </div>
      </div>

      {/* Defects Registry Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Defects Registry & Routing Table</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading defects...</div>
        ) : filteredDefects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Defect No</th>
                  <th className="p-3">Component / Asset</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority / Severity</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned Technician</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDefects.map((defect: any) => {
                  const isUnassigned = defect.status === 'OPEN';
                  const isSubmittedRepair = defect.status === 'REPAIRED_PENDING_CROSS';
                  const isClosed = defect.status === 'VERIFIED';

                  return (
                    <tr key={defect.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-700">{defect.defectNo}</td>
                      <td className="p-3">
                        <p className="font-bold text-gray-900">{defect.component?.name}</p>
                        <p className="text-[10px] text-gray-500">{defect.asset?.name}</p>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{defect.category}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#173B72] mr-2">{defect.priority}</span>
                        <StatusBadge status={defect.severity} />
                      </td>
                      <td className="p-3 font-medium text-gray-800">{defect.department?.name}</td>
                      <td className="p-3 text-gray-700 font-semibold">
                        {defect.technician?.name ? (
                          <span>{defect.technician.name}</span>
                        ) : (
                          <span className="text-amber-600 font-bold italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Manual Assignment Needed
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {defect.isOverdue ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">OVERDUE</span>
                        ) : (
                          <span className="text-gray-500 font-mono text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            Due: {new Date(defect.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={defect.status} />
                      </td>
                      <td className="p-3 text-right">
                        {isUnassigned ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-3 py-1 rounded bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition-colors flex items-center gap-1 ml-auto shadow-xs"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Assign Technician</span>
                          </button>
                        ) : isSubmittedRepair ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors flex items-center gap-1 ml-auto shadow-xs animate-pulse"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review & Approve</span>
                          </button>
                        ) : isClosed ? (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] hover:bg-emerald-100 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Archive className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View History Record</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDefect(defect);
                              setNewTechnicianId(defect.technicianId || '');
                            }}
                            className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-bold text-[11px] hover:bg-gray-200 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Track Lifecycle</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">No defects found matching current filters.</div>
        )}
      </div>

      {/* Defect Lifecycle Detail & Evidence Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-mono font-bold">
                    {selectedDefect.defectNo}
                  </span>
                  {isClosedVerified && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      CLOSED & ARCHIVED
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1">
                  Defect Lifecycle Record — {selectedDefect.component?.name}
                </h3>
                <p className="text-xs text-gray-500">Asset: <strong className="text-gray-800">{selectedDefect.asset?.name}</strong> • Venue: <strong className="text-gray-800">{selectedDefect.asset?.venue?.name}</strong></p>
              </div>
              <button
                onClick={() => setSelectedDefect(null)}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Status Informational Banner */}
            {selectedDefect.status === 'OPEN' ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-extrabold">Unassigned Defect:</strong> Please select an available field technician below and click <strong>Confirm Routing</strong> to initiate repair.
                </span>
              </div>
            ) : selectedDefect.status === 'ASSIGNED' ? (
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong className="font-extrabold">Assigned to Technician ({selectedDefect.technician?.name}):</strong> Awaiting technician field repair & proof photo submission. Approval button unlocks upon submission.
                </span>
              </div>
            ) : selectedDefect.status === 'REPAIRED_PENDING_CROSS' ? (
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong className="font-extrabold">Technician Submitted Repair Proof:</strong> Review the technician's repair photo & GPS proof below. Click <strong>Approve & Sign Off Resolution</strong> to close defect into history.
                </span>
              </div>
            ) : isClosedVerified ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-extrabold block">Defect Verified & Closed into Maintenance History</strong>
                  <span>Repair approved by manager. Routing and status are locked and permanently archived.</span>
                </div>
              </div>
            ) : null}

            {/* Visual Lifecycle Stepper */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">Defect Resolution Progress</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`p-2 rounded-lg border font-semibold ${selectedDefect ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  1. Reported
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${selectedDefect.status !== 'OPEN' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  2. Assigned
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${hasSubmittedRepair ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  3. Repaired
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${isClosedVerified ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  4. Verified (Closed)
                </div>
              </div>
            </div>

            {/* Photo & Proof Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Auditor Evidence */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
                <span className="font-extrabold text-red-900 uppercase text-[10px] tracking-wider block">
                  1. Auditor Defect Evidence
                </span>
                <p className="text-gray-800 font-medium">"{selectedDefect.inspectionItem?.remark || 'Defect flagged during audit'}"</p>
                {selectedDefect.inspectionItem?.photoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-red-300 h-40 bg-gray-900">
                    <img src={selectedDefect.inspectionItem.photoUrl} alt="Auditor Defect Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-100/50 rounded text-red-800 text-[11px]">No auditor photo attached</div>
                )}
              </div>

              {/* Technician Repair Proof */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-extrabold text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center justify-between">
                  <span>2. Technician Repair Proof</span>
                  {selectedDefect.repair?.geotagLat && (
                    <span className="text-emerald-700 font-mono text-[10px]">GPS Verified</span>
                  )}
                </span>
                <p className="text-gray-800 font-medium">
                  "{selectedDefect.repair?.remark || 'No repair proof submitted yet'}"
                </p>
                {selectedDefect.repair?.repairProofPhotoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-emerald-300 h-40 bg-gray-900">
                    <img src={selectedDefect.repair.repairProofPhotoUrl} alt="Technician Repair Proof" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-8 bg-emerald-50 rounded-lg border border-dashed border-emerald-200 text-center text-emerald-700 text-xs italic font-medium">
                    Awaiting technician repair photo submission
                  </div>
                )}
              </div>
            </div>

            {/* Manager Actions Section — Locked when VERIFIED */}
            {isClosedVerified ? (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-extrabold text-emerald-950 block">Archived Maintenance History Record</strong>
                    <span className="text-emerald-800">Assigned Technician: <strong>{selectedDefect.technician?.name || 'Assigned Tech'}</strong> • Resolution Approved & Closed.</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs shrink-0"
                >
                  Close Record
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                <h4 className="font-extrabold text-gray-900 uppercase text-[11px] tracking-wider">Manager Manual Technician Routing</h4>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block font-semibold text-gray-700 mb-1">Select Available Field Technician</label>
                    <select
                      value={newTechnicianId}
                      onChange={(e) => setNewTechnicianId(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white font-medium"
                    >
                      <option value="">-- Select Available Technician --</option>
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
                    className="px-4 py-2 mt-5 rounded-lg bg-[#173B72] text-white font-bold hover:bg-[#1e4a8e] transition-colors disabled:opacity-50"
                  >
                    Confirm Routing
                  </button>
                </div>

                {/* Approval / Reopen Controls — Approval strictly requires submitted repair proof */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleReopenDefect}
                    disabled={updateDefectMutation.isPending}
                    className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Defect</span>
                  </button>

                  <button
                    onClick={handleApproveRepair}
                    disabled={!hasSubmittedRepair || updateDefectMutation.isPending}
                    className={`px-4 py-2 rounded-lg text-white font-extrabold flex items-center gap-1.5 shadow-xs transition-all ${
                      hasSubmittedRepair
                        ? 'bg-emerald-600 hover:bg-emerald-700 opacity-100 cursor-pointer'
                        : 'bg-gray-300 opacity-60 cursor-not-allowed'
                    }`}
                    title={!hasSubmittedRepair ? 'Technician must submit repair proof photo before approval' : ''}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Sign Off Resolution</span>
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
