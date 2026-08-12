'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNotifications } from '@/providers/notification-provider';
import { Bell, ShieldAlert, CheckCircle2, Search, Trash2, Check, Sparkles } from 'lucide-react';

export function Navbar({ title }: { title?: string }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

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
          <span>Real-Time Engine Active</span>
        </div>

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) markAllAsRead();
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Live Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden space-y-2">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#173B72]" />
                  <h3 className="font-extrabold text-xs text-gray-900">Real-Time Dispatches & Alerts</h3>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] text-gray-500 hover:text-red-600 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 font-medium">
                    No live alerts. Real-time updates will appear here automatically!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-gray-50 transition-colors space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-gray-900 text-xs">{n.title}</strong>
                        <span className="text-[9px] font-mono text-gray-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-none">{user?.department || user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
