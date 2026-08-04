'use client';

import { useAuth } from '@/providers/auth-provider';
import { Bell, ShieldAlert, CheckCircle2, Search } from 'lucide-react';

export function Navbar({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue, defect, asset..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 focus:outline-hidden focus:ring-1 focus:ring-[#173B72] w-64"
          />
        </div>

        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Rule Engine Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-none">{user?.department || user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
