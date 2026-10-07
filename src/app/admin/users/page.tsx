'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Users, Mail, Building, Shield, Filter, Search } from 'lucide-react';

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () =>
      fetch(roleFilter === 'ALL' ? '/api/users' : `/api/users?role=${roleFilter}`).then((res) => res.json()),
  });

  const userList = Array.isArray(users) ? users : [];
  const filteredUsers = userList.filter((u: any) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.department?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <Navbar title="User & Role Management" />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Access Control
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">RBAC Identity Management</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Users & Role Directory</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Directory of personnel across Super Admin, Facility Manager, Venue Owner, Auditor, and Technician roles.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0">
          <Users className="w-4 h-4 text-primary" />
          <span>{filteredUsers.length} Active Accounts</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
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

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users found matching current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="py-2.5">User Name</TableHead>
                  <TableHead className="py-2.5">Email Address</TableHead>
                  <TableHead className="py-2.5">Assigned Role</TableHead>
                  <TableHead className="py-2.5">Department</TableHead>
                  <TableHead className="py-2.5">Building / Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                    <TableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-[11px]">{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide ${
                          u.role === 'OWNER'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">{u.department?.name || 'General'}</TableCell>
                    <TableCell className="text-slate-600">
                      {u.role === 'OWNER' ? 'Right Cabin (Cabin 3)' : u.building?.name || 'Learning Center'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
