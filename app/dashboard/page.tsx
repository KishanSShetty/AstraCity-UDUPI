'use client';

import dynamic from 'next/dynamic';

const SmartMap = dynamic(() => import('@/components/map/SmartMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1a] space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00d4aa]" />
      <p className="text-slate-400 text-sm animate-pulse tracking-wide">Loading Udupi City Command Center…</p>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
      {/* ── Header Bar ──────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-center gap-3 py-2.5 px-4"
        style={{
          background: 'rgba(10,15,26,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)' }}>
          <span>📍</span>
          <span className="text-xs font-bold text-white">Udupi City</span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:block select-none">
          Detailed Udupi City · Real Udupi CMC data · 11,429 buildings
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
