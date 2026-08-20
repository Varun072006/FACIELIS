'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, ShieldCheck, History, User, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const { data: scores } = useQuery({
    queryKey: ['scores'],
    queryFn: () => fetch('/api/scores').then((res) => res.json()),
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetch('/api/audit-logs').then((res) => res.json()),
  });

  const latestScore = Array.isArray(scores) && scores.length > 0 ? scores[0] : null;

  const chartData = [
    { name: 'Housekeeping', score: latestScore ? latestScore.housekeepingScore : 98 },
    { name: 'Electrical', score: latestScore ? latestScore.electricalScore : 85 },
    { name: 'Plumbing', score: latestScore ? latestScore.plumbingScore : 90 },
    { name: 'Network', score: latestScore ? latestScore.networkScore : 92 },
    { name: 'Documentation', score: latestScore ? latestScore.documentationScore : 100 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Navbar title="Facility Assurance Analytics & Enterprise Audit Trail" />

      {/* Header */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Executive Operations & Compliance Ledger
          </span>
          <h2 className="text-xl font-extrabold mt-1">Multi-Level Score Analytics & Audit Trail</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Live compliance score breakdown and immutable change-log capturing system mutations, role approvals, technician routings, and certification events.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#173B72]" />
          <span>Category-Wise Facility Fitness Scores (%)</span>
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#173B72', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="score" fill="#173B72" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Immutable Enterprise Audit Trail Ledger */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#173B72]" />
            <span>Immutable Compliance & Activity Log (Audit Trail)</span>
          </h3>
          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {Array.isArray(auditLogs) ? auditLogs.length : 0} Events Recorded
          </span>
        </div>

        {loadingLogs ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading audit trail records...</div>
        ) : Array.isArray(auditLogs) && auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{log.user?.name || 'System Actor'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#173B72] font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{log.entityType}</td>
                    <td className="p-3 text-gray-700 max-w-xs truncate font-mono text-[11px]">
                      {log.detailsJson || '—'}
                    </td>
                    <td className="p-3 text-gray-400 font-mono text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">No activity log entries recorded yet.</div>
        )}
      </div>
    </div>
  );
}
