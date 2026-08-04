'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const { data: scores } = useQuery({
    queryKey: ['scores'],
    queryFn: () => fetch('/api/scores').then((res) => res.json()),
  });

  const chartData = [
    { name: 'Housekeeping', score: 98 },
    { name: 'Electrical', score: 85 },
    { name: 'Plumbing', score: 90 },
    { name: 'Network', score: 92 },
    { name: 'Documentation', score: 100 },
  ];

  return (
    <div className="space-y-6">
      <Navbar title="Facility Assurance Analytics & Reports" />

      {/* Header */}
      <div className="bg-[#173B72] text-white p-6 rounded-2xl shadow-md">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-blue-200">
          Executive Operations Report
        </span>
        <h2 className="text-xl font-extrabold mt-1">Multi-Level Score Analytics</h2>
        <p className="text-xs text-blue-100 mt-1 max-w-xl">
          Visualizing facility scores across Housekeeping, Electrical, Plumbing, Network, and Documentation categories for BIT-Sathy Learning Center.
        </p>
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
    </div>
  );
}
