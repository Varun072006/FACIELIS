'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@facielis.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLoginWithEmail = async (loginEmail: string) => {
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
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginWithEmail(email);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#173B72] p-8 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-white mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-inner">
            F
          </div>
          <h1 className="text-2xl font-black tracking-tight">FACIELIS</h1>
          <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mt-1">Facility Assurance Platform</p>
          <p className="text-xs text-blue-100/80 font-serif italic mt-2">"Where Facilities Earn Trust"</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#173B72] focus:border-transparent outline-hidden"
                  placeholder="name@facielis.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#173B72] focus:border-transparent outline-hidden"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#173B72] hover:bg-[#1e4a8e] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Role Quick Selector */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase text-center mb-3">1-Click Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@facielis.com');
                  handleLoginWithEmail('admin@facielis.com');
                }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-[#173B72]/10 text-xs font-bold text-[#173B72] transition-all shadow-2xs text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@facielis.com');
                  handleLoginWithEmail('manager@facielis.com');
                }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-[#173B72]/10 text-xs font-bold text-[#173B72] transition-all shadow-2xs text-center"
              >
                Facility Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('auditor1@facielis.com');
                  handleLoginWithEmail('auditor1@facielis.com');
                }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-[#173B72]/10 text-xs font-bold text-[#173B72] transition-all shadow-2xs text-center"
              >
                Auditor (Ramesh)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('tech.elec@facielis.com');
                  handleLoginWithEmail('tech.elec@facielis.com');
                }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#173B72] hover:bg-[#173B72]/10 text-xs font-bold text-[#173B72] transition-all shadow-2xs text-center"
              >
                Technician (Selvam)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">Bannari Amman Institute of Technology (BIT-Sathy)</p>
        </div>
      </div>
    </div>
  );
}
