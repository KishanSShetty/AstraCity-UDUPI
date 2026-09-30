"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Recycle, 
  LayoutDashboard, 
  MessageSquare, 
  Network, 
  LineChart, 
  FileText, 
  Building2, 
  BellRing, 
  Landmark, 
  Settings, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Database,
  MapPin,
  Truck,
  Sparkles,
  ClipboardList,
  Satellite,
  DownloadCloud,
  Home,
  Compass,
  FolderOpen,
  BookOpen,
  UserCheck,
  Lock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Administrative modules (Only visible to Admin / Officer)
export const adminOperations = [
  { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics & Carbon", href: "/analytics", icon: LineChart },
  { label: "AI SWM Copilot", href: "/chat", icon: MessageSquare },
  { label: "Early Warnings", href: "/alerts", icon: BellRing },
  { label: "Field Ingestion", href: "/data-ingestion", icon: Database },
];

export const complianceOperations = [
  { label: "Compliance Cases", href: "/cases", icon: FileText },
  { label: "Facilities & Registry", href: "/profiles", icon: Building2 },
  { label: "Waste Supply Network", href: "/network", icon: Network },
  { label: "Financial Ledgers", href: "/financial", icon: Landmark },
  { label: "Audit & Governance", href: "/audit", icon: ShieldCheck },
];

// Citizen-accessible modules (Available to both Citizen and Admin)
export const citizenModules = [
  { label: "Public Portal Home", href: "/", icon: Home },
  { label: "Citizen Services Hub", href: "/citizen", icon: UserCheck },
  { label: "Report Dumping", href: "/complaints", icon: ClipboardList },
  { label: "Digital Twin Map", href: "/map", icon: MapPin },
  { label: "Ward Demographics", href: "/wards", icon: Building2 },
  { label: "Collection Routes", href: "/routes", icon: Truck },
];

export const geospatialModules = [
  { label: "Fleet GPS Simulation", href: "/vehicle-sim", icon: Sparkles },
  { label: "Satellite & LULC", href: "/lulc", icon: Satellite },
  { label: "10-Day Waste Forecast", href: "/forecast", icon: Compass },
  { label: "Compliance Report", href: "/report", icon: DownloadCloud },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
  { label: "Open Data Catalog", href: "/open-data", icon: FolderOpen },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAdmin, isCitizen, loginAsAdmin, loginAsCitizen } = useAuth();
  
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (isAdmin ? 'Er. K. P. Bhat' : 'Citizen Resident');
  const displayInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'KB' : (isAdmin ? 'KB' : 'CR');

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { t } = useLanguage();

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r border-slate-200 bg-white shadow-xs z-30 transition-all duration-300 relative select-none shrink-0",
      isCollapsed ? "w-[76px]" : "w-64"
    )}>
      {/* Brand Section */}
      <Link href={isAdmin ? "/dashboard" : "/"}>
        <div className={cn(
          "flex h-16 items-center border-b border-slate-100 transition-all overflow-hidden whitespace-nowrap bg-emerald-50/50 hover:bg-emerald-50/80 cursor-pointer",
          isCollapsed ? "justify-center px-0" : "px-4"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
            <Recycle className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">AstraCity</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 tracking-wider">UDUPI</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate">
                {isAdmin ? "Municipal Admin Console" : "Public Citizen Portal"}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 overflow-x-hidden scrollbar-thin">
        
        {/* Toggle Collapse Bar */}
        <div className={cn(
          "flex items-center mb-1.5",
          isCollapsed ? "justify-center" : "justify-between px-2"
        )}>
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">
              {isAdmin ? "ADMIN OPERATIONS" : "CITIZEN SERVICES"}
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* SECTION FOR CITIZEN: Citizen Services */}
        {isCitizen && (
          <div className="space-y-1">
            {citizenModules.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center rounded-lg px-2.5 py-2 text-xs font-bold transition-all duration-150 overflow-hidden",
                    isActive 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className="flex items-center min-w-0">
                    <item.icon className={cn(
                      "shrink-0 transition-colors", 
                      isCollapsed ? "h-5 w-5" : "mr-2.5 h-4 w-4",
                      isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                    )} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && isActive && (
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 ml-2" />
                  )}
                </Link>
              );
            })}

            {/* Admin Switcher Card in Citizen Mode */}
            {!isCollapsed && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Admin Console Locked
                </div>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Tipping ledgers, audits, and fleet control are restricted to municipal officers.
                </p>
                <button
                  onClick={() => {
                    loginAsAdmin();
                    router.push('/dashboard');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Log in as Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTIONS FOR ADMIN: Full Operations Workspace */}
        {isAdmin && (
          <>
            {/* 1. Core Operations */}
            <div className="space-y-1">
              {adminOperations.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center rounded-lg px-2.5 py-2 text-xs font-bold transition-all duration-150 overflow-hidden",
                      isActive 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isCollapsed ? "justify-center" : "justify-between"
                    )}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon className={cn(
                        "shrink-0 transition-colors", 
                        isCollapsed ? "h-5 w-5" : "mr-2.5 h-4 w-4",
                        isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 ml-2" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 2. Municipal Compliance & Ledgers */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              {!isCollapsed && (
                <div className="px-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    COMPLIANCE & GOVERNANCE
                  </span>
                </div>
              )}
              {complianceOperations.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 overflow-hidden",
                      isActive 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isCollapsed ? "justify-center" : "justify-between"
                    )}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon className={cn(
                        "shrink-0 transition-colors", 
                        isCollapsed ? "h-4 w-4" : "mr-2.5 h-3.5 w-3.5",
                        isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 ml-2" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 3. Geospatial Twin Engines */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              {!isCollapsed && (
                <div className="px-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    GEOSPATIAL TWIN ENGINES
                  </span>
                </div>
              )}
              <Link
                href="/citizen"
                title={isCollapsed ? "Citizen Services Hub" : undefined}
                className={cn(
                  "group flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all overflow-hidden",
                  pathname === "/citizen"
                    ? "bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center min-w-0">
                  <UserCheck className="shrink-0 mr-2.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
                  {!isCollapsed && <span className="truncate">Citizen Services Hub</span>}
                </div>
              </Link>
              {citizenModules.slice(2).concat(geospatialModules).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 overflow-hidden",
                      isActive 
                        ? "bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isCollapsed ? "justify-center" : "justify-between"
                    )}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon className={cn(
                        "shrink-0 transition-colors", 
                        isCollapsed ? "h-4 w-4" : "mr-2.5 h-3.5 w-3.5",
                        isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 ml-2" />
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Settings & Return to Public Site (Only for Admin) */}
      {isAdmin && (
        <div className="p-2 border-t border-slate-100 bg-white space-y-1">
          <Link
            href="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "group flex items-center rounded-lg px-2.5 py-2 text-xs font-bold transition-all overflow-hidden",
              pathname?.startsWith('/settings')
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <Settings className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-700")} />
            {!isCollapsed && <span>Settings & Roles</span>}
          </Link>

          <Link
            href="/"
            title={isCollapsed ? "Exit to Public Home" : undefined}
            className={cn(
              "group flex items-center rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all overflow-hidden",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <Home className={cn("shrink-0", isCollapsed ? "h-4 w-4" : "mr-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-700")} />
            {!isCollapsed && <span>Exit to Public Home</span>}
          </Link>
        </div>
      )}

      {/* User Profile Section with Role Toggle */}
      <div className="border-t border-slate-200 p-3 overflow-hidden bg-slate-50/70">
        <div className={cn(
          "flex items-center rounded-lg p-1.5 transition-colors hover:bg-slate-100",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <Avatar className={cn(
              "h-8 w-8 border shrink-0",
              isAdmin ? "border-emerald-300" : "border-sky-300"
            )}>
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className={cn(
                "font-bold text-xs",
                isAdmin ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
              )}>
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{displayName}</span>
                <span className="text-[10px] text-slate-500 font-semibold truncate">
                  {isAdmin ? "Env. Engineer · CMC" : "Citizen Resident · Udupi"}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => {
                if (isAdmin) {
                  loginAsCitizen();
                  router.push('/citizen');
                } else {
                  loginAsAdmin();
                  router.push('/dashboard');
                }
              }}
              title={isAdmin ? "Switch to Citizen View" : "Login as Admin"}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
