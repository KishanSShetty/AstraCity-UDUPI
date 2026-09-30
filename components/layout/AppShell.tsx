'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopHeader } from '@/components/layout/TopHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The landing page ('/') and public citizen portal ('/citizen') are standalone pages,
  // separate from the municipal admin operations console.
  const isStandalonePage = pathname === '/' || pathname === '/citizen';

  if (isStandalonePage) {
    return (
      <div className="min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden">
        {children}
      </div>
    );
  }

  // All administrative & operational routes (/dashboard, /analytics, /cases, /network, etc.)
  // render inside the vertical AppSidebar and TopHeader console shell.
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50/60">
          {children}
        </main>
      </div>
    </div>
  );
}
