'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  AreaChart, Area, PieChart, Pie, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ─── TYPES ───────────────────────────────────────────────────────
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

// ─── DATA ────────────────────────────────────────────────────────

// Waste composition breakdown (PRD §5.4)
const WASTE_COMPOSITION = [
  { name: 'Wet/Organic', value: 61, color: '#22c55e', dest: 'Kudlu BMU' },
  { name: 'Dry/Recyclable', value: 30, color: '#3b82f6', dest: '6 DWCCs' },
  { name: 'Hazardous', value: 5, color: '#ef4444', dest: 'Auth. Handler' },
  { name: 'Final Rejects', value: 4, color: '#64748b', dest: 'Yelahanka' },
];

// Vehicle fleet efficiency
const FLEET_DATA = [
  { type: 'Auto Tipper', count: 5, capacity: 500, coverage: 67.6, roads: 1371, fuel: 'CNG', co2: 0.12, icon: '🛺' },
  { type: 'Sm. Compactor', count: 1, capacity: 5000, coverage: 7.9, roads: 161, fuel: 'Diesel', co2: 0.35, icon: '🚛' },
  { type: 'Lg. Compactor', count: 1, capacity: 10000, coverage: 2.4, roads: 48, fuel: 'Diesel', co2: 0.45, icon: '🚛' },
  { type: 'Hook Loader', count: 1, capacity: 16000, coverage: 1.9, roads: 38, fuel: 'Diesel', co2: 0.55, icon: '🏗️' },
  { type: 'Garbage Truck', count: 2, capacity: 5000, coverage: 7.9, roads: 161, fuel: 'Diesel', co2: 0.35, icon: '🚚' },
];

// 30-day ROI projection
const ROI_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    day: `D${day}`,
    carbon_credit: Math.round(day * (4.42 * 10000000 / 365) / 100) / 100, // Cumulative lakhs
    fuel_saved: Math.round(day * 33000 / 100000) / 10, // Cumulative lakhs
    baseline_cost: Math.round(day * 2800 * 55 / 100000) / 10,
    optimised_cost: Math.round(day * 2200 * 55 / 100000) / 10,
  };
});

// Before vs After route comparison
const ROUTE_COMPARISON = [
  { metric: 'Total Distance', before: 132.44, after: 8.47, unit: 'km', improvement: 94 },
  { metric: 'Fuel Cost/Day', before: 2072, after: 132, unit: '₹', improvement: 94 },
  { metric: 'Collection Time', before: 270, after: 78, unit: 'min', improvement: 71 },
  { metric: 'CO₂ Emissions', before: 46.3, after: 1.72, unit: 'kg', improvement: 96 },
  { metric: 'Vehicles Used', before: 10, after: 2, unit: '', improvement: 80 },
  { metric: 'DWCC Overflow', before: 3, after: 0, unit: 'events', improvement: 100 },
];

// DWCC utilisation radar
const DWCC_RADAR = [
  { dwcc: 'DWCC-1', load: 92, capacity: 100 },
  { dwcc: 'DWCC-2', load: 75, capacity: 100 },
  { dwcc: 'DWCC-3', load: 68, capacity: 100 },
  { dwcc: 'DWCC-4', load: 88, capacity: 100 },
  { dwcc: 'DWCC-5', load: 45, capacity: 100 },
  { dwcc: 'DWCC-6', load: 55, capacity: 100 },
];

// Monthly waste trend
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

const CustomTooltipStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#e2e8f0',
  backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
};

// ─── COMPONENT ───────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetch('/api/carbon').then(r => r.json()).then(setCarbonData).catch(() => {});
  }, []);

  const sections = ['KPIs', 'Route Comparison', 'Carbon Credits', 'Fleet', 'Waste Trends', 'DWCC Load'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📊</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Routing Analytics</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Udupi City · Udupi CMC · Performance Dashboard</p>
          </div>
        </div>
        {carbonData && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', margin: 0 }}>{carbonData.combined_annual_value_cr}</p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Annual Value (Carbon + Savings)</p>
          </div>
        )}
      </header>

      {/* Section Tabs */}
      <nav style={{ padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {sections.map((s, i) => (
          <button key={s} onClick={() => setActiveSection(i)} style={{
            padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
            color: activeSection === i ? '#a78bfa' : '#64748b', fontWeight: activeSection === i ? 600 : 400,
            fontSize: 12, borderBottom: activeSection === i ? '2px solid #a78bfa' : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}>{s}</button>
        ))}
      </nav>

      <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Section 0: KPIs ── */}
        {activeSection === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Daily Waste', value: '55 TPD', sub: '110K residents · 0.5 kg/capita', color: '#14b8a6', icon: '🗑️' },
                { label: 'Route Savings', value: '94%', sub: '132.44 → 8.47 km', color: '#22c55e', icon: '📉' },
                { label: 'CO₂ Reduction', value: '96%', sub: '46.3 → 1.72 kg/day', color: '#3b82f6', icon: '🌿' },
                { label: 'Carbon Credits', value: carbonData?.carbon.credit_value_mid_cr || '...', sub: 'CCTS 2023 · Annual', color: '#a78bfa', icon: '💰' },
                { label: 'Fleet Size', value: '10 vehicles', sub: '5 types · CNG + Diesel', color: '#f59e0b', icon: '🚛' },
                { label: 'DWCCs In-Ward', value: '6', sub: '18 TPD total capacity', color: '#22c55e', icon: '♻️' },
                { label: 'Solver Speed', value: '1 ms', sub: 'Clarke-Wright Savings', color: '#ec4899', icon: '⚡' },
                { label: 'Road Coverage', value: '67.6%', sub: 'Auto Tipper accessible', color: '#8b5cf6', icon: '🛣️' },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                  style={{ padding: '20px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 48, opacity: 0.06 }}>{kpi.icon}</div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>{kpi.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 700, margin: '6px 0 4px', color: kpi.color, letterSpacing: -1 }}>{kpi.value}</p>
                  <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{kpi.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Section 1: Before/After Route Comparison ── */}
        {activeSection === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Before vs After Route Optimisation</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Bar chart */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>Improvement %</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ROUTE_COMPARISON} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="metric" tick={{ fontSize: 11, fill: '#cbd5e1' }} width={80} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="improvement" radius={[0, 6, 6, 0]}>
                      {ROUTE_COMPARISON.map((_, i) => (
                        <Cell key={i} fill={['#14b8a6', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ROUTE_COMPARISON.map((c, i) => (
                  <motion.div key={c.metric} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{c.metric}</p>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12 }}>
                        <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{c.before} {c.unit}</span>
                        <span style={{ color: '#22c55e', fontWeight: 700 }}>{c.after} {c.unit}</span>
                      </div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: `conic-gradient(#22c55e ${c.improvement}%, rgba(255,255,255,0.06) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#22c55e' }}>
                        {c.improvement}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Section 2: Carbon Credits + ROI ── */}
        {activeSection === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Carbon Credits & ROI Timeline</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* 30-day ROI */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>30-Day Cumulative Savings (₹ Lakhs)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ROI_DATA}>
                    <defs>
                      <linearGradient id="gCarbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="carbon_credit" stroke="#22c55e" fill="url(#gCarbon)" name="Carbon Credit" strokeWidth={2} />
                    <Area type="monotone" dataKey="fuel_saved" stroke="#3b82f6" fill="url(#gFuel)" name="Fuel Saved" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Waste composition pie */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>Waste Stream Composition</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie data={WASTE_COMPOSITION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                        {WASTE_COMPOSITION.map((w, i) => <Cell key={i} fill={w.color} />)}
                      </Pie>
                      <Tooltip contentStyle={CustomTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {WASTE_COMPOSITION.map(w => (
                      <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: w.color, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{w.name} ({w.value}%)</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>→ {w.dest}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon summary cards */}
            {carbonData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}>
                {[
                  { label: 'CO₂e Avoided/Year', value: `${carbonData.carbon.co2e_tonnes_year.toLocaleString()} T`, color: '#22c55e' },
                  { label: 'Carbon Credit Value', value: carbonData.carbon.credit_value_mid_cr, color: '#a78bfa' },
                  { label: 'Energy Potential', value: `${carbonData.carbon.energy_kwh_day.toLocaleString()} kWh/day`, color: '#f59e0b' },
                  { label: 'Homes Powered', value: carbonData.carbon.homes_powered.toLocaleString(), color: '#3b82f6' },
                ].map((c, i) => (
                  <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ padding: '16px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, margin: '4px 0', color: c.color }}>{c.value}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Section 3: Fleet Analysis ── */}
        {activeSection === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Fleet Composition & Road Access</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Road coverage chart */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>Road Coverage by Vehicle Type</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={FLEET_DATA} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-15} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: '% roads', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="coverage" radius={[6, 6, 0, 0]}>
                      {FLEET_DATA.map((_, i) => <Cell key={i} fill={['#2ECC71', '#3498DB', '#9B59B6', '#E67E22', '#E74C3C'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Fleet cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FLEET_DATA.map((v, i) => (
                  <motion.div key={v.type} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 24 }}>{v.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{v.type} <span style={{ color: '#64748b', fontWeight: 400 }}>×{v.count}</span></p>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{v.capacity < 1000 ? v.capacity + ' kg' : (v.capacity / 1000) + ' T'} · {v.fuel} · {v.co2} kg CO₂/km</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#14b8a6', margin: 0 }}>{v.coverage}%</p>
                      <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>{v.roads} roads</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Section 4: Waste Trends ── */}
        {activeSection === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Monthly Waste Generation Trend</h2>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={MONTHLY_TREND}>
                  <defs>
                    <linearGradient id="gWet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gDry" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gHaz" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'TPD', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="wet" stackId="1" stroke="#22c55e" fill="url(#gWet)" name="Wet Organic" strokeWidth={2} />
                  <Area type="monotone" dataKey="dry" stackId="1" stroke="#3b82f6" fill="url(#gDry)" name="Dry Recyclable" strokeWidth={2} />
                  <Area type="monotone" dataKey="haz" stackId="1" stroke="#ef4444" fill="url(#gHaz)" name="Hazardous" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="rej" stackId="1" stroke="#64748b" fill="rgba(100,116,139,0.2)" name="Rejects" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cost comparison line chart */}
            <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>30-Day Cost: Baseline vs Optimised (₹ Lakhs)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ROI_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="baseline_cost" stroke="#ef4444" strokeWidth={2} dot={false} name="Baseline (₹2800/T)" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="optimised_cost" stroke="#22c55e" strokeWidth={2} dot={false} name="Optimised (₹2200/T)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── Section 5: DWCC Load ── */}
        {activeSection === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>DWCC Load Distribution</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Radar chart */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#cbd5e1' }}>DWCC Load Radar (% of 3 TPD)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={DWCC_RADAR}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="dwcc" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Radar name="Load %" dataKey="load" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Capacity" dataKey="capacity" stroke="#475569" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Load cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DWCC_RADAR.map((d, i) => {
                  const statusColor = d.load >= 90 ? '#ef4444' : d.load >= 70 ? '#eab308' : '#22c55e';
                  const statusLabel = d.load >= 90 ? 'CRITICAL' : d.load >= 70 ? 'WARNING' : 'NORMAL';
                  return (
                    <motion.div key={d.dwcc} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${statusColor}22` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <strong style={{ fontSize: 13 }}>{d.dwcc}</strong>
                        <span style={{ fontSize: 10, background: statusColor + '22', color: statusColor, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{statusLabel}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.load}%`, borderRadius: 3, background: statusColor, transition: 'width 0.6s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#64748b' }}>
                        <span>{Math.round(d.load * 30)} kg / 3000 kg</span>
                        <span style={{ fontWeight: 600, color: statusColor }}>{d.load}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
