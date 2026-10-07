'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Eye,
  Clock,
  MessageSquareWarning,
  Info,
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
    placeholderData: (previousData) => previousData,
  });
  const { data: orgs } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => fetch('/api/facilities').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });
  const { data: auditors } = useQuery({
    queryKey: ['auditors'],
    queryFn: () => fetch('/api/users?role=AUDITOR').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => fetch('/api/users?role=TECHNICIAN').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });

  const { data: auditDetail, isLoading: loadingAuditDetail } = useQuery({
    queryKey: ['audit-detail', reviewAuditId],
    queryFn: () => (reviewAuditId ? fetch(`/api/audits/${reviewAuditId}`).then((res) => res.json()) : null),
    enabled: !!reviewAuditId,
    placeholderData: (previousData) => previousData,
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
    if (!venueId || !auditorId || !startTime || !dueDate) return;
    createAuditMutation.mutate({
      venueId,
      auditorId,
      startTime: new Date(startTime).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    });
  };

  const handleApprove = () => {
    if (!reviewAuditId) return;
    const assignments = Object.entries(techAssignments).map(([defectId, technicianId]) => ({
      defectId,
      technicianId,
    }));
    approveAuditMutation.mutate({ auditId: reviewAuditId, assignments });
  };

  const filteredAudits = Array.isArray(audits)
    ? audits.filter((a: any) => {
        if (activeTab === 'ALL') return true;
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
    <div className="space-y-5 pb-16">
      <Navbar title="Audit Schedule & Auditor Assignment" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ClipboardList className="w-3.5 h-3.5" />
              Audit Scheduling & Approval
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Time-Bounded Audits & Review Station
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Assign qualified auditors to venues with strict time windows. Manager approval unlocks once the auditor submits the checklist.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {pendingReviewCount > 0 && (
            <span className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{pendingReviewCount} Awaiting Approval</span>
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (venues.length > 0 && !venueId) setVenueId(venues[0].id);
              if (auditors?.length > 0 && !auditorId) setAuditorId(auditors[0].id);
              setShowModal(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule New Audit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'ALL'
              ? 'bg-[#173B72] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Audits ({Array.isArray(audits) ? audits.length : 0})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Pending Review</span>
          {pendingReviewCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] flex items-center justify-center font-bold font-mono">
              {pendingReviewCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Completed & Certified
        </button>
        <button
          onClick={() => setActiveTab('MISSED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'MISSED'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>Missed / Expired ({missedCount})</span>
        </button>
      </div>

      {/* Audits Table */}
      <div className="bento-card overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-[#173B72]" />
            <span>Facility Audits Registry</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">{filteredAudits.length} Audits</span>
        </div>

        {loadingAudits ? (
          <div className="p-8 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audits found matching tab selection.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit No</TableHead>
                <TableHead>Venue / Cabin</TableHead>
                <TableHead>Assigned Auditor</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{activeTab === 'MISSED' ? 'Non-Attendance Reason' : 'Score & Fitness'}</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                  <TableRow key={audit.id}>
                    <TableCell className="font-mono font-bold text-[#173B72]">
                      {audit.auditNo}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {audit.venue?.name} <span className="text-slate-400 font-mono text-[11px]">({audit.venue?.code})</span>
                    </TableCell>
                    <TableCell className="text-slate-700">{audit.auditor?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px] text-slate-600">
                        <span><strong className="text-slate-700">Start:</strong> {formattedStart}</span>
                        <span className="text-rose-700"><strong className="text-slate-700">Expiry:</strong> {formattedDue}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={audit.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      {isMissed ? (
                        <div className="p-1.5 bg-rose-50 rounded border border-rose-200 text-rose-900 text-[11px] max-w-xs space-y-0.5">
                          <p className="font-semibold">"{audit.missedReason || 'Window expired without attendance'}"</p>
                          {audit.missedAt && (
                            <p className="text-[10px] text-rose-600 font-mono">
                              Logged: {new Date(audit.missedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : audit.score ? (
                        <span className={`font-semibold font-mono ${audit.score.isFit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {audit.score.overallScore}% ({audit.score.isFit ? 'FIT' : 'UNFIT'})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending Submission</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPendingReview ? (
                        <button
                          onClick={() => setReviewAuditId(audit.id)}
                          className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1 ml-auto transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Analyze & Approve</span>
                        </button>
                      ) : isScheduledOrProgress ? (
                        <button
                          onClick={() => setReviewAuditId(audit.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-medium text-xs flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Auditor</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setReviewAuditId(audit.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Schedule Audit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule New Time-Bounded Audit"
        description="Select target venue, assign auditor, and establish window boundaries."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Target Venue *</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-[#173B72]"
              required
            >
              <option value="">-- Choose Venue --</option>
              {venues.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assign Auditor *</label>
            <select
              value={auditorId}
              onChange={(e) => setAuditorId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-[#173B72]"
              required
            >
              <option value="">-- Choose Auditor --</option>
              {auditors?.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Start Time *</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-[#173B72]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Expiry / Due Time *</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-[#173B72]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createAuditMutation.isPending}
            >
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Audit Analysis & Approval Modal */}
      <Modal
        isOpen={!!reviewAuditId}
        onClose={() => setReviewAuditId(null)}
        title="Audit Analysis & Technician Assignment"
        description={
          auditDetail
            ? `Audit: ${auditDetail.auditNo} • Venue: ${auditDetail.venue?.name}`
            : 'Inspection review'
        }
        maxWidth="2xl"
      >
        {loadingAuditDetail ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading audit details & score analysis...
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status Notices */}
            {auditDetail?.status === 'SCHEDULED' || auditDetail?.status === 'IN_PROGRESS' ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Awaiting Auditor Submission</strong>
                  <span>
                    Assigned to auditor {auditDetail?.auditor?.name}. Approval buttons unlock once the checklist is submitted.
                  </span>
                </div>
              </div>
            ) : auditDetail?.status === 'COMPLETED' ? (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Audit Approved & Certified</strong> — Fitness score {auditDetail?.score?.overallScore}%. Certificate issued.
                </span>
              </div>
            ) : auditDetail?.status === 'MISSED' ? (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Audit Window Expired / Missed</strong>
                  <span>Reason: "{auditDetail?.missedReason || 'Window expired without completion'}"</span>
                </div>
              </div>
            ) : null}

            {/* Score Breakdown Cards */}
            {auditDetail?.score && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Score Analysis
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono ${
                      auditDetail.score.isFit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Overall: {auditDetail.score.overallScore}% ({auditDetail.score.isFit ? 'FIT' : 'UNFIT'})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">Housekeeping</p>
                    <p className="font-bold text-slate-900 font-mono">{auditDetail.score.housekeepingScore}%</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">Electrical</p>
                    <p className="font-bold text-slate-900 font-mono">{auditDetail.score.electricalScore}%</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">Plumbing</p>
                    <p className="font-bold text-slate-900 font-mono">{auditDetail.score.plumbingScore}%</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">Network</p>
                    <p className="font-bold text-slate-900 font-mono">{auditDetail.score.networkScore}%</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">Documentation</p>
                    <p className="font-bold text-slate-900 font-mono">{auditDetail.score.documentationScore}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Defects & Technician Assignment Routing */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Defects Raised & Technician Assignment
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {auditDetail?.inspectionItems?.filter((i: any) => i.defect).length || 0} Defects
                </span>
              </div>

              {auditDetail?.inspectionItems?.filter((i: any) => i.defect).length === 0 ? (
                <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-center">
                  No defects were raised during this audit. Clean inspection record!
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {auditDetail?.inspectionItems
                    ?.filter((i: any) => i.defect)
                    .map((item: any) => {
                      const defect = item.defect;
                      const currentTechId = techAssignments[defect.id] || defect.technicianId || '';

                      return (
                        <div key={defect.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                            <div>
                              <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-2">
                                {defect.defectNo}
                              </span>
                              <strong className="text-slate-900">{item.component?.name || 'Component'}</strong>
                              <span className="text-slate-400 text-[10px] ml-1.5">
                                ({defect.department?.name || 'Dept'})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#173B72] text-[10px] font-bold">
                                Priority: {defect.priority}
                              </span>
                              <StatusBadge status={defect.severity} size="sm" />
                            </div>
                          </div>

                          <p className="text-slate-600 text-[11px] italic">
                            "{item.remark || 'Defect flagged in inspection'}"
                          </p>

                          {/* Technician Selector */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <label className="font-medium text-slate-700 text-[11px] flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-[#173B72]" />
                              <span>Assign Technician:</span>
                            </label>
                            <select
                              disabled={auditDetail?.status !== 'PENDING_REVIEW'}
                              value={currentTechId}
                              onChange={(e) =>
                                setTechAssignments({ ...techAssignments, [defect.id]: e.target.value })
                              }
                              className="p-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-[#173B72] disabled:bg-slate-100 disabled:opacity-70 text-slate-900"
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

            {/* Modal Actions */}
            {auditDetail?.status === 'PENDING_REVIEW' ? (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reviewAuditId && rejectAuditMutation.mutate(reviewAuditId)}
                  leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                >
                  Request Re-Inspection
                </Button>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  isLoading={approveAuditMutation.isPending}
                  onClick={handleApprove}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve Audit & Confirm Assignments
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setReviewAuditId(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
