'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function OwnerQuestionnairePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, { answer: string; remark: string }>>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['owner-batch', user?.venueId],
    queryFn: () => fetch(`/api/owner/batch?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  useEffect(() => {
    if (batch?.responses && Array.isArray(batch.responses)) {
      const initialMap: Record<string, { answer: string; remark: string }> = {};
      batch.responses.forEach((r: any) => {
        initialMap[r.questionId] = {
          answer: r.answer,
          remark: r.remark || '',
        };
      });
      setAnswers(initialMap);
    }
  }, [batch]);

  const respondMutation = useMutation({
    mutationFn: async ({ responses, isFinal }: { responses: any[]; isFinal: boolean }) => {
      const res = await fetch(`/api/owner/batch/${batch.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: user?.id,
          responses,
          isFinal,
        }),
      });
      if (!res.ok) throw new Error('Failed to save responses');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owner-batch'] });
      setMessage({
        text: variables.isFinal
          ? 'Questionnaire completed and submitted to Facility Manager successfully!'
          : 'Draft progress saved successfully!',
        type: 'success',
      });
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      setMessage({ text: err.message || 'Failed to save responses', type: 'error' });
    },
  });

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer: value,
        remark: prev[questionId]?.remark || '',
      },
    }));
  };

  const handleRemarkChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer: prev[questionId]?.answer || 'YES',
        remark: text,
      },
    }));
  };

  const handleSaveDraft = () => {
    const formatted = Object.entries(answers).map(([questionId, obj]) => ({
      questionId,
      answer: obj.answer,
      remark: obj.remark,
    }));
    respondMutation.mutate({ responses: formatted, isFinal: false });
  };

  const handleFinalSubmit = () => {
    const formatted = Object.entries(answers).map(([questionId, obj]) => ({
      questionId,
      answer: obj.answer,
      remark: obj.remark,
    }));
    respondMutation.mutate({ responses: formatted, isFinal: true });
  };

  const questions = batch?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const now = new Date();
  const msLeft = expiresAt ? expiresAt.getTime() - now.getTime() : 0;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const categoriesMap: Record<string, any[]> = {};
  questions.forEach((q: any) => {
    const cat = q.category || 'General';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(q);
  });

  return (
    <div className="space-y-6 pb-24">
      <Navbar title="15-Day Venue Owner Periodic Questionnaire" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Venue: {batch?.venue?.name || 'Right Cabin'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Self-Inspection Checklist</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">15-Day Periodic Assessment Questionnaire</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Periodic verification checks issued by Facility Management. Answers auto-finalize upon cycle expiry.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl shrink-0">
          <Clock className="w-4 h-4 text-amber-600" />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Cycle Remaining</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{daysLeft}d {hoursLeft}h</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">
            Progress: <strong className="text-slate-900 font-bold">{answeredCount}</strong> of {questions.length} Answered
          </span>
          <span className="font-bold text-primary">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Toast Feedback Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-2xs transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Questions Form */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center text-xs text-slate-400">
          No active questionnaire batch assigned for this venue cycle.
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(categoriesMap).map(([category, qList]) => (
            <div key={category} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{category} Section</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                  {qList.length} Questions
                </span>
              </div>

              <div className="p-5 space-y-5 divide-y divide-slate-100">
                {qList.map((q: any, idx: number) => {
                  const currentObj = answers[q.id] || { answer: '', remark: '' };

                  return (
                    <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 leading-snug">{q.question}</p>
                      </div>

                      <div className="pl-7 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <label
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
                              currentObj.answer === 'YES'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value="YES"
                              checked={currentObj.answer === 'YES'}
                              onChange={() => handleOptionChange(q.id, 'YES')}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>YES — Fully Functional</span>
                          </label>

                          <label
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
                              currentObj.answer === 'NO'
                                ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value="NO"
                              checked={currentObj.answer === 'NO'}
                              onChange={() => handleOptionChange(q.id, 'NO')}
                              className="text-rose-600 focus:ring-rose-500"
                            />
                            <span>NO — Defective / Issue</span>
                          </label>

                          <label
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
                              currentObj.answer === 'PARTIAL'
                                ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value="PARTIAL"
                              checked={currentObj.answer === 'PARTIAL'}
                              onChange={() => handleOptionChange(q.id, 'PARTIAL')}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span>PARTIAL — Minor Concern</span>
                          </label>
                        </div>

                        <input
                          type="text"
                          placeholder="Optional observations or remark for facility manager..."
                          value={currentObj.remark}
                          onChange={(e) => handleRemarkChange(q.id, e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-hidden transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Fixed Action Bottom Bar */}
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
            <div className="text-xs text-slate-600">
              <span>
                Progress: <strong className="text-slate-900 font-bold">{answeredCount}/{questions.length}</strong> questions answered
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={respondMutation.isPending}
                className="w-full sm:w-auto text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save Draft</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleFinalSubmit}
                disabled={respondMutation.isPending || answeredCount === 0}
                className="w-full sm:w-auto text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{respondMutation.isPending ? 'Submitting...' : 'Final Submit'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
