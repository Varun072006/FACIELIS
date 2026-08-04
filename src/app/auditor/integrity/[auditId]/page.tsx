'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export default function IntegrityQuestionsPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const router = useRouter();

  const { data: audit } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: () => fetch(`/api/audits/${auditId}`).then((res) => res.json()),
  });

  const { data: crossItems } = useQuery({
    queryKey: ['cross-audit-items', audit?.venueId],
    queryFn: () => fetch(`/api/cross-audit?venueId=${audit?.venueId}`).then((res) => res.json()),
    enabled: !!audit?.venueId,
  });

  const questions = crossItems?.integrityQuestions || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = (qId: string, opt: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const submitIntegrity = async () => {
    setSubmitting(true);
    try {
      const responsePayload = Object.entries(answers).map(([questionId, auditorResponse]) => ({
        questionId,
        auditorResponse,
      }));

      await fetch('/api/cross-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          responses: responsePayload,
        }),
      });

      router.push(`/auditor/summary/${auditId}`);
    } catch (err) {
      console.error('Submit integrity failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Navbar title="Audit Integrity Verification" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Step 3 of 3: Integrity Questions
        </span>
        <h2 className="text-xl font-extrabold">Manual Physical Verification</h2>
        <p className="text-xs text-blue-100 max-w-xl">
          To discourage fake inspections, please answer these physical verification questions regarding the venue you just audited.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q: any) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#173B72]" />
              <span>{q.question}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionText = q[`option${letter}`];
                const isSelected = answers[q.id] === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(q.id, letter)}
                    className={`p-3 rounded-lg border text-left font-medium transition-all ${
                      isSelected
                        ? 'border-[#173B72] bg-blue-50 text-[#173B72] font-bold shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-bold mr-2">{letter})</span>
                    <span>{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Audit Button */}
      <div className="flex justify-end">
        <button
          onClick={submitIntegrity}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2"
        >
          <span>{submitting ? 'Calculating Final Scores...' : 'Finish Audit & View Summary'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
