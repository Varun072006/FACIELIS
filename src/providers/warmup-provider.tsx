'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

const CORE_ENDPOINTS = [
  { key: ['defects'], url: '/api/defects' },
  { key: ['audits'], url: '/api/audits' },
  { key: ['facilities'], url: '/api/facilities' },
  { key: ['users'], url: '/api/users' },
  { key: ['assets'], url: '/api/assets' },
  { key: ['certificates'], url: '/api/certificates' },
  { key: ['scores'], url: '/api/scores' },
  { key: ['departments'], url: '/api/departments' },
  { key: ['venues'], url: '/api/venues' },
  { key: ['rules'], url: '/api/rules' },
];

const PORTAL_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/assets',
  '/admin/facilities',
  '/admin/rules',
  '/admin/departments',
  '/admin/certificates',
  '/admin/cross-audit-questions',
  '/manager',
  '/manager/defects',
  '/manager/audit-schedule',
  '/manager/repair-approvals',
  '/manager/reports',
  '/manager/sla',
  '/manager/certificates',
  '/manager/assignments',
  '/auditor',
  '/auditor/history',
  '/technician',
  '/technician/history',
];

export function WarmupProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Stagger pre-warming after main thread UI renders
    const timer = setTimeout(() => {
      // 1. Prefetch core API endpoints into React Query cache
      CORE_ENDPOINTS.forEach(({ key, url }, index) => {
        setTimeout(() => {
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: async () => {
              const res = await fetch(url);
              if (!res.ok) throw new Error(`Failed fetching ${url}`);
              return res.json();
            },
            staleTime: 10 * 60 * 1000,
          });
        }, index * 50);
      });

      // 2. Prefetch Next.js route bundles in background
      PORTAL_ROUTES.forEach((route) => {
        try {
          router.prefetch(route);
        } catch (e) {
          // ignore prefetch errors
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [user, queryClient, router]);

  return <>{children}</>;
}
