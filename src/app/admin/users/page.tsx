'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Users, Mail, Building, Shield } from 'lucide-react';

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="User & Role Management" />

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#173B72]" />
            <span>Platform Users & Technicians</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Building</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-gray-600 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#173B72]/10 text-[#173B72] font-bold">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">{u.department?.name || 'N/A'}</td>
                    <td className="p-3 text-gray-600">{u.building?.name || 'Learning Center'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
