'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNotifications, AppNotification } from '@/providers/notification-provider';
import {
  Bell,
  CheckCircle2,
  Search,
  Trash2,
  Sparkles,
  AlertTriangle,
  Wrench,
  Award,
  ClipboardList,
  Check,
  Filter,
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
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'ASSIGNMENT':
      case 'REPAIR':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'AUDIT':
        return <ClipboardList className="w-4 h-4 text-blue-600" />;
      case 'CERTIFICATE':
        return <Award className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#173B72]" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight truncate">
          {title || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue, defect, asset..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#173B72] w-56 lg:w-64 transition-all"
          />
        </div>

        {/* Real-time Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Engine</span>
        </div>

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) markAllAsRead();
            }}
            className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none"
            title="Live Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Categorized Notifications Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden space-y-0 animate-slide-in">
              {/* Header */}
              <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#173B72]" />
                  <h3 className="font-extrabold text-xs text-gray-900">Platform Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-gray-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                      title="Clear All Notifications"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-xs text-gray-400 hover:text-gray-700 font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-2 pt-1 gap-1 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1.5 rounded-t-lg font-bold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'ALL'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>All</span>
                  <span className="text-[9px] px-1 rounded-full bg-gray-200/80 font-mono">
                    {notifications.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('DEFECTS')}
                  className={`px-2.5 py-1.5 rounded-t-lg font-bold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'DEFECTS'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Defects</span>
                  {defectNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(defectNotifs) > 0 ? 'bg-red-100 text-red-800 font-black' : 'bg-gray-200/80'}`}>
                      {defectNotifs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('DISPATCHES')}
                  className={`px-2.5 py-1.5 rounded-t-lg font-bold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'DISPATCHES'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Dispatches</span>
                  {dispatchNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(dispatchNotifs) > 0 ? 'bg-blue-100 text-blue-800 font-black' : 'bg-gray-200/80'}`}>
                      {dispatchNotifs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('CERTIFICATES')}
                  className={`px-2.5 py-1.5 rounded-t-lg font-bold transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'CERTIFICATES'
                      ? 'border-[#173B72] text-[#173B72] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Certs</span>
                  {certNotifs.length > 0 && (
                    <span className={`text-[9px] px-1 rounded-full font-mono ${getUnreadCount(certNotifs) > 0 ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-gray-200/80'}`}>
                      {certNotifs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 font-medium">
                    No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} alerts recorded. Real-time dispatches will appear here automatically.
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-gray-50/80 transition-colors space-y-1 flex items-start gap-2.5 ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-gray-100/80">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <strong className="font-extrabold text-gray-900 text-xs truncate">
                            {n.title}
                          </strong>
                          <span className="text-[9px] font-mono text-gray-400 shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-snug mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold shadow-2xs cursor-default">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-none capitalize">
              {user?.department || user?.role?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
