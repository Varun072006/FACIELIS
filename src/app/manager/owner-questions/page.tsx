'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import {
  HelpCircle,
  Plus,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  User,
  Sparkles,
  X,
} from 'lucide-react';

export default function ManagerOwnerQuestionsPage() {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all venues
  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: () => fetch('/api/venues').then((res) => res.json()),
  });

  const activeVenueId = selectedVenueId || (Array.isArray(venues) && venues.length > 0 ? venues[0].id : '');

  // Fetch owner question batch for selected venue
  const { data: batch, isLoading: loadingBatch } = useQuery({
    queryKey: ['owner-batch', activeVenueId],
    queryFn: () => (activeVenueId ? fetch(`/api/owner/batch?venueId=${activeVenueId}`).then((res) => res.json()) : null),
    enabled: !!activeVenueId,
  });

  const createBatchMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const res = await fetch('/api/owner/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId }),
      });
      if (!res.ok) throw new Error('Failed to create new 15-day questionnaire batch');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-batch'] });
      setShowCreateModal(false);
    },
  });

  const questions = batch?.questions || [];
  const responses = batch?.responses || [];

  const responseMap: Record<string, any> = {};
  responses.forEach((r: any) => {
    responseMap[r.questionId] = r;
  });

  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const formattedExpiry = expiresAt ? expiresAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Venue Owner Questionnaire Control Station" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Assessment Operations
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">15-Day Self-Inspection Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Venue Owner Periodic Questionnaires</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Dispatch 30-item periodic assessment questions to venue custodians. Questions automatically renew every 15 days.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-2 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch New 15-Day Batch</span>
        </button>
      </div>

      {/* Venue Selector */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">Select Facility Venue</h3>
            <p className="text-[11px] text-slate-500">Inspect assigned owner & 15-day batch responses</p>
          </div>
        </div>

        <select
          value={activeVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden min-w-[260px]"
        >
          {Array.isArray(venues) && venues.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.code}) — {v.owner?.name || 'Unassigned'}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Overview Bento Grid */}
      {batch && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  Batch #{batch.id.substring(0, 8)}
                </span>
                <StatusBadge status={batch.status} />
              </div>
              <h4 className="font-bold text-base text-slate-900">{batch.venue?.name}</h4>
              <p className="text-xs text-slate-500">Custodian: <strong className="text-slate-700">{batch.venue?.owner?.name || 'Dr. Ananth'}</strong></p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-right space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">15-Day Expiry Deadline</span>
              <strong className="text-amber-700 font-bold flex items-center gap-1 justify-end font-mono">
                <Clock className="w-3.5 h-3.5" /> {formattedExpiry}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Total Questions</span>
              <strong className="text-xl font-bold text-primary mt-0.5 block">{questions.length}</strong>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80">
              <span className="text-[10px] text-emerald-800 block font-semibold uppercase">Completed</span>
              <strong className="text-xl font-bold text-emerald-700 mt-0.5 block">{responses.length}</strong>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/80">
              <span className="text-[10px] text-blue-800 block font-semibold uppercase">Functional (YES)</span>
              <strong className="text-xl font-bold text-blue-700 mt-0.5 block">
                {responses.filter((r: any) => r.answer === 'YES').length}
              </strong>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/80">
              <span className="text-[10px] text-rose-800 block font-semibold uppercase">Defect Flags</span>
              <strong className="text-xl font-bold text-rose-700 mt-0.5 block">
                {responses.filter((r: any) => r.answer === 'NO' || r.answer === 'PARTIAL').length}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Questions & Owner Answers List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>30-Question Assessment Checklist & Custodian Responses</span>
          </h3>
        </div>

        {loadingBatch ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading venue owner questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No active questions found for this venue.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {questions.map((q: any, idx: number) => {
              const res = responseMap[q.id];

              return (
                <div key={q.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 max-w-xl">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase mb-1 inline-block">
                        {q.category || 'General'}
                      </span>
                      <p className="font-semibold text-slate-900 leading-snug">{q.question}</p>
                    </div>
                  </div>

                  {/* Owner Answer Pill */}
                  <div className="self-end sm:self-center shrink-0 text-right">
                    {res ? (
                      <div className="space-y-0.5">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] inline-block ${
                          res.answer === 'YES'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : res.answer === 'NO'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {res.answer === 'YES' ? '✓ Functional' : res.answer === 'NO' ? '✕ Defective' : '⚠ Partial'}
                        </span>
                        {res.remark && (
                          <p className="text-[10px] text-slate-500 italic max-w-xs truncate">"{res.remark}"</p>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 italic text-[11px]">
                        Awaiting Response
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal to Dispatch Batch */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Dispatch 15-Day Batch</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to dispatch a fresh 30-question assessment batch for this venue? This will reset the 15-day countdown timer for the Venue Owner.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => createBatchMutation.mutate(activeVenueId)}
                disabled={createBatchMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{createBatchMutation.isPending ? 'Dispatching...' : 'Confirm Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
