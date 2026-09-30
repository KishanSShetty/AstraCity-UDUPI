'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/');
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-emerald-400">
            Vajra<span className="text-white">Yield</span>
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
            Udupi SWM 2026
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-6 text-sm font-semibold text-slate-300">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <Link href="/map" className="hover:text-emerald-400 transition-colors">Map</Link>
        <Link href="/simulation" className="hover:text-emerald-400 transition-colors">Simulation</Link>
        <Link href="/routes" className="hover:text-emerald-400 transition-colors">Routes</Link>
        <Link href="/forecast" className="hover:text-emerald-400 transition-colors">Forecast</Link>
        <Link href="/citizen" className="hover:text-emerald-400 transition-colors">Field Ingestion</Link>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}