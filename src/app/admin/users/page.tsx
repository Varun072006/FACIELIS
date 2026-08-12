'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Users, Mail, Building, Shield, Filter } from 'lucide-react';

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () =>
      fetch(roleFilter === 'ALL' ? '/api/users' : `/api/users?role=${roleFilter}`).then((res) => res.json()),
  });

  return (
    <div className="space-y-6">
      <Navbar title="User & Role Management" />

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#173B72]" />
            <span>Platform Users & Roles Registry</span>
          </h3>

          <div className="flex items-center gap-2 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-1.5 border rounded-lg bg-gray-50 text-xs font-bold text-gray-800"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="OWNER">Venue Owner</option>
              <option value="AUDITOR">Auditor</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
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
                  <th className="p-3">Building / Venue</th>
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
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          u.role === 'OWNER'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-[#173B72]/10 text-[#173B72]'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">{u.department?.name || 'N/A'}</td>
                    <td className="p-3 text-gray-600">
                      {u.role === 'OWNER' ? 'Right Cabin (Cabin 3)' : u.building?.name || 'Learning Center'}
                    </td>
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
