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

  // Map response by questionId
  const responseMap: Record<string, any> = {};
  responses.forEach((r: any) => {
    responseMap[r.questionId] = r;
  });

  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const formattedExpiry = expiresAt ? expiresAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Facility Manager — Venue Owner Questionnaire Control Station" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            15-Day Owner Periodic Assessment Engine
          </span>
          <h2 className="text-xl font-extrabold mt-1">Venue Owner 15-Day Questionnaires</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Dispatch 30 periodic assessment questions to venue owners. Questions are valid for 15 days, auto-submitting on expiry and dynamically renewing.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch New 15-Day Question Batch</span>
        </button>
      </div>

      {/* Venue Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#173B72]" />
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Select Facility Venue</h3>
            <p className="text-[11px] text-gray-500">Inspect assigned owner & 15-day batch responses</p>
          </div>
        </div>

        <select
          value={activeVenueId}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="p-2.5 border rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-[#173B72] outline-hidden min-w-[240px]"
        >
          {Array.isArray(venues) && venues.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.code}) — Owner: {v.owner?.name || 'Unassigned'}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Overview Card */}
      {batch && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#173B72]">Batch #{batch.id.substring(0, 8)}</span>
                <StatusBadge status={batch.status} />
              </div>
              <h4 className="font-extrabold text-base text-gray-900 mt-1">Venue: {batch.venue?.name}</h4>
              <p className="text-xs text-gray-500">Responsible Owner: {batch.venue?.owner?.name || 'Dr. Ananth'}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-right space-y-0.5">
              <span className="text-gray-500 block text-[10px] font-bold uppercase">15-Day Expiry Deadline</span>
              <strong className="text-amber-700 font-extrabold flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" /> {formattedExpiry}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-gray-500 block font-semibold">Total Questions</span>
              <strong className="text-base font-black text-[#173B72]">{questions.length}</strong>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-gray-500 block font-semibold">Answered by Owner</span>
              <strong className="text-base font-black text-emerald-700">{responses.length}</strong>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-gray-500 block font-semibold">YES Responses</span>
              <strong className="text-base font-black text-amber-700">
                {responses.filter((r: any) => r.answer === 'YES').length}
              </strong>
            </div>
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span className="text-[10px] text-gray-500 block font-semibold">Defect / Issue Reports</span>
              <strong className="text-base font-black text-red-700">
                {responses.filter((r: any) => r.answer === 'NO' || r.answer === 'PARTIAL').length}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Questions & Owner Answers List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#173B72]" />
            <span>30-Question Assessment Checklist & Owner Audit Log</span>
          </h3>
        </div>

        {loadingBatch ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading venue owner questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No active questions found for this venue.</div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {questions.map((q: any, idx: number) => {
              const res = responseMap[q.id];

              return (
                <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 max-w-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#173B72] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase mb-1 inline-block">
                        {q.category || 'General'}
                      </span>
                      <p className="font-bold text-gray-900 leading-snug">{q.question}</p>
                    </div>
                  </div>

                  {/* Owner Answer Pill */}
                  <div className="self-end sm:self-center shrink-0 text-right">
                    {res ? (
                      <div className="space-y-0.5">
                        <span className={`px-3 py-1 rounded-full font-black text-[11px] inline-block ${
                          res.answer === 'YES'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.answer === 'NO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {res.answer === 'YES' ? '✓ YES — Functional' : res.answer === 'NO' ? '✕ NO — Defective' : '⚠ PARTIAL'}
                        </span>
                        {res.remark && (
                          <p className="text-[10px] text-gray-500 italic max-w-xs truncate">"{res.remark}"</p>
                        )}
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-400 font-serif italic text-[11px]">
                        Awaiting Answer
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Dispatch 15-Day Question Batch</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to dispatch a fresh 30-question assessment batch for this venue? This will reset the 15-day countdown timer for the Venue Owner.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => createBatchMutation.mutate(activeVenueId)}
                disabled={createBatchMutation.isPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{createBatchMutation.isPending ? 'Dispatching...' : 'Confirm Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
