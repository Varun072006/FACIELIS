'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import {
  ClipboardList,
  Plus,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Wrench,
  ShieldCheck,
  Eye,
  Clock,
  MessageSquareWarning,
  Info,
  Award,
} from 'lucide-react';

export default function AuditSchedulePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'MISSED'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [reviewAuditId, setReviewAuditId] = useState<string | null>(null);

  // Form states for new audit
  const [venueId, setVenueId] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Manager technician assignment overrides map: defectId -> technicianId
  const [techAssignments, setTechAssignments] = useState<Record<string, string>>({});

  const { data: audits, isLoading: loadingAudits } = useQuery({
    queryKey: ['audits'],
    queryFn: () => fetch('/api/audits').then((res) => res.json()),
  });
  const { data: orgs } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => fetch('/api/facilities').then((res) => res.json()),
  });
  const { data: auditors } = useQuery({
    queryKey: ['auditors'],
    queryFn: () => fetch('/api/users?role=AUDITOR').then((res) => res.json()),
  });
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()),
  });

  const { data: auditDetail, isLoading: loadingAuditDetail } = useQuery({
    queryKey: ['audit-detail', reviewAuditId],
    queryFn: () => (reviewAuditId ? fetch(`/api/audits/${reviewAuditId}`).then((res) => res.json()) : null),
    enabled: !!reviewAuditId,
  });

  const venues = orgs?.[0]?.campuses?.[0]?.buildings?.[0]?.floors?.[0]?.venues || [];

  const createAuditMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to schedule audit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      setShowModal(false);
      setStartTime('');
      setDueDate('');
    },
  });

  const approveAuditMutation = useMutation({
    mutationFn: async ({ auditId, assignments }: { auditId: string; assignments: any[] }) => {
      const res = await fetch(`/api/audits/${auditId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to approve audit');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setReviewAuditId(null);
      setTechAssignments({});
    },
  });

  const rejectAuditMutation = useMutation({
    mutationFn: async (auditId: string) => {
      const res = await fetch(`/api/audits/${auditId}/reject`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reject audit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      setReviewAuditId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAuditMutation.mutate({
      venueId: venueId || (venues[0]?.id ?? ''),
      auditorId: auditorId || (auditors?.[0]?.id ?? ''),
      scheduledDate: startTime || new Date().toISOString(),
      startTime: startTime || new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    });
  };

  const handleApprove = () => {
    if (!reviewAuditId) return;
    const assignmentsArray = Object.entries(techAssignments).map(([defectId, technicianId]) => ({
      defectId,
      technicianId,
    }));
    approveAuditMutation.mutate({ auditId: reviewAuditId, assignments: assignmentsArray });
  };

  const filteredAudits = Array.isArray(audits)
    ? audits.filter((a: any) => {
        if (activeTab === 'PENDING') return a.status === 'PENDING_REVIEW';
        if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
        if (activeTab === 'MISSED') return a.status === 'MISSED';
        return true;
      })
    : [];

  const pendingReviewCount = Array.isArray(audits)
    ? audits.filter((a: any) => a.status === 'PENDING_REVIEW').length
    : 0;

  const missedCount = Array.isArray(audits)
    ? audits.filter((a: any) => a.status === 'MISSED').length
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Audit Schedule & Auditor Assignment Control Center" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Manager Control Center
          </span>
          <h2 className="text-xl font-extrabold mt-1">Time-Bounded Audit Scheduling & Approval Station</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Assign qualified auditors to venues with strict time windows. Manager approval becomes active once auditor submits the completed checklist.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingReviewCount > 0 && (
            <span className="px-3 py-2 rounded-xl bg-amber-400 text-gray-900 font-extrabold text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{pendingReviewCount} Submitted & Awaiting Approval</span>
            </span>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-[#173B72] font-bold text-xs hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'ALL'
              ? 'bg-[#173B72] text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Audits ({Array.isArray(audits) ? audits.length : 0})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>Pending Manager Review</span>
          {pendingReviewCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10px] flex items-center justify-center font-black">
              {pendingReviewCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-700 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Completed & Certified
        </button>
        <button
          onClick={() => setActiveTab('MISSED')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'MISSED'
              ? 'bg-red-700 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>Missed / Expired Audits ({missedCount})</span>
        </button>
      </div>

      {/* Audits Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#173B72]" />
            <span>Facility Audits Registry</span>
          </h3>
        </div>

        {loadingAudits ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading audit schedules...</div>
        ) : filteredAudits.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No audits found matching tab selection.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Audit No</th>
                  <th className="p-3">Venue / Cabin</th>
                  <th className="p-3">Assigned Auditor</th>
                  <th className="p-3">Scheduled Time Window</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">{activeTab === 'MISSED' ? 'Non-Attendance Reason' : 'Score & Fitness'}</th>
                  <th className="p-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAudits.map((audit: any) => {
                  const isPendingReview = audit.status === 'PENDING_REVIEW';
                  const isMissed = audit.status === 'MISSED';
                  const isScheduledOrProgress = audit.status === 'SCHEDULED' || audit.status === 'IN_PROGRESS';

                  const formattedStart = audit.startTime
                    ? new Date(audit.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : new Date(audit.scheduledDate).toLocaleDateString();

                  const formattedDue = audit.dueDate
                    ? new Date(audit.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'N/A';

                  return (
                    <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#173B72]">{audit.auditNo}</td>
                      <td className="p-3 font-bold text-gray-900">{audit.venue?.name} ({audit.venue?.code})</td>
                      <td className="p-3 font-semibold text-gray-800">{audit.auditor?.name}</td>
                      <td className="p-3 text-gray-600">
                        <div className="flex flex-col text-[11px]">
                          <span><strong className="text-gray-700">Start:</strong> {formattedStart}</span>
                          <span className="text-red-700 font-medium"><strong className="text-gray-700">Expiry:</strong> {formattedDue}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="p-3">
                        {isMissed ? (
                          <div className="p-2 bg-red-50 rounded border border-red-200 text-red-900 text-[11px] max-w-xs space-y-0.5">
                            <p className="font-bold">"{audit.missedReason || 'Window expired without attendance'}"</p>
                            {audit.missedAt && (
                              <p className="text-[10px] text-red-600 font-mono">
                                Logged: {new Date(audit.missedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : audit.score ? (
                          <span className={`font-bold ${audit.score.isFit ? 'text-emerald-700' : 'text-red-700'}`}>
                            {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                          </span>
                        ) : (
                          <span className="text-gray-400 font-serif italic">Pending Submission</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isPendingReview ? (
                          <button
                            onClick={() => setReviewAuditId(audit.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1.5 ml-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Analyze & Approve</span>
                          </button>
                        ) : isScheduledOrProgress ? (
                          <button
                            onClick={() => setReviewAuditId(audit.id)}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[11px] flex items-center gap-1 ml-auto"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Auditor</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setReviewAuditId(audit.id)}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Schedule New Time-Bounded Audit</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Target Venue</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                >
                  {venues.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign Auditor</label>
                <select
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                >
                  {auditors?.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Expiry / Due Time</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B72] text-white font-bold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Analysis & Technician Assignment Approval Modal */}
      {reviewAuditId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-extrabold uppercase">
                  Manager Inspection Review Stage
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1">
                  Audit Analysis & Technician Assignment Approval
                </h3>
                <p className="text-xs text-gray-500">Audit No: <strong className="font-mono text-[#173B72]">{auditDetail?.auditNo}</strong> • Venue: <strong className="text-gray-800">{auditDetail?.venue?.name}</strong></p>
              </div>
              <button
                onClick={() => setReviewAuditId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {loadingAuditDetail ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading audit details & score analysis...</div>
            ) : (
              <div className="space-y-6">
                {/* Status Notice Banners */}
                {auditDetail?.status === 'SCHEDULED' || auditDetail?.status === 'IN_PROGRESS' ? (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block">Awaiting Auditor Inspection Checklist Submission</strong>
                      <span>
                        This audit is currently assigned to auditor <strong className="text-blue-950">{auditDetail?.auditor?.name}</strong>. Manager approval buttons will automatically unlock once the auditor completes and submits the inspection checklist.
                      </span>
                    </div>
                  </div>
                ) : auditDetail?.status === 'COMPLETED' ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="font-extrabold">Audit Approved & Certified</strong> — Facility fitness score recorded at {auditDetail?.score?.overallScore}%. Certificate issued.
                    </div>
                  </div>
                ) : auditDetail?.status === 'MISSED' ? (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block">Audit Window Expired / Missed</strong>
                      <span>Auditor Non-Attendance Reason: "{auditDetail?.missedReason || 'Window expired without completion'}"</span>
                    </div>
                  </div>
                ) : null}

                {/* Audit Score Summary Cards */}
                {auditDetail?.score && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Audit Score Analysis & Category Breakdown</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${auditDetail.score.isFit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        Overall: {auditDetail.score.overallScore}% ({auditDetail.score.isFit ? 'FIT FOR CERTIFICATION' : 'UNFIT'})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold">Housekeeping</p>
                        <p className="font-extrabold text-gray-900">{auditDetail.score.housekeepingScore}%</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold">Electrical</p>
                        <p className="font-extrabold text-gray-900">{auditDetail.score.electricalScore}%</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold">Plumbing</p>
                        <p className="font-extrabold text-gray-900">{auditDetail.score.plumbingScore}%</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold">Network</p>
                        <p className="font-extrabold text-gray-900">{auditDetail.score.networkScore}%</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold">Documentation</p>
                        <p className="font-extrabold text-gray-900">{auditDetail.score.documentationScore}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technician Assignment Section for Reported Defects */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Defects Raised & Technician Assignment Approval</span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {auditDetail?.inspectionItems?.filter((i: any) => i.defect).length || 0} Defects Requiring Routing
                    </span>
                  </h4>

                  {auditDetail?.inspectionItems?.filter((i: any) => i.defect).length === 0 ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold text-center">
                      No defects were raised during this audit. Clean inspection record!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {auditDetail?.inspectionItems
                        ?.filter((i: any) => i.defect)
                        .map((item: any) => {
                          const defect = item.defect;
                          const currentTechId = techAssignments[defect.id] || defect.technicianId || '';

                          return (
                            <div key={defect.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                                <div>
                                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mr-2">{defect.defectNo}</span>
                                  <strong className="text-gray-900">{item.component?.name || 'Component'}</strong>
                                  <span className="text-gray-500 text-[10px] ml-2">({defect.department?.name || 'Dept'})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-extrabold">
                                    Priority: {defect.priority}
                                  </span>
                                  <StatusBadge status={defect.severity} />
                                </div>
                              </div>

                              <p className="text-gray-600 text-[11px] italic">"{item.remark || 'Defect flagged in inspection'}"</p>

                              {/* Technician Selector */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                                <label className="font-bold text-gray-700 text-[11px] flex items-center gap-1">
                                  <Wrench className="w-3.5 h-3.5 text-[#173B72]" />
                                  <span>Assign Field Technician:</span>
                                </label>
                                <select
                                  disabled={auditDetail?.status !== 'PENDING_REVIEW'}
                                  value={currentTechId}
                                  onChange={(e) => setTechAssignments({ ...techAssignments, [defect.id]: e.target.value })}
                                  className="p-2 border rounded-lg bg-white text-xs font-medium focus:ring-2 focus:ring-[#173B72] disabled:bg-gray-100 disabled:opacity-70"
                                >
                                  <option value="">-- Choose Technician --</option>
                                  {technicians?.map((t: any) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({t.department?.name || 'Technician'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Footer Buttons — Strictly restricted to PENDING_REVIEW status */}
                {auditDetail?.status === 'PENDING_REVIEW' ? (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => rejectAuditMutation.mutate(reviewAuditId)}
                      className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Request Re-Inspection</span>
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={approveAuditMutation.isPending}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {approveAuditMutation.isPending
                          ? 'Approving & Generating Certificate...'
                          : 'Approve Audit & Confirm Technician Assignments'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setReviewAuditId(null)}
                      className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-all"
                    >
                      Close Details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
