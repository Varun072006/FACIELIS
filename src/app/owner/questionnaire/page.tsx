'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/providers/auth-provider';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Send,
  Sparkles,
  Info,
  Building2,
} from 'lucide-react';

export default function OwnerQuestionnairePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local state for answers: questionId -> { answer: 'YES'|'NO'|'PARTIAL', remark: string }
  const [answers, setAnswers] = useState<Record<string, { answer: string; remark: string }>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['owner-batch', user?.venueId],
    queryFn: () => fetch(`/api/owner/batch?venueId=${user?.venueId || ''}`).then((res) => res.json()),
  });

  // Populate local answers from database when batch loads
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
          : 'Progress saved successfully!',
        type: 'success',
      });
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

  // 15-day countdown calculation
  const expiresAt = batch?.expiresAt ? new Date(batch.expiresAt) : null;
  const now = new Date();
  const msLeft = expiresAt ? expiresAt.getTime() - now.getTime() : 0;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  // Group questions by category
  const categoriesMap: Record<string, any[]> = {};
  questions.forEach((q: any) => {
    const cat = q.category || 'General';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(q);
  });

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="15-Day Venue Owner Periodic Questionnaire" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-400/20 pb-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              Venue: {batch?.venue?.name || 'Right Cabin (Cabin 3)'}
            </span>
            <h2 className="text-xl font-black mt-2">15-Day Periodic Self-Assessment Checklist</h2>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-right self-start sm:self-auto">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Validity Window Remaining</span>
            <div className="text-base font-black text-amber-300 flex items-center gap-1.5 justify-end">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} Days, {hoursLeft} Hours</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-100 max-w-2xl">
          Manager sends ~30 questions valid for 15 days. Complete answers before the deadline. Once the 15th day ends, unsubmitted questions are automatically submitted and a new dynamic batch arrives.
        </p>

        {/* Progress Bar */}
        <div className="pt-2 space-y-1">
          <div className="flex justify-between text-xs font-extrabold text-blue-100">
            <span>Completion Progress: {answeredCount} of {questions.length} Questions Answered</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toast Feedback Message */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Questions Form */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-xl border">Loading 15-day questionnaire...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categoriesMap).map(([category, qList]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#173B72]" />
                  <span>{category} Category</span>
                </h3>
                <span className="text-xs text-gray-500 font-semibold">{qList.length} Questions</span>
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                {qList.map((q: any, idx: number) => {
                  const currentObj = answers[q.id] || { answer: '', remark: '' };

                  return (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-[#173B72] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-bold text-gray-900 leading-relaxed">{q.question}</p>
                      </div>

                      {/* Options & Remarks */}
                      <div className="pl-8 space-y-2">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${currentObj.answer === 'YES' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-2xs' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
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

                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${currentObj.answer === 'NO' ? 'bg-red-50 border-red-500 text-red-900 font-black shadow-2xs' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value="NO"
                              checked={currentObj.answer === 'NO'}
                              onChange={() => handleOptionChange(q.id, 'NO')}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span>NO — Defective / Issue</span>
                          </label>

                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${currentObj.answer === 'PARTIAL' ? 'bg-amber-50 border-amber-500 text-amber-900 font-black shadow-2xs' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
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

                        {/* Remark textarea */}
                        <input
                          type="text"
                          placeholder="Optional remark or details for venue manager..."
                          value={currentObj.remark}
                          onChange={(e) => handleRemarkChange(q.id, e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Fixed Action Footer */}
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-600 font-medium">
              <span>Progress: <strong className="text-gray-900 font-black">{answeredCount}/{questions.length}</strong> questions answered.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={respondMutation.isPending}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft Progress</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={respondMutation.isPending || answeredCount === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{respondMutation.isPending ? 'Submitting...' : 'Final Submit Questionnaire'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
