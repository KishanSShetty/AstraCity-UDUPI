"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Download,
  Activity,
  Truck,
  Leaf,
  CheckCircle2
} from "lucide-react";
import { CrimeTrendChart } from "@/components/charts/CrimeTrendChart";
import { LiveMap } from "@/components/dashboard/LiveMap";
import { LiveEventFeed } from "@/components/dashboard/LiveEventFeed";
import { EarlyWarningSection } from "@/components/dashboard/EarlyWarningSection";
import { QuickMLBar } from "@/components/dashboard/QuickMLBar";
import { downloadDataAsCsv } from "@/lib/utils";
import { useComplaintStore } from "@/lib/store";
import { UDUPI_DATA } from "@/lib/constants";
import Link from "next/link";

interface DashboardTicket {
  id: string;
  ticket_number: string;
  ward_name: string;
  category: string;
  category_kn?: string;
  location: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  date: string;
  sla_remaining_hours?: number;
}

export default function DashboardPage() {
  const { complaints } = useComplaintStore();
  
  const [backendTickets, setBackendTickets] = useState<DashboardTicket[]>([]);
  const [ticketsSummary, setTicketsSummary] = useState<any>(null);
  const [fleetSummary, setFleetSummary] = useState<any>(null);
  const [dwccSummary, setDwccSummary] = useState<any>(null);
  const [carbonSummary, setCarbonSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load real telemetry from all backend API endpoints
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [fleetRes, dwccRes, carbonRes, ticketsRes] = await Promise.all([
          fetch("/api/fleet-status").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/dwcc-status").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/carbon").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tickets").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (fleetRes?.summary) setFleetSummary(fleetRes.summary);
        if (dwccRes) setDwccSummary(dwccRes);
        if (carbonRes) setCarbonSummary(carbonRes);
        if (ticketsRes?.tickets) {
          setBackendTickets(ticketsRes.tickets);
          setTicketsSummary(ticketsRes.summary);
        }
      } catch (e) {
        console.error("Dashboard live data fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Merge live citizen complaints with backend compliance tickets
  const mergedTickets = useMemo(() => {
    // Map citizen complaints into ticket format
    const citizenMapped: DashboardTicket[] = complaints.map((c) => {
      const isCritical = c.type.includes("Hazard") || c.type.includes("Methane") || c.description.includes("CRITICAL");
      const isHigh = c.type.includes("Commercial") || c.type.includes("Dead Animal") || c.description.includes("HIGH");
      const sev: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = isCritical ? "CRITICAL" : isHigh ? "HIGH" : "MEDIUM";

      const st = c.status === "Resolved" ? "RESOLVED" : c.status === "In Progress" ? "IN_PROGRESS" : "PENDING";
      const elapsedHours = (Date.now() - new Date(c.date).getTime()) / (1000 * 60 * 60);
      const slaLimit = sev === "CRITICAL" ? 4 : sev === "HIGH" ? 12 : 24;

      return {
        id: c.id,
        ticket_number: c.id.startsWith("UD-") || c.id.startsWith("SWM") ? c.id : `SWM/CITIZEN/${c.id}`,
        ward_name: c.location.split("-")[0].trim() || "Udupi Ward",
        category: c.type,
        category_kn: "ನಾಗರಿಕ ದೂರು",
        location: c.location,
        severity: sev,
        status: st,
        date: c.date,
        sla_remaining_hours: Math.max(0, Math.round((slaLimit - elapsedHours) * 10) / 10),
      };
    });

    // Merge citizen complaints first (live feedback), followed by municipal compliance dossiers
    const all = [...citizenMapped, ...backendTickets];
    // Deduplicate by ID
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [complaints, backendTickets]);

  const handleExportCsv = () => {
    downloadDataAsCsv(mergedTickets, "udupi-swms-incident-tickets");
  };

  // Proper Mathematical Metrics Computed from Audited Baseline & Live APIs
  const activeVehicles = fleetSummary
    ? `${fleetSummary.active}/${fleetSummary.total}`
    : "14/16";

  const fleetSubtext = fleetSummary
    ? `${fleetSummary.total_distance_km} km routed · ${fleetSummary.payload_utilization_pct}% payload`
    : "64.2 km routed · 84% payload";

  const dwccAvgLoad = dwccSummary
    ? `${dwccSummary.avg_utilization_pct}%`
    : `${Math.round((UDUPI_DATA.waste_dry_tons / UDUPI_DATA.dwcc_capacity_tpd) * 100)}%`;

  const dwccSubtext = dwccSummary
    ? `${dwccSummary.dwccs?.length || 6} Zonal Hubs · ${(dwccSummary.total_load_kg / 1000).toFixed(1)} TPD load`
    : "6 Zonal Hubs · 21.6 TPD Inflow";

  const activeAlertCount = useMemo(() => {
    const dwccAlerts = dwccSummary?.alerts?.length || 0;
    const pendingTickets = mergedTickets.filter((t) => t.status !== "RESOLVED").length;
    return dwccAlerts + pendingTickets;
  }, [dwccSummary, mergedTickets]);

  const criticalAlertsCount = useMemo(() => {
    return mergedTickets.filter((t) => t.severity === "CRITICAL" && t.status !== "RESOLVED").length;
  }, [mergedTickets]);

  // IPCC AR5 Carbon Avoidance Math
  const carbonTonsYear = useMemo(() => {
    if (carbonSummary?.carbon?.co2e_tonnes_year) {
      return Math.round(carbonSummary.carbon.co2e_tonnes_year).toLocaleString("en-IN");
    }
    // Theoretical computation from wet waste baseline (43.92 TPD)
    const methane_m3_day = UDUPI_DATA.waste_wet_tons * 105.7;
    const methane_tonnes_day = (methane_m3_day * 0.717) / 1000;
    const co2e_tonnes_year = methane_tonnes_day * 28 * 365;
    return Math.round(co2e_tonnes_year).toLocaleString("en-IN");
  }, [carbonSummary]);

  const carbonCreditValue = useMemo(() => {
    if (carbonSummary?.combined_annual_value_cr) {
      return `${carbonSummary.combined_annual_value_cr} CCTS Value`;
    }
    return "₹5.78 Cr CCTS Value";
  }, [carbonSummary]);

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Quick AI Search Copilot Bar */}
      <QuickMLBar />

      {/* Top Metric Cards - Solid Waste Command Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Fleet Telemetry */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Fleet Deployed
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {activeVehicles}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{fleetSubtext}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Monitored Facilities & DWCC Load */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              DWCC Utilization
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {dwccAvgLoad}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700">
              <Activity className="h-3.5 w-3.5" />
              <span>{dwccSubtext}</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. High-Risk Telemetry Alerts */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Overflow Alerts
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {activeAlertCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600">
              <span>{criticalAlertsCount} Critical Remediation Flags</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Annual CO2e Avoidance */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Annual CO₂e Avoided
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Leaf className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {carbonTonsYear}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-700">
              <span>{carbonCreditValue}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Telemetry Trends + Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Udupi Tonnage &amp; Inflow Telemetry Trends
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Municipal daily waste generation baseline vs recorded weighbridge deliveries across Udupi CMC.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CrimeTrendChart />
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="pt-6 h-full">
            <LiveEventFeed />
          </CardContent>
        </Card>
      </div>

      {/* Early Warning Predictor Banner */}
      <EarlyWarningSection />

      {/* Geospatial Map */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Udupi Municipal Geospatial Intelligence
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real-time incident density, processing facilities, and truck route telemetry.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/map">
                <Button variant="outline" size="sm" className="text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200">
                  Full 3D Twin Map <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LiveMap />
        </CardContent>
      </Card>

      {/* Recent Incident & Grievance Tickets Table (Live Wired) */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Recent SWM Grievance &amp; Compliance Tickets
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {mergedTickets.length} Total Registered
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live tickets logged via field supervisors, IoT sensors, and citizen grievance portals.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCsv} variant="outline" size="sm" className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
              <Download className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Export CSV
            </Button>
            <Link href="/complaints">
              <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                Manage Inbox <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[170px] text-xs font-bold text-slate-600 uppercase">Ticket ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Ward / Facility</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Incident Category</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Location</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Severity</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Status &amp; SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergedTickets.slice(0, 8).map((ticket) => {
                  const isCritical = ticket.severity === "CRITICAL";
                  const isHigh = ticket.severity === "HIGH";
                  const isResolved = ticket.status === "RESOLVED";
                  const isInProgress = ticket.status === "IN_PROGRESS";

                  return (
                    <TableRow key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-emerald-800">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {ticket.ward_name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <div className="font-semibold text-slate-900">{ticket.category}</div>
                        {ticket.category_kn && (
                          <div className="text-[10px] text-slate-400 font-normal">{ticket.category_kn}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-[220px] truncate">
                        {ticket.location}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isCritical
                              ? "text-rose-700 border-rose-300 bg-rose-50"
                              : isHigh
                              ? "text-amber-700 border-amber-300 bg-amber-50"
                              : "text-emerald-700 border-emerald-300 bg-emerald-50"
                          }`}
                        >
                          {ticket.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-semibold w-fit ${
                              isResolved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isInProgress
                                ? "bg-sky-100 text-sky-800 border border-sky-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isResolved ? "Resolved" : isInProgress ? "In Progress" : "Pending"}
                          </Badge>
                          {ticket.sla_remaining_hours !== undefined && !isResolved && (
                            <span className="text-[10px] font-medium text-slate-500">
                              {ticket.sla_remaining_hours > 0
                                ? `${ticket.sla_remaining_hours}h SLA left`
                                : "SLA Breached"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
