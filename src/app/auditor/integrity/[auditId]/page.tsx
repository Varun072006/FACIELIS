'use client';

import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      <Navbar title="Audit Integrity Verification" />

      {/* Step Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Step 3 of 3: Integrity Questions
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Manual Physical Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            To prevent superficial inspections, verify these physical characteristics of the venue you just audited.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
          <span>{questions.length} Questions</span>
        </div>
      </div>

      <div className="space-y-3.5">
        {questions.map((q: any) => (
          <Card key={q.id}>
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#173B72] shrink-0" />
                <span>{q.question}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionText = q[`option${letter}`];
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSelectOption(q.id, letter)}
                      className={`p-3 rounded-lg border text-left font-medium transition-colors flex items-center ${
                        isSelected
                          ? 'border-[#173B72] bg-blue-50/80 text-[#173B72] font-semibold shadow-2xs ring-1 ring-[#173B72]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-2 text-slate-900">{letter})</span>
                      <span>{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete Audit Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="success"
          size="md"
          isLoading={submitting}
          onClick={submitIntegrity}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Finish Audit & View Summary
        </Button>
      </div>
    </div>
  );
}
