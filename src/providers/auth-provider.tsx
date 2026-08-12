'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'AUDITOR' | 'TECHNICIAN' | 'OWNER';
  department?: string;
  departmentId?: string;
  venueId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read cache on mount
    try {
      const cached = window.sessionStorage.getItem('facielis_cached_user');
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      // ignore JSON parse error
    }

    let active = true;
    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('facielis_cached_user', JSON.stringify(data.user));
          }
        } else {
          setUser(null);
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('facielis_cached_user');
          }
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (err) {
        if (active) {
          setUser(null);
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('facielis_cached_user');
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verifyAuth();

    return () => {
      active = false;
    };
  }, []); // Run once on initial mount

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, user, loading, router]);

  const login = (token: string, userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('facielis_cached_user', JSON.stringify(userData));
      window.sessionStorage.removeItem('recently_logged_out');
    }
    if (userData.role === 'SUPER_ADMIN') router.push('/admin');
    else if (userData.role === 'MANAGER') router.push('/manager');
    else if (userData.role === 'AUDITOR') router.push('/auditor');
    else if (userData.role === 'TECHNICIAN') router.push('/technician');
    else if (userData.role === 'OWNER') router.push('/owner');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('recently_logged_out', 'true');
      window.sessionStorage.removeItem('facielis_cached_user');
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
