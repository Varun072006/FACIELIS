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
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <Navbar title="Audit Integrity Verification" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-sm space-y-2 border border-[#173B72]">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-blue-200">
          Step 2 of 2: Integrity Questions
        </span>
        <h2 className="text-xl font-black">Manual Physical Verification</h2>
        <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
          To discourage fake inspections, please answer these physical verification questions regarding the venue you just audited.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q: any) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#173B72] shrink-0" />
                <span>{q.question}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionText = q[`option${letter}`];
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSelectOption(q.id, letter)}
                      className={`p-3.5 rounded-xl border text-left font-medium transition-all min-h-[44px] flex items-center ${
                        isSelected
                          ? 'border-[#173B72] bg-blue-50/80 text-[#173B72] font-black shadow-xs ring-1 ring-[#173B72]'
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
          size="lg"
          isLoading={submitting}
          onClick={submitIntegrity}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          <span>Finish Audit & View Summary</span>
        </Button>
      </div>
    </div>
  );
}

