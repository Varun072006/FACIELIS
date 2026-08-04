'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { HelpCircle, CheckCircle2, Trash2, Edit2, Plus, Upload, X, ShieldAlert, FileText, Check, AlertCircle } from 'lucide-react';

export default function CrossAuditQuestionsPage() {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [assetType, setAssetType] = useState('TABLE');
  const [expectedCount, setExpectedCount] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [bulkInput, setBulkInput] = useState('');

  // Queries
  const { data: venues, isLoading: isLoadingVenues } = useQuery({
    queryKey: ['venues'],
    queryFn: () => fetch('/api/venues').then((res) => res.json()),
  });

  // Set default venue if none selected yet
  React.useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['cross-audit-questions', selectedVenueId],
    queryFn: () => fetch(`/api/cross-audit-questions?venueId=${selectedVenueId}`).then((res) => res.json()),
    enabled: !!selectedVenueId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newQ: any) =>
      fetch('/api/cross-audit-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-audit-questions', selectedVenueId] });
      closeFormModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      fetch(`/api/cross-audit-questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-audit-questions', selectedVenueId] });
      closeFormModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/cross-audit-questions/${id}`, {
        method: 'DELETE',
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-audit-questions', selectedVenueId] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (dataArray: any[]) =>
      fetch('/api/cross-audit-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataArray),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-audit-questions', selectedVenueId] });
      setIsBulkOpen(false);
      setBulkInput('');
    },
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setAssetType('TABLE');
    setExpectedCount('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setAssetType(q.assetType || 'GENERAL');
    setExpectedCount(q.expectedCount !== null ? String(q.expectedCount) : '');
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectAnswer(q.correctAnswer);
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      venueId: selectedVenueId,
      question: questionText,
      assetType,
      expectedCount: expectedCount ? parseInt(expectedCount, 10) : null,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    };

    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBulkUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkInput);
      const dataArray = Array.isArray(parsed) ? parsed : [parsed];
      // Attach selected venueId if not present
      const formatted = dataArray.map(item => ({
        ...item,
        venueId: item.venueId || selectedVenueId,
      }));
      bulkMutation.mutate(formatted);
    } catch (err) {
      alert('Invalid JSON structure. Please verify details.');
    }
  };

  const loadSampleQuestions = () => {
    const samples = [
      {
        question: "How many total 4-seater tables are located in this cabin/room?",
        assetType: "TABLE",
        expectedCount: 10,
        optionA: "8 Tables",
        optionB: "10 Tables",
        optionC: "12 Tables",
        optionD: "6 Tables",
        correctAnswer: "B"
      },
      {
        question: "How many working ceiling fans are installed in this venue?",
        assetType: "FAN",
        expectedCount: 6,
        optionA: "4 Fans",
        optionB: "5 Fans",
        optionC: "6 Fans",
        optionD: "8 Fans",
        correctAnswer: "C"
      },
      {
        question: "Where is the main entry door router/switch situated in this room?",
        assetType: "ROUTER",
        expectedCount: 1,
        optionA: "Near entry door panel",
        optionB: "Center counter",
        optionC: "Under main desk",
        optionD: "In corridor external box",
        correctAnswer: "A"
      }
    ];
    setBulkInput(JSON.stringify(samples, null, 2));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this integrity question?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Navbar title="Cross-Audit Verification & Integrity Question Bank" />

      {/* Hero Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Integrity Verification Dashboard
          </span>
          <h2 className="text-xl font-extrabold">Manual Integrity Question Bank</h2>
          <p className="text-xs text-blue-100 max-w-2xl">
            Configure randomized verification questions that auditors must answer upon completing inspections. Inconsistencies flag audits for manager review without biased automated accusations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Venues Selector Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Filter by Venue / Room
          </span>
          {isLoadingVenues ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading venues...</div>
          ) : (
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {venues?.map((v: any) => {
                const isActive = v.id === selectedVenueId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVenueId(v.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex flex-col ${
                      isActive
                        ? 'bg-[#173B72] text-white shadow-xs'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                      {v.floor?.building?.name} • Floor {v.floor?.level}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Questions Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#173B72]" />
                <span>
                  Configured Integrity Questions for{' '}
                  {venues?.find((v: any) => v.id === selectedVenueId)?.name || 'Selected Venue'}
                </span>
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {questions?.length || 0} Questions configured
              </span>
            </div>

            {isLoadingQuestions ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading verification questions...</div>
            ) : !questions || questions.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-xl space-y-3">
                <ShieldAlert className="w-8 h-8 mx-auto text-amber-500" />
                <p>No integrity questions configured for this venue yet.</p>
                <button
                  onClick={openCreateModal}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure First Question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q: any, idx: number) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#173B72] bg-blue-50 px-2 py-0.5 rounded">
                          Question {idx + 1} • {q.assetType || 'GENERAL'}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-900 pt-1">{q.question}</h4>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 rounded-lg border bg-white hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'A', value: q.optionA },
                        { label: 'B', value: q.optionB },
                        { label: 'C', value: q.optionC },
                        { label: 'D', value: q.optionD },
                      ].map((opt) => {
                        const isCorrect = q.correctAnswer === opt.label;
                        return (
                          <div
                            key={opt.label}
                            className={`p-3 rounded-lg border transition-all ${
                              isCorrect
                                ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                          >
                            <span className="mr-1.5 font-bold">{opt.label})</span>
                            <span>{opt.value || '—'}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 inline ml-1.5" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expected Answer Meta */}
                    {q.expectedCount !== null && (
                      <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200/50">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Expected correct answer matches: <strong>Option {q.correctAnswer}</strong></span>
                        </span>
                        <span>Target Count: {q.expectedCount} {q.assetType}s</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 border animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingQuestion ? 'Edit Integrity Question' : 'Create New Integrity Question'}
              </h3>
              <button onClick={closeFormModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Question text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. How many total 4-seater tables are located in this room?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Asset Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Related Asset Type / Category
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
                  >
                    <option value="TABLE">TABLE</option>
                    <option value="CHAIR">CHAIR</option>
                    <option value="AC">AC</option>
                    <option value="ROUTER">ROUTER</option>
                    <option value="FAN">FAN</option>
                    <option value="LIGHT">LIGHT</option>
                    <option value="GENERAL">GENERAL / OTHER</option>
                  </select>
                </div>

                {/* Expected Count */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Expected Count (optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={expectedCount}
                    onChange={(e) => setExpectedCount(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Multiple Choice Options *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">Option A *</label>
                    <input
                      type="text"
                      required
                      placeholder="Answer option A"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">Option B *</label>
                    <input
                      type="text"
                      required
                      placeholder="Answer option B"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">Option C</label>
                    <input
                      type="text"
                      placeholder="Answer option C"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">Option D</label>
                    <input
                      type="text"
                      placeholder="Answer option D"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Correct Answer Select */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Correct Answer Choice *
                </label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#173B72] outline-hidden"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold rounded-lg shadow-sm"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 border">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-1.5">
                <Upload className="w-5 h-5 text-[#173B72]" />
                <span>Bulk Upload Integrity Questions</span>
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkUploadSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl space-y-1.5">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>JSON Array Formatting Guideline</span>
                </p>
                <p>Provide a valid JSON Array with questions configuration matching the format shown below. Clicking the <strong>"Load Sample Templates"</strong> button will pre-fill a high-quality schema for you.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Bulk JSON input
                  </label>
                  <button
                    type="button"
                    onClick={loadSampleQuestions}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold underline"
                  >
                    Load Sample Templates
                  </button>
                </div>
                <textarea
                  rows={10}
                  required
                  placeholder="Paste JSON array here..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 font-mono text-[11px] focus:ring-2 focus:ring-[#173B72] outline-hidden bg-gray-50/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkMutation.isPending}
                  className="px-5 py-2 bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold rounded-lg shadow-sm"
                >
                  {bulkMutation.isPending ? 'Uploading...' : 'Upload & Save Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
