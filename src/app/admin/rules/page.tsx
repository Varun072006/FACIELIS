'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Sliders, Plus, ShieldCheck, Clock, Layers, X, CheckCircle2 } from 'lucide-react';

export default function RulesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [componentType, setComponentType] = useState('');
  const [keywordMatch, setKeywordMatch] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [priority, setPriority] = useState('P1');
  const [severity, setSeverity] = useState('CRITICAL');
  const [departmentName, setDepartmentName] = useState('Electrical');
  const [slaHours, setSlaHours] = useState(2);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => fetch('/api/rules').then((res) => res.json()),
  });

  const createRuleMutation = useMutation({
    mutationFn: async (newRule: any) => {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });
      if (!res.ok) throw new Error('Failed to create rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setShowModal(false);
      setComponentType('');
      setKeywordMatch('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRuleMutation.mutate({
      componentType,
      keywordMatch,
      category,
      priority,
      severity,
      departmentName,
      slaHours: Number(slaHours),
    });
  };

  const ruleList = Array.isArray(rules) ? rules : [];

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="Deterministic Rule Engine Configurator" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Automation Core
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Deterministic Rule Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Defect Evaluation Rules Engine</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Configure strict deterministic mappings for component failures to Category, Priority, Severity, Department, and SLA response times.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Active Deterministic Rules</span>
          </h3>
          <span className="text-xs text-slate-500">Auto-evaluated on inspection submission</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading evaluation rules...</div>
        ) : ruleList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active rules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="py-2.5">Component Target</TableHead>
                  <TableHead className="py-2.5">Keyword Trigger</TableHead>
                  <TableHead className="py-2.5">Category</TableHead>
                  <TableHead className="py-2.5">Priority</TableHead>
                  <TableHead className="py-2.5">Severity</TableHead>
                  <TableHead className="py-2.5">Department</TableHead>
                  <TableHead className="py-2.5">SLA Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleList.map((rule: any) => (
                  <TableRow key={rule.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                    <TableCell className="font-semibold text-slate-900">{rule.componentType}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {rule.keywordMatch || 'Any Failure'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{rule.category}</TableCell>
                    <TableCell className="font-bold text-primary">{rule.priority}</TableCell>
                    <TableCell>
                      <StatusBadge status={rule.severity} />
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{rule.departmentName}</TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rule.slaHours} Hours</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Create New Deterministic Rule</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Component Target Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Socket Ports"
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. burn, spark, discoloration"
                  value={keywordMatch}
                  onChange={(e) => setKeywordMatch(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Network">Network</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Network">Network</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                  >
                    <option value="P1">P1 (Highest)</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SLA (Hours)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRuleMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{createRuleMutation.isPending ? 'Saving...' : 'Save Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
