"use client";

import React from "react";
import { Search, Menu, Command, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { NotificationCenter } from "./NotificationCenter";

export function TopHeader() {
  const { language, setLanguage, t } = useLanguage();
  const { role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  let title = "Operations Hub";
  if (pathname === '/') {
    title = "Public Citizen Portal";
  } else if (pathname?.includes('/chat')) {
    title = "AI SWM Copilot";
  } else if (pathname?.includes('/network')) {
    title = "Waste Logistics & Facility Network";
  } else if (pathname?.includes('/dashboard')) {
    title = "SWM Command Center";
  } else if (pathname?.includes('/analytics')) {
    title = "Ward Analytics, Carbon & Trends";
  } else if (pathname?.includes('/cases')) {
    title = "Compliance & Grievance Cases";
  } else if (pathname?.includes('/profiles')) {
    title = "Facilities & Bulk Generators";
  } else if (pathname?.includes('/alerts')) {
    title = "Early Warning Telemetry";
  } else if (pathname?.includes('/financial')) {
    title = "Municipal Financials & Tipping Fees";
  } else if (pathname?.includes('/audit')) {
    title = "SWM 2026 Audit & Governance";
  } else if (pathname?.includes('/settings')) {
    title = "System Settings & Permissions";
  } else if (pathname?.includes('/data-ingestion')) {
    title = "Field Telemetry & Sensor Ingestion";
  } else if (pathname?.includes('/map')) {
    title = "3D Digital Twin Map Engine";
  } else if (pathname?.includes('/wards')) {
    title = "Ward Profiling & Demographics";
  } else if (pathname?.includes('/routes')) {
    title = "Route Optimization & Two-Tier VRP";
  } else if (pathname?.includes('/vehicle-sim')) {
    title = "Fleet GPS Simulation & Live Tracking";
  } else if (pathname?.includes('/complaints')) {
    title = "Citizen SWM Grievance Redressal";
  } else if (pathname?.includes('/simulation')) {
    title = "Biomethanation & Anaerobic Simulation";
  } else if (pathname?.includes('/lulc')) {
    title = "Satellite LULC & Environmental Risk";
  } else if (pathname?.includes('/report')) {
    title = "Statutory ESG & Compliance Report";
  } else if (pathname?.includes('/forecast')) {
    title = "10-Day Waste Generation Forecast";
  } else if (pathname?.includes('/open-data')) {
    title = "Open Geospatial Data Catalog";
  } else if (pathname?.includes('/methodology')) {
    title = "Methodology & CPCB Framework";
  }

  const roleLabel = 
    role === "ADMIN" ? "COMMISSIONER" :
    role === "SUPERINTENDENT" ? "ZONAL HEAD" :
    role === "INSPECTOR" ? "ENV. ENGINEER" : "WARD SUPERVISOR";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-xs font-semibold text-slate-500 hidden md:flex items-center">
          <span className="hover:text-emerald-700 cursor-pointer transition-colors">Udupi CMC</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 font-bold">{title}</span>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-end space-x-3.5">
        {/* Global Search */}
        <form onSubmit={handleSearch} className="relative hidden w-full max-w-md md:flex items-center group">
          <Search className="absolute left-2.5 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Udupi wards, facilities, trucks, or tickets..."
            className="w-full bg-slate-50 border-slate-200/80 pl-9 pr-12 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:bg-white text-xs h-9 transition-all"
          />
          <div className="absolute right-1.5 flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-semibold text-slate-400 opacity-100">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </form>

        {/* User Role Badge */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-md text-[11px] font-bold tracking-wide text-emerald-800 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            {roleLabel}
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50 p-0.5">
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${language === 'en' ? 'font-bold bg-white shadow-xs text-emerald-700' : 'font-medium text-slate-500 hover:text-slate-900'}`}
          >
            EN
          </button>
          <button 
            type="button"
            onClick={() => setLanguage('kn')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${language === 'kn' ? 'font-bold bg-white shadow-xs text-emerald-700' : 'font-medium text-slate-500 hover:text-slate-900'}`}
          >
            ಕನ್ನಡ
          </button>
        </div>

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
}
