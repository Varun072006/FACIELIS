'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Sliders, Plus, ShieldCheck, Clock, Layers } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <Navbar title="Deterministic Rule Engine Configurator" />

      {/* Header Banner */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Rule First Philosophy
          </span>
          <h2 className="text-xl font-extrabold mt-1">Rule Configuration Engine</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Configure strict deterministic rules to map component failures to Category, Priority, Severity, Department, and SLA response time without relying on unverified heuristics.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white text-[#173B72] font-bold text-xs hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#173B72]" />
            <span>Active Deterministic Rules</span>
          </h3>
          <span className="text-xs text-gray-500">Auto-evaluated on inspection submit</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading rules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Component Target</th>
                  <th className="p-3">Keyword Trigger</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">SLA Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules?.map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-gray-900">{rule.componentType}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                        {rule.keywordMatch || 'Any Failure'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{rule.category}</td>
                    <td className="p-3 font-bold text-[#173B72]">{rule.priority}</td>
                    <td className="p-3">
                      <StatusBadge status={rule.severity} />
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{rule.departmentName}</td>
                    <td className="p-3 text-gray-600 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{rule.slaHours} Hours</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Create New Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Component Target Name</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Socket Ports"
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. burn, spark, discoloration"
                  value={keywordMatch}
                  onChange={(e) => setKeywordMatch(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-lg">
                    <option value="Electrical">Electrical</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Network">Network</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <select value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full p-2.5 border rounded-lg">
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
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2.5 border rounded-lg">
                    <option value="P1">P1 (Highest)</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Severity</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full p-2.5 border rounded-lg">
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SLA (Hours)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B72] text-white font-bold"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
