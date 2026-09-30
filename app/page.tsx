'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UDUPI_DATA } from '@/lib/constants';
import { 
  ArrowRight, 
  Satellite, 
  Globe, 
  CloudRain, 
  Truck, 
  DollarSign, 
  Leaf, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Animated counter hook
function useCounter(target: number, duration = 2.2, decimals = 0) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN'),
  );
  const [display, setDisplay] = useState(decimals > 0 ? '0.0' : '0');

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    const ctrl = animate(motionVal, target, {
      duration,
      ease: [0.22, 0.61, 0.36, 1],
    });
    return ctrl.stop;
  }, [motionVal, target, duration]);

  return display;
}

// ============================================
// FLOATING SCAN TEXT (bottom-left telemetry)
// ============================================
function ScanText() {
  const lines = [
    'SCANNING UDUPI CMC SECTORS...',
    '704 HA REMEDIATION ZONE MAPPED',
    '6 ZONAL DWCCS CONNECTED',
    'VRP ENGINE OPTIMIZING 132KM → 32KM...',
    '9,471 BUILDINGS CENSUS-INDEXED',
    'SATELLITE SPECTRAL PASS COMPLETE',
  ];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let charIdx = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      if (charIdx <= lines[index].length) {
        setText(lines[index].slice(0, charIdx));
        charIdx++;
        timeout = setTimeout(type, 35);
      } else {
        timeout = setTimeout(() => {
          setFading(true);
          timeout = setTimeout(() => {
            setFading(false);
            setIndex((prev) => (prev + 1) % lines.length);
          }, 800);
        }, 1500);
      }
    };
    type();

    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div
      className="hidden md:flex fixed bottom-5 left-72 z-20 font-mono text-[11px] font-bold tracking-widest transition-opacity duration-700 items-center gap-2 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs backdrop-blur-sm"
      style={{ color: '#059669', opacity: fading ? 0 : 1 }}
    >
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      {text}
    </div>
  );
}

// Clean White Theme Stat Card
function StatCard({ 
  value, 
  prefix, 
  suffix, 
  label, 
  subtext, 
  delay 
}: { 
  value: string; 
  prefix?: string; 
  suffix?: string; 
  label: string; 
  subtext?: string; 
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex flex-col items-center p-6 rounded-2xl min-w-[220px] bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-center group"
    >
      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tight text-emerald-700 mb-1 group-hover:scale-105 transition-transform" style={{ fontFamily: 'var(--font-space-mono)' }}>
        {prefix}{value}{suffix}
      </span>
      <span className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-800">
        {label}
      </span>
      {subtext && (
        <span className="mt-1.5 text-[11px] font-medium text-slate-500 max-w-[190px] leading-relaxed">
          {subtext}
        </span>
      )}
    </motion.div>
  );
}

// Features Grid 
const FEATURES = [
  { title: 'Satellite AI', desc: 'Auto-detect illegal dumps using Sentinel-2 visible spectrum imagery.', icon: '🛰️', tag: 'Orbital Telemetry' },
  { title: 'Digital Twin', desc: 'Simulate the impact of policy decisions ward-by-ward before deployment.', icon: '🌐', tag: 'Prescriptive Model' },
  { title: 'Methane Mapping', desc: 'Monitor atmospheric methane buildup and calculate carbon offsets.', icon: '☁️', tag: 'CCTS 2023 Standard' },
  { title: 'Route Optimization', desc: 'Cut millions in fuel waste by dynamically rerouting collection vehicles.', icon: '🚛', tag: 'Clarke-Wright VRP' },
  { title: 'Economic Analytics', desc: 'Translate environmental impact directly into quantifiable rupees saved.', icon: '💰', tag: 'Municipal Ledger' },
  { title: 'Carbon Intelligence', desc: 'Track CO2e captures and carbon credit valuation across the ward.', icon: '🌿', tag: 'ESG Certification' },
];

export default function Home() {
  const population = useCounter(UDUPI_DATA.population_building_based, 2.4, 0);
  const totalWaste = useCounter(UDUPI_DATA.daily_waste_tons, 2.6, 1);
  const routeSaving = useCounter(UDUPI_DATA.route_improvement_pct, 2.0, 1);
  const savedCrores = useCounter(UDUPI_DATA.annual_savings_total_cr, 2.0, 1);

  return (
    <div className="min-h-full bg-slate-50/60 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      <ScanText />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-16 max-w-6xl mx-auto text-center">
        {/* Statutory Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-emerald-50 border border-emerald-200/80 shadow-xs"
        >
          <span className="text-sm">🛰️</span>
          <span className="text-xs font-black tracking-widest text-emerald-800 uppercase">
            UDUPI CMC • SWM 2026 STATUTORY ENGINE
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 text-slate-900"
        >
          Vajra<span className="text-emerald-600">Yield</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-2xl font-black tracking-tight mb-4 text-emerald-700 max-w-3xl"
        >
          Spatial Digital Twin • Prescriptive Logistics • Statutory Compliance
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-sm sm:text-base md:text-lg max-w-2xl mb-12 leading-relaxed text-slate-600 font-medium"
        >
          Satellite + Census intelligence for Udupi City&apos;s 1,65,401 residents across 7 sectors, 68.23 sq km, 9,471 buildings.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-14"
        >
          <Link href="/dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-7 rounded-xl shadow-sm text-sm flex items-center gap-2">
              Launch Command Center <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold h-11 px-6 rounded-xl text-sm flex items-center gap-2">
              Explore 3D Digital Twin Map
            </Button>
          </Link>
        </motion.div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl">
          <StatCard value={population} label="Residents (2025)" subtext="Building × Census 2011 Karnataka" delay={0.65} />
          <StatCard value={totalWaste} suffix=" Tons" label="Daily waste generated" subtext="CPCB 0.5kg/person · 9,471 buildings" delay={0.75} />
          <StatCard value={routeSaving} suffix="%" label="Route optimization" subtext="132km → 32km · 2,027 road segments" delay={0.85} />
          <StatCard value={savedCrores} prefix="₹" suffix=" Cr" label="Annual value identified" subtext="₹4.2Cr ops + ₹5.2Cr carbon credits" delay={0.95} />
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full border-t border-slate-200/80">
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs mb-3">
            AstraCity SWM Architecture
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Powered by Orbital Intelligence
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
            From 400 miles above to the streets, wards, and DWCCs of Udupi Municipal Council.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white border border-slate-200/90 p-7 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 group-hover:scale-105 transition-transform">
                    {f.icon}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 uppercase tracking-wide">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA Pitch Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border border-emerald-200/90 p-10 md:p-14 rounded-3xl shadow-xs relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-6 h-6" />
          </div>

          <p className="text-lg md:text-2xl font-bold text-slate-800 leading-snug mb-8 max-w-3xl mx-auto italic">
            &quot;Udupi generates 55 tons of waste every day. Without spatial intelligence, no one knows in real time where illegal dumps are forming... VajraYield calculates — to the rupee — how much money optimizations save the municipal council.&quot;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-emerald-600/15 text-sm flex items-center gap-2">
                Launch Municipal Operations Hub <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/routing">
              <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 px-6 rounded-xl text-sm">
                View VRP Routing Engine
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
