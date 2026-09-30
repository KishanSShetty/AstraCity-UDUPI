"use client";

import React, { useState } from "react";
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
  FileText, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Download,
  Activity,
  Truck
} from "lucide-react";
import { CrimeTrendChart } from "@/components/charts/CrimeTrendChart";
import { LiveMap } from "@/components/dashboard/LiveMap";
import { LiveEventFeed } from "@/components/dashboard/LiveEventFeed";
import { EarlyWarningSection } from "@/components/dashboard/EarlyWarningSection";
import { QuickMLBar } from "@/components/dashboard/QuickMLBar";
import { MOCK_DASHBOARD_STATS, MOCK_FIRS } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [firs] = useState(MOCK_FIRS);
  const [stats] = useState(MOCK_DASHBOARD_STATS);

  const handleExportCsv = () => {
    downloadDataAsCsv(firs, "udupi-swms-incident-tickets");
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Quick AI Search Copilot Bar */}
      <QuickMLBar />

      {/* Top Metric Cards - Solid Waste Command Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Ward Operations */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Ward Operations
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {stats.activeInvestigations}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>35 Municipal Wards Synced</span>
            </div>
          </CardContent>
        </Card>

        {/* Monitored Facilities & Generators */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monitored Facilities
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {stats.personsOfInterest}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>DWCCs, Biogas & Bulk Sites</span>
            </div>
          </CardContent>
        </Card>

        {/* High-Risk Telemetry Alerts */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Telemetry Overflow Alerts
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {stats.highRiskAlerts}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-600">
              <span>Methane & Spillage Warnings</span>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Grievance Resolution
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {stats.resolutionRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
              <span>SWM 2026 Target Compliant</span>
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
                <CardTitle className="text-base font-bold text-slate-900">Udupi Tonnage & Telemetry Trends</CardTitle>
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
              <CardTitle className="text-base font-bold text-slate-900">Udupi Municipal Geospatial Intelligence</CardTitle>
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

      {/* Recent Incident & Grievance Tickets Table */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Recent SWM Grievance & Compliance Tickets</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live tickets logged via field supervisors, IoT sensors, and citizen grievance portals.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCsv} variant="outline" size="sm" className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
              <Download className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Export CSV
            </Button>
            <Link href="/cases">
              <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                View All Cases <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[140px] text-xs font-bold text-slate-600 uppercase">Ticket ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Ward / Facility</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Incident Category</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Location</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Severity</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firs.map((fir) => (
                  <TableRow key={fir.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-emerald-800">
                      {fir.fir_number}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {fir.station_name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{fir.crime_type_en}</div>
                      <div className="text-[10px] text-slate-400">{fir.crime_type_kn}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                      {fir.location.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        fir.severity === 'CRITICAL' ? 'text-rose-700 border-rose-300 bg-rose-50' :
                        fir.severity === 'HIGH' ? 'text-amber-700 border-amber-300 bg-amber-50' :
                        'text-emerald-700 border-emerald-300 bg-emerald-50'
                      }`}>
                        {fir.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {fir.status_en}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
