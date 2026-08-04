'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { ClipboardList, Calendar, Clock, MapPin, Eye, CheckCircle2, ShieldCheck, Search, Filter } from 'lucide-react';

export default function AuditorHistoryPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: audits, isLoading } = useQuery({
    queryKey: ['auditor-history'],
    queryFn: () => fetch('/api/audits').then((res) => res.json()),
  });

  const filteredAudits = Array.isArray(audits)
    ? audits.filter((a: any) => {
        const matchesSearch =
          a.auditNo.toLowerCase().includes(search.toLowerCase()) ||
          a.venue?.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="space-y-6">
      <Navbar title="Auditing History & Past Records" />

      {/* Header Info */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Historical Audit Ledger
          </span>
          <h2 className="text-xl font-extrabold mt-1">Audit History & Logs</h2>
          <p className="text-xs text-blue-100 mt-0.5">Permanent operational record of all completed facility audits with date & timestamp</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Geo-Tagged & Verified Records</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by audit no or venue name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#173B72] outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          {['ALL', 'COMPLETED', 'IN_PROGRESS', 'VERIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-[#173B72] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit History Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-500">Loading audit history...</div>
      ) : filteredAudits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500">
          No audit history records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAudits.map((audit: any) => {
            const formattedDate = new Date(audit.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = new Date(audit.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const completedDate = audit.completedAt
              ? new Date(audit.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                ' at ' +
                new Date(audit.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : 'In Progress';

            return (
              <div
                key={audit.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                    <StatusBadge status={audit.status} />
                  </div>

                  <div className="mt-3 space-y-2">
                    <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#173B72]" />
                      <span>{audit.venue?.name || 'Right Cabin'}</span>
                    </h3>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Audit Date: <strong className="text-gray-800">{formattedDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Audit Time: <strong className="text-gray-800">{formattedTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Completed: {completedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-gray-400 block">Inspected Items</span>
                    <span className="font-extrabold text-gray-900">{audit.inspectionItems?.length || 0} Components</span>
                  </div>

                  <Link
                    href={`/auditor/summary/${audit.id}`}
                    className="px-3.5 py-2 rounded-lg bg-blue-50 text-[#173B72] hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Summary Report</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
