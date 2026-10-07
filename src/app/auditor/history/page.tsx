'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

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
          a.auditNo?.toLowerCase().includes(search.toLowerCase()) ||
          a.venue?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="space-y-5 pb-16">
      <Navbar title="Audit History & Verification Ledger" />

      {/* Header Info Strip */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#173B72] border border-blue-200/80 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Ledger
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
            Audit History & Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent operational record of all completed facility audits with date, time, and geo-tagged proof.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
          <ClipboardList className="w-4 h-4 text-[#173B72]" />
          <span>{filteredAudits.length} Records</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by audit no or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:outline-hidden focus:bg-white focus:border-[#173B72] focus:ring-1 focus:ring-[#173B72]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'COMPLETED', 'IN_PROGRESS', 'VERIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#173B72] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit History Bento Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : filteredAudits.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Audit History Found"
          description="No historical audits match your current search and status filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
              ? new Date(audit.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'In Progress';

            return (
              <div
                key={audit.id}
                className="bento-card p-4.5 flex flex-col justify-between space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-mono font-bold text-xs text-[#173B72]">{audit.auditNo}</span>
                    <StatusBadge status={audit.status} size="sm" />
                  </div>

                  <div className="mt-2.5 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#173B72] shrink-0" />
                      <span>{audit.venue?.name || 'Right Cabin'}</span>
                    </h3>

                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Date: <strong className="text-slate-800">{formattedDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Time: <strong className="text-slate-800">{formattedTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Status: {completedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-slate-400 block text-[10px]">Inspected Items</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {audit.inspectionItems?.length || 0} Components
                    </span>
                  </div>

                  <Link
                    href={`/auditor/summary/${audit.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[#173B72] hover:bg-slate-200/80 font-semibold text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Summary</span>
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
