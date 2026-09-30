"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart2, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Layers, 
  Activity,
  ShieldCheck,
  Building2,
  Leaf,
  DollarSign,
  Zap,
  Home,
  Truck,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

// ─── TYPES & DATA ───────────────────────────────────────────────────
interface CarbonData {
  carbon: {
    wet_waste_tpd: number;
    methane_avoided_m3_day: number;
    co2e_tonnes_day: number;
    co2e_tonnes_year: number;
    credit_value_mid_cr: string;
    credit_value_mid_inr: number;
    energy_kwh_day: number;
    homes_powered: number;
    methodology: string;
  };
  operational_savings: {
    daily_saving_inr: number;
    annual_saving_inr: number;
    annual_saving_cr: string;
    pct_reduction: number;
  };
  combined_annual_value_cr: string;
}

const WASTE_COMPOSITION = [
  { name: 'Wet/Organic', value: 61, color: '#059669', dest: 'Gundibail & Kudlu BMU' },
  { name: 'Dry/Recyclable', value: 30, color: '#0284c7', dest: '6 Zonal DWCCs' },
  { name: 'Hazardous / Sanitary', value: 5, color: '#e11d48', dest: 'Auth. Biomedical Handler' },
  { name: 'Final Rejects / Silt', value: 4, color: '#64748b', dest: 'Indrali Remediation' },
];

const FLEET_DATA = [
  { type: 'Auto Tipper', count: 5, capacity: 500, coverage: 67.6, roads: 1371, fuel: 'CNG', co2: 0.12, icon: '🛺' },
  { type: 'Sm. Compactor', count: 1, capacity: 5000, coverage: 7.9, roads: 161, fuel: 'Diesel', co2: 0.35, icon: '🚛' },
  { type: 'Lg. Compactor', count: 1, capacity: 10000, coverage: 2.4, roads: 48, fuel: 'Diesel', co2: 0.45, icon: '🚛' },
  { type: 'Hook Loader', count: 1, capacity: 16000, coverage: 1.9, roads: 38, fuel: 'Diesel', co2: 0.55, icon: '🏗️' },
  { type: 'Garbage Truck', count: 2, capacity: 5000, coverage: 7.9, roads: 161, fuel: 'Diesel', co2: 0.35, icon: '🚚' },
];

const ROI_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    day: `D${day}`,
    carbon_credit: Math.round(day * (4.42 * 10000000 / 365) / 100) / 100,
    fuel_saved: Math.round(day * 33000 / 100000) / 10,
    baseline_cost: Math.round(day * 2800 * 55 / 100000) / 10,
    optimised_cost: Math.round(day * 2200 * 55 / 100000) / 10,
  };
});

const ROUTE_COMPARISON = [
  { metric: 'Total Route Distance', before: 132.44, after: 8.47, unit: 'km', improvement: 94 },
  { metric: 'Daily Fuel Cost', before: 2072, after: 132, unit: '₹', improvement: 94 },
  { metric: 'Collection Turnaround', before: 270, after: 78, unit: 'min', improvement: 71 },
  { metric: 'CO₂ Emissions / Day', before: 46.3, after: 1.72, unit: 'kg', improvement: 96 },
  { metric: 'Active Vehicles Deployed', before: 10, after: 2, unit: '', improvement: 80 },
  { metric: 'DWCC Overflow Events', before: 3, after: 0, unit: 'events', improvement: 100 },
];

const DWCC_RADAR = [
  { dwcc: 'DWCC-1 (Malpe)', load: 92, capacity: 100 },
  { dwcc: 'DWCC-2 (City)', load: 75, capacity: 100 },
  { dwcc: 'DWCC-3 (Manipal)', load: 68, capacity: 100 },
  { dwcc: 'DWCC-4 (Indrali)', load: 88, capacity: 100 },
  { dwcc: 'DWCC-5 (Bannanje)', load: 45, capacity: 100 },
  { dwcc: 'DWCC-6 (Santhekatte)', load: 55, capacity: 100 },
];

const MONTHLY_TREND = [
  { month: 'Jan', wet: 31.2, dry: 15.3, haz: 2.8, rej: 2.2 },
  { month: 'Feb', wet: 30.8, dry: 15.1, haz: 2.7, rej: 2.1 },
  { month: 'Mar', wet: 32.5, dry: 15.9, haz: 2.9, rej: 2.3 },
  { month: 'Apr', wet: 33.1, dry: 16.2, haz: 3.0, rej: 2.4 },
  { month: 'May', wet: 34.2, dry: 16.7, haz: 3.1, rej: 2.5 },
  { month: 'Jun', wet: 33.6, dry: 16.5, haz: 2.8, rej: 2.2 },
  { month: 'Jul', wet: 35.1, dry: 17.1, haz: 3.2, rej: 2.6 },
  { month: 'Aug', wet: 34.8, dry: 17.0, haz: 3.1, rej: 2.5 },
  { month: 'Sep', wet: 33.9, dry: 16.6, haz: 2.9, rej: 2.3 },
  { month: 'Oct', wet: 33.2, dry: 16.3, haz: 2.8, rej: 2.2 },
  { month: 'Nov', wet: 32.6, dry: 15.9, haz: 2.7, rej: 2.1 },
  { month: 'Dec', wet: 33.6, dry: 16.5, haz: 2.8, rej: 2.2 },
];

const MOCK_CORRELATION_DATA = [
  { district: "Indrali Ward 12", factorValue: 7.2, crimeCount: 312 },
  { district: "Malpe Ward 4", factorValue: 6.4, crimeCount: 245 },
  { district: "Manipal Ward 8", factorValue: 8.1, crimeCount: 282 },
  { district: "City Center Ward 15", factorValue: 5.2, crimeCount: 194 },
  { district: "Bannanje Ward 18", factorValue: 6.8, crimeCount: 168 },
  { district: "Gundibail Ward 21", factorValue: 5.4, crimeCount: 140 },
  { district: "Kadiyali Ward 25", factorValue: 6.7, crimeCount: 179 }
];

const MOCK_ANOMALIES = [
  {
    id: "ANM-01",
    district: "Indrali Ward 12 (Remediation Hub)",
    type: "Subsurface Methane Flare Surge",
    baseline: "120 ppm",
    detected: "480 ppm",
    deviation: "+300%",
    severity: "CRITICAL",
    timestamp: "Last 48 Hours"
  },
  {
    id: "ANM-02",
    district: "Malpe Coastal Ward 4",
    type: "Commercial Fish Waste Mudflat Spill",
    baseline: "0.8 TPD",
    detected: "4.2 TPD",
    deviation: "+425%",
    severity: "CRITICAL",
    timestamp: "Last 24 Hours"
  },
  {
    id: "ANM-03",
    district: "Manipal Ward 8 (Hostel Sector)",
    type: "Wet Waste Source Segregation Deficit",
    baseline: "92% Segregated",
    detected: "58% Segregated",
    deviation: "-34%",
    severity: "ELEVATED",
    timestamp: "Last 12 Hours"
  }
];

const MOCK_RADAR_DATA = [
  { metric: "Source Segregation", indrali: 85, malpe: 72, manipal: 94 },
  { metric: "Biogas Diversion", indrali: 65, malpe: 55, manipal: 88 },
  { metric: "Fleet Punctuality", indrali: 90, malpe: 82, manipal: 91 },
  { metric: "Citizen Satisfaction", indrali: 88, malpe: 75, manipal: 92 },
  { metric: "Methane Abatement", indrali: 74, malpe: 80, manipal: 89 },
];

export default function AnalyticsPage() {
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);

  useEffect(() => {
    fetch('/api/carbon')
      .then((r) => r.json())
      .then(setCarbonData)
      .catch(() => {
        // Fallback realistic defaults
        setCarbonData({
          carbon: {
            wet_waste_tpd: 33.55,
            methane_avoided_m3_day: 4026,
            co2e_tonnes_day: 2.82,
            co2e_tonnes_year: 1029.3,
            credit_value_mid_cr: "₹4.42 Cr",
            credit_value_mid_inr: 44200000,
            energy_kwh_day: 8052,
            homes_powered: 2684,
            methodology: "UNFCCC ACM0022 / CCTS 2023"
          },
          operational_savings: {
            daily_saving_inr: 33000,
            annual_saving_inr: 12045000,
            annual_saving_cr: "₹1.20 Cr",
            pct_reduction: 21.4
          },
          combined_annual_value_cr: "₹5.62 Cr"
        });
      });
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
              Udupi CMC Digital Twin · Analytics Hub
            </Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-mono">
              SWM 2026 / CCTS Compliance
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Municipal SWM Analytics, Carbon Ledger & Optimization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Carbon credits estimation, fleet performance metrics, statistical 3-sigma anomaly diagnostics, and route optimization ROI.
          </p>
        </div>

        {carbonData && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-right">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Projected Municipal Value</div>
            <div className="text-2xl font-black text-emerald-700">{carbonData.combined_annual_value_cr} / yr</div>
            <div className="text-[11px] text-emerald-600">Carbon Credits (₹4.42 Cr) + Fuel Savings (₹1.20 Cr)</div>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <Tabs defaultValue="carbon" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-xl">
          <TabsTrigger value="carbon" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs">
            🌿 Carbon Credits & ESG
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs">
            ⚠️ 3-Sigma Anomaly Diagnostics
          </TabsTrigger>
          <TabsTrigger value="route-fleet" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs">
            🚛 Fleet & Route Savings
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: CARBON CREDITS & ESG ─── */}
        <TabsContent value="carbon" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">CO₂e Abatement</span>
                  <Leaf className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  {carbonData?.carbon.co2e_tonnes_year.toLocaleString('en-IN') || '1,029'} <span className="text-xs font-bold text-slate-400">T/yr</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">From organic waste diversion</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Carbon Credit Value</span>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {carbonData?.carbon.credit_value_mid_cr || '₹4.42 Cr'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">CCTS 2023 compliant valuation</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Clean Energy Output</span>
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {carbonData?.carbon.energy_kwh_day.toLocaleString('en-IN') || '8,052'} <span className="text-xs font-bold text-slate-400">kWh/day</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Biomethanation potential</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Homes Powered</span>
                  <Home className="h-4 w-4 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-sky-600 mt-2">
                  {carbonData?.carbon.homes_powered.toLocaleString('en-IN') || '2,684'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Equivalent residential households</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts: 30-Day Cumulative Savings & Waste Stream Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">30-Day Cumulative Savings Projection</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Carbon credits generation vs operational fuel saved (₹ in Lakhs).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ROI_DATA}>
                    <defs>
                      <linearGradient id="gCarbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="carbon_credit" stroke="#059669" fill="url(#gCarbon)" name="Carbon Credits (Lakhs)" strokeWidth={2} />
                    <Area type="monotone" dataKey="fuel_saved" stroke="#0284c7" fill="url(#gFuel)" name="Fuel Saved (Lakhs)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">Waste Stream Composition & Destinations</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Udupi CMC daily collection composition (55 TPD baseline).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
                  <div className="w-full sm:w-1/2 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={WASTE_COMPOSITION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                          {WASTE_COMPOSITION.map((w, i) => (
                            <Cell key={i} fill={w.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2.5">
                    {WASTE_COMPOSITION.map((w) => (
                      <div key={w.name} className="p-2 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                          <span className="font-bold text-slate-800">{w.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{w.value}%</span>
                          <span className="text-[10px] text-slate-500 block">{w.dest}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend area chart */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">12-Month SWM Generation Trends (TPD)</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Seasonal variation across wet, dry, recyclable, and hazardous streams in Udupi CMC.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_TREND}>
                  <defs>
                    <linearGradient id="gWet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.3} /><stop offset="95%" stopColor="#059669" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gDry" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} /><stop offset="95%" stopColor="#0284c7" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'TPD', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="wet" stackId="1" stroke="#059669" fill="url(#gWet)" name="Wet Organic" strokeWidth={2} />
                  <Area type="monotone" dataKey="dry" stackId="1" stroke="#0284c7" fill="url(#gDry)" name="Dry Recyclable" strokeWidth={2} />
                  <Area type="monotone" dataKey="haz" stackId="1" stroke="#e11d48" fill="#e11d4822" name="Hazardous" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="rej" stackId="1" stroke="#64748b" fill="#64748b22" name="Rejects" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: 3-SIGMA ANOMALIES & DIAGNOSTICS ─── */}
        <TabsContent value="anomalies" className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    Active 3-Sigma Waste Generation & Sensor Outliers
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Statistically anomalous outliers deviating past 3 standard deviations from baseline municipal trends.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50 font-bold text-xs">
                  3 Active Anomalies
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_ANOMALIES.map((anm) => (
                  <div key={anm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        anm.severity === "CRITICAL" ? "text-rose-700 border-rose-300 bg-rose-50" : "text-amber-700 border-amber-300 bg-amber-50"
                      }`}>
                        {anm.severity}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">{anm.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{anm.type}</h4>
                    <p className="text-[11px] text-slate-600">{anm.district}</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Baseline: {anm.baseline}</span>
                      <span className="font-bold text-rose-600">Actual: {anm.detected} ({anm.deviation})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Chart */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">Commercial Density vs Recorded Tonnage</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Density index vs recorded municipal solid waste generation (TPD) across wards.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CORRELATION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="district" tick={{ fill: '#64748b', fontSize: 10 }} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="crimeCount" name="Recorded Tonnage (x10 kg)" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Multi-Ward Radar Comparison */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">Multi-Ward SWM 2026 Performance Radar</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Comparing Indrali, Malpe, and Manipal across key operational metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={MOCK_RADAR_DATA}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar name="Indrali (Ward 12)" dataKey="indrali" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                    <Radar name="Malpe (Ward 4)" dataKey="malpe" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                    <Radar name="Manipal (Ward 8)" dataKey="manipal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 3: FLEET & ROUTE OPTIMIZATION ─── */}
        <TabsContent value="route-fleet" className="space-y-6">
          {/* Before vs After Route Optimization Comparison */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Before vs After Route Optimization Impact</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Clarke-Wright and VRP solver results for Udupi CMC primary and secondary fleet.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 font-bold text-xs">
                  94% Overall Distance Reduction
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROUTE_COMPARISON.map((c) => (
                  <div key={c.metric} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700">{c.metric}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-rose-500 line-through">{c.before} {c.unit}</span>
                        <span className="text-sm font-black text-emerald-700">→ {c.after} {c.unit}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs">
                      +{c.improvement}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fleet Composition & DWCC Capacity Load */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">Fleet Road Coverage by Vehicle Type</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Percentage of Udupi road network accessible by vehicle class.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FLEET_DATA} margin={{ left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: '% roads', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="coverage" name="Road Coverage %" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">DWCC Zonal Load Radar (% of 3 TPD Capacity)</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Current processing load across 6 Dry Waste Collection Centers.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={DWCC_RADAR}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dwcc" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar name="Current Load %" dataKey="load" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                    <Radar name="Maximum Capacity" dataKey="capacity" stroke="#cbd5e1" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
