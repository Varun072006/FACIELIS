'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNotifications, AppNotification } from '@/providers/notification-provider';
import {
  Bell,
  Search,
  Trash2,
  Sparkles,
  AlertTriangle,
  Wrench,
  Award,
  ClipboardList,
} from 'lucide-react';

type NotificationTab = 'ALL' | 'DEFECTS' | 'DISPATCHES' | 'CERTIFICATES';

export function Navbar({ title }: { title?: string }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('ALL');

  // Categorize notifications
  const defectNotifs = notifications.filter(
    (n) => n.type === 'DEFECT' || n.type === 'OWNER_DEFECT'
  );
  const dispatchNotifs = notifications.filter(
    (n) => n.type === 'ASSIGNMENT' || n.type === 'REPAIR' || n.type === 'AUDIT'
  );
  const certNotifs = notifications.filter(
    (n) => n.type === 'CERTIFICATE'
  );

  const getUnreadCount = (list: AppNotification[]) => list.filter((n) => !n.read).length;

  const filteredNotifications = (() => {
    switch (activeTab) {
      case 'DEFECTS':
        return defectNotifs;
      case 'DISPATCHES':
        return dispatchNotifs;
      case 'CERTIFICATES':
        return certNotifs;
      case 'ALL':
      default:
        return notifications;
    }
  })();

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'DEFECT':
      case 'OWNER_DEFECT':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'ASSIGNMENT':
      case 'REPAIR':
        return <Wrench className="w-3.5 h-3.5 text-indigo-600" />;
      case 'AUDIT':
        return <ClipboardList className="w-3.5 h-3.5 text-blue-600" />;
      case 'CERTIFICATE':
        return <Award className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#173B72]" />;
    }
  };

  return (
    <header className="h-13 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
          {title || 'Dashboard'}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue, defect, asset..."
            className="pl-8 pr-12 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:outline-hidden focus:bg-white focus:border-[#173B72] focus:ring-1 focus:ring-[#173B72] w-48 lg:w-56 transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>

        {/* Live Engine Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Engine</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) markAllAsRead();
            }}
            className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none"
            title="Live Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Categorized Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#173B72]" />
                  <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                      title="Clear All"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 font-bold p-0.5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-slate-100 bg-slate-50/40 px-2 pt-1 gap-1 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-2.5 py-1 rounded-t-md font-semibold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'ALL'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>All</span>
                  <span className="text-[9px] px-1 rounded-full bg-slate-200 font-mono">
                    {notifications.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('DEFECTS')}
                  className={`px-2 py-1 rounded-t-md font-semibold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'DEFECTS'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Defects</span>
                  {defectNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(defectNotifs) > 0 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-200'}`}>
                      {defectNotifs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('DISPATCHES')}
                  className={`px-2 py-1 rounded-t-md font-semibold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'DISPATCHES'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Dispatches</span>
                  {dispatchNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(dispatchNotifs) > 0 ? 'bg-indigo-100 text-indigo-800 font-bold' : 'bg-slate-200'}`}>
                      {dispatchNotifs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('CERTIFICATES')}
                  className={`px-2 py-1 rounded-t-md font-semibold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'CERTIFICATES'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Certs</span>
                  {certNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(certNotifs) > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200'}`}>
                      {certNotifs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} alerts recorded.
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5 ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-slate-100">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <strong className="font-semibold text-slate-900 text-xs truncate">
                            {n.title}
                          </strong>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold cursor-default">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none capitalize">
              {user?.department || user?.role?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
