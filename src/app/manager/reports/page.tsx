'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { BarChart3, ShieldCheck, History, User, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const { data: scores } = useQuery({
    queryKey: ['scores'],
    queryFn: () => fetch('/api/scores').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetch('/api/audit-logs').then((res) => res.json()),
    placeholderData: (previousData) => previousData,
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
    <div className="space-y-6 pb-16">
      <Navbar title="Facility Assurance Analytics & Enterprise Audit Trail" />

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Analytics & Compliance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Immutable Audit Trail</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Facility Analytics & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live compliance score breakdown and immutable change-log capturing system mutations, role approvals, technician routings, and certification events.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Category-Wise Facility Fitness Scores (%)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">Benchmark: 80% Min</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="score" fill="#173B72" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Immutable Enterprise Audit Trail Ledger */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Immutable Compliance & Activity Log (Audit Trail)</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            {Array.isArray(auditLogs) ? auditLogs.length : 0} Events Recorded
          </span>
        </div>

        {loadingLogs ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit trail records...</div>
        ) : Array.isArray(auditLogs) && auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="py-2.5">Timestamp</TableHead>
                  <TableHead className="py-2.5">Actor / User</TableHead>
                  <TableHead className="py-2.5">Action Event</TableHead>
                  <TableHead className="py-2.5">Entity Type</TableHead>
                  <TableHead className="py-2.5">Details</TableHead>
                  <TableHead className="py-2.5">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                    <TableCell className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user?.name || 'System Actor'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{log.entityType}</TableCell>
                    <TableCell className="text-slate-700 max-w-xs truncate font-mono text-[11px]">
                      {log.detailsJson || '—'}
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">No activity log entries recorded yet.</div>
        )}
      </div>
    </div>
  );
}
