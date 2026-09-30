"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, ArrowLeft, Lock } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { role, login } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [authMode, setAuthMode] = useState<'selection' | 'citizen' | 'municipal'>('selection');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && role === 'citizen' && pathname !== '/citizen') {
      router.replace('/citizen');
    }
  }, [role, pathname, router, mounted]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'citizen' && password === '123') {
      login('citizen');
      router.push('/citizen');
    } else if (authMode === 'municipal' && password === 'admin') {
      login('municipal');
      router.push('/map');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]"></div>;

  if (role === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-4xl w-full text-center relative z-10 min-h-[500px] flex flex-col justify-center"
        >
          {authMode === 'selection' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 bg-white/5 border border-white/10">
                  <span className="text-xl">🛰️</span>
                  <span className="text-sm font-black tracking-widest text-teal-400 uppercase">VajraYield SWMS Login</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Select Your Access Portal</h1>
                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">Welcome to the Udupi Solid Waste Management ecosystem. Please select your role to proceed.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

                  {/* Citizen Login */}
                  <button
                    onClick={() => { setAuthMode('citizen'); setError(''); setPassword(''); }}
                    className="group flex flex-col items-center justify-center p-10 bg-slate-900/50 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-3xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Users className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Citizen</h2>
                    <p className="text-slate-400 font-medium">Report issues, earn points, and track community cleanup.</p>
                  </button>

                  {/* Municipal Login */}
                  <button
                    onClick={() => { setAuthMode('municipal'); setError(''); setPassword(''); }}
                    className="group flex flex-col items-center justify-center p-10 bg-slate-900/50 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-3xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)] hover:-translate-y-2 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
                    <div className="w-20 h-20 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Municipal Admin</h2>
                    <p className="text-slate-400 font-medium">Access 3D digital twin, route optimization, and SWM 2026 prescriptive simulation.</p>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="password-entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-md mx-auto w-full relative"
              >
                <button
                  onClick={() => setAuthMode('selection')}
                  className="absolute -top-16 -left-4 md:-left-16 text-slate-400 hover:text-white transition-colors flex items-center gap-2 p-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner ${authMode === 'citizen' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-teal-500/10 text-teal-400'
                  }`}>
                  {authMode === 'citizen' ? <Users className="w-10 h-10" /> : <Building2 className="w-10 h-10" />}
                </div>

                <h2 className="text-3xl font-black text-white mb-2">
                  {authMode === 'citizen' ? 'Citizen Login' : 'Admin Login'}
                </h2>
                <p className="text-slate-400 mb-8">
                  {authMode === 'citizen' ? 'Enter password (default: 123)' : 'Enter password (default: admin)'}
                </p>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full bg-slate-900 border rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none transition-all ${authMode === 'citizen'
                        ? 'border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                        }`}
                    />
                  </div>

                  {error && <p className="text-rose-400 text-sm font-medium text-left ml-2">{error}</p>}

                  <button
                    type="submit"
                    className={`w-full font-black text-lg py-3 rounded-xl transition-all shadow-lg text-slate-950 ${authMode === 'citizen'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-r from-teal-500 to-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                      }`}
                  >
                    Login
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
