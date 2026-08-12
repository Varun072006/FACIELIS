'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, X } from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: 'DEFECT' | 'ASSIGNMENT' | 'REPAIR' | 'CERTIFICATE' | 'AUDIT' | 'OWNER_DEFECT';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server on port 5000
    const socket: Socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('📡 Connected to FACIELIS Real-Time Notification Socket:', socket.id);
      socket.emit('join_rooms', {
        userId: user.id,
        role: user.role,
        venueId: user.venueId,
      });
    });

    socket.on('notification:new', (data: any) => {
      console.log('🔔 Live Notification Received:', data);
      const newNotif: AppNotification = {
        id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: data.title || 'Platform Notification',
        message: data.message || '',
        type: data.type || 'DEFECT',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToast(newNotif);

      // Auto-hide toast popup after 5 seconds
      setTimeout(() => {
        setToast((current) => (current?.id === newNotif.id ? null : current));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}

      {/* Floating Real-Time Toast Notification Popup */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-gray-700 animate-slide-in flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-white">{toast.title}</h4>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-tight">{toast.message}</p>
              <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                {new Date(toast.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
              </span>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
