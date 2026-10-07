'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ArrowRight, Lock, Mail, ShieldCheck, UserCheck, Wrench, ClipboardList, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@facielis.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const handleLoginWithEmail = useCallback(async (loginEmail: string) => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: 'password123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [login]);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.role === 'SUPER_ADMIN') router.push('/admin');
      else if (user.role === 'MANAGER') router.push('/manager');
      else if (user.role === 'AUDITOR') router.push('/auditor');
      else if (user.role === 'TECHNICIAN') router.push('/technician');
      else if (user.role === 'OWNER') router.push('/owner');
      return;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auto = params.get('auto');
      const role = params.get('role');

      const recentlyLoggedOut = window.sessionStorage.getItem('recently_logged_out');
      if (recentlyLoggedOut === 'true') {
        window.sessionStorage.removeItem('recently_logged_out');
        return;
      }

      if (auto === 'true') {
        let targetEmail = 'admin@facielis.com';
        if (role === 'manager') targetEmail = 'manager@facielis.com';
        else if (role === 'auditor') targetEmail = 'auditor1@facielis.com';
        else if (role === 'technician') targetEmail = 'tech.elec@facielis.com';
        else if (role === 'owner') targetEmail = 'owner@facielis.com';

        setEmail(targetEmail);
        handleLoginWithEmail(targetEmail);
      }
    }
  }, [user, loading, router, handleLoginWithEmail]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginWithEmail(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Brand Header */}
        <div className="bg-[#173B72] px-6 py-7 text-white text-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white mx-auto flex items-center justify-center font-bold text-lg mb-2.5 shadow-2xs">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight">FACIELIS</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold mt-0.5">
            Facility Assurance Platform
          </p>
          <p className="text-xs text-blue-100/80 italic mt-1.5">
            "Where Facilities Earn Trust"
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-[#173B72] focus:border-[#173B72] outline-hidden transition-all"
                  placeholder="name@facielis.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-[#173B72] focus:border-[#173B72] outline-hidden transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white font-semibold text-xs transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 group disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@facielis.com');
                  handleLoginWithEmail('admin@facielis.com');
                }}
                className="px-2.5 py-2 rounded-lg border border-slate-200 hover:border-[#173B72] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#173B72]" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@facielis.com');
                  handleLoginWithEmail('manager@facielis.com');
                }}
                className="px-2.5 py-2 rounded-lg border border-slate-200 hover:border-[#173B72] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Facility Manager</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('owner@facielis.com');
                  handleLoginWithEmail('owner@facielis.com');
                }}
                className="col-span-2 px-2.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-xs font-bold text-emerald-900 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Venue Owner (Dr. Ananth)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('auditor1@facielis.com');
                  handleLoginWithEmail('auditor1@facielis.com');
                }}
                className="px-2.5 py-2 rounded-lg border border-slate-200 hover:border-[#173B72] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5 text-indigo-700" />
                <span>Auditor (Ramesh)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('tech.elec@facielis.com');
                  handleLoginWithEmail('tech.elec@facielis.com');
                }}
                className="px-2.5 py-2 rounded-lg border border-slate-200 hover:border-[#173B72] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-700" />
                <span>Technician (Selvam)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Bannari Amman Institute of Technology (BIT-Sathy)
          </p>
        </div>
      </div>
    </div>
  );
}
