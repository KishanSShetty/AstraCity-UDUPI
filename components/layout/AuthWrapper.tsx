"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { role, login } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && role === 'citizen' && pathname !== '/citizen') {
      router.replace('/citizen');
    }
    if (mounted && role === 'municipal' && pathname === '/citizen') {
      // Municipal admins can see everything, but let's say they want to see the main app by default if they try to access citizen portal directly
      // Optional: router.replace('/');
    }
  }, [role, pathname, router, mounted]);

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
          className="bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-4xl w-full text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 bg-white/5 border border-white/10">
            <span className="text-xl">🛰️</span>
            <span className="text-sm font-black tracking-widest text-teal-400 uppercase">AstraCity Login</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Select Your Access Portal</h1>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">Welcome to the Udupi Solid Waste Management ecosystem. Please select your role to proceed.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            
            {/* Citizen Login */}
            <button 
              onClick={() => { login('citizen'); router.push('/citizen'); }}
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
              onClick={() => { login('municipal'); router.push('/map'); }}
              className="group flex flex-col items-center justify-center p-10 bg-slate-900/50 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-3xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)] hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
              <div className="w-20 h-20 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Municipal Admin</h2>
              <p className="text-slate-400 font-medium">Access maps, route optimization, and live simulation data.</p>
            </button>

          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
