'use client';

import dynamic from 'next/dynamic';


const SmartMap = dynamic(() => import('@/components/map/SmartMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      <p className="text-slate-500 text-sm animate-pulse tracking-wide font-medium">Loading Udupi City map…</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="flex flex-col bg-slate-50" style={{ height: 'calc(100vh - 65px)' }}>

      {/* ── Header Bar ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-3 py-2.5 px-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>📍</span>
          <span className="text-xs font-bold">Udupi City Digital Twin</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:block select-none font-medium">
          Detailed Udupi City · Real CMC Telemetry · 11,429 Buildings
        </span>
      </div>

      {/* ── Map Frame — Udupi City only ─────── */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <SmartMap />
        </div>
      </div>
    </div>
  );
}
