"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, ArrowLeft, Lock, ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';

const isPublicRoute = (path: string) => path === '/' || path === '/methodology' || path === '/api-status';
const isCitizenRoute = (path: string) => path.startsWith('/citizen');
const isAdminRoute = (path: string) => !isPublicRoute(path) && !isCitizenRoute(path);

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { role, login, isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route guarding logic
  useEffect(() => {
    if (!mounted) return;

    if (role === 'municipal') {
      // Municipal admin cannot access citizen portal
      if (isCitizenRoute(pathname)) {
        router.replace('/dashboard');
      }
    } else if (role === 'citizen') {
      // Citizen cannot access internal admin routes
      if (isAdminRoute(pathname)) {
        router.replace('/citizen');
      }
    } else {
      // role === null (unauthenticated)
      // If trying to access protected routes directly, redirect to '/' and trigger modal
      if (!isPublicRoute(pathname)) {
        openAuthModal(isCitizenRoute(pathname) ? 'citizen' : 'selection');
        router.replace('/');
      }
    }
  }, [role, pathname, router, mounted, openAuthModal]);

  const handleClose = useCallback(() => {
    closeAuthModal();
    setPassword('');
    setError('');
  }, [closeAuthModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, handleClose]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'citizen' && password === '123') {
      login('citizen');
      handleClose();
      router.push('/citizen');
    } else if (authModalMode === 'municipal' && password === 'admin') {
      login('municipal');
      handleClose();
      router.push('/dashboard');
    } else {
      setError('Invalid password. Please check your credentials and try again.');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <>
      {children}

      {/* High-End Dark Theme Civic/Admin Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0A101E] border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.08)] p-8 sm:p-10 rounded-3xl max-w-lg w-full text-center relative z-10 my-8 overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1), transparent 75%)',
              }}
            >
              {/* Subtle Ambient Top Border Glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {authModalMode === 'selection' ? (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Udupi CMC · Solid Waste Network</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    Select Access Portal
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mb-7 max-w-sm mx-auto leading-relaxed">
                    Choose your role to access the citizen public grievance portal or the municipal digital twin.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {/* Citizen Card */}
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal('citizen');
                        setError('');
                        setPassword('');
                      }}
                      className="group flex flex-col justify-between p-5 bg-[#0D1528]/80 hover:bg-[#111C35] border border-slate-800 hover:border-emerald-500/60 rounded-2xl transition-all shadow-md hover:shadow-emerald-500/10 cursor-pointer text-left"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Citizen Portal
                        </h4>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                          Report blackspots, track tickets &amp; check segregation rules.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-bold text-emerald-400 gap-1">
                        <span>Continue as Citizen</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </button>

                    {/* Municipal Admin Card */}
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal('municipal');
                        setError('');
                        setPassword('');
                      }}
                      className="group flex flex-col justify-between p-5 bg-[#0D1528]/80 hover:bg-[#111C35] border border-slate-800 hover:border-teal-500/60 rounded-2xl transition-all shadow-md hover:shadow-teal-500/10 cursor-pointer text-left"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                          Municipal Admin
                        </h4>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                          Command center, 3D digital twin, route optimizer &amp; telemetry.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-bold text-teal-400 gap-1">
                        <span>Command Center</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-entry"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="w-full text-center"
                >
                  <div className="flex items-center justify-start mb-5">
                    <button
                      type="button"
                      onClick={() => openAuthModal('selection')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to role selection</span>
                    </button>
                  </div>

                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(0,0,0,0.5)] ${
                      authModalMode === 'citizen'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                    }`}
                  >
                    {authModalMode === 'citizen' ? <Users className="w-7 h-7" /> : <Building2 className="w-7 h-7" />}
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight mb-1.5">
                    {authModalMode === 'citizen' ? 'Citizen Portal Access' : 'Municipal Command Login'}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-slate-400 text-xs">Enter authorization key</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700">
                      Default: {authModalMode === 'citizen' ? '123' : 'admin'}
                    </span>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Passcode
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          autoFocus
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Enter passcode"
                          className="w-full bg-[#070D18] hover:bg-[#091120] focus:bg-[#091120] border border-slate-700 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={`w-full font-black text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer ${
                        authModalMode === 'citizen'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 shadow-teal-500/20'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Proceed to {authModalMode === 'citizen' ? 'Citizen Portal' : 'Command Center'}</span>
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Udupi CMC Solid Waste Management Statutory Ecosystem</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}