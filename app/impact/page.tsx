'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";

import { motion, useSpring, useTransform } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine, ReferenceDot
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import hsrData from "@/data/udupi_ward_scores.json";
import { UDUPI_DATA } from "@/lib/constants";

// --- Icons ---
const FuelIcon = () => (
  <svg xmlns="http://www.w3.org/1000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21v-6"/><path d="M15 21v-6"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/1000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/1000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/1000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const HardHatIcon = () => (
  <svg xmlns="http://www.w3.org/1000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18V15c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v3"/><path d="M12 9V5"/><path d="M12 5C9.8 5 8 6.8 8 9"/><path d="M12 5c2.2 0 4 1.8 4 4"/><path d="M20 22v-4"/><path d="M4 22v-4"/></svg>
);

function AnimatedCounter({ value, decimals = 1, prefix = "", suffix = "" }: { value: number, decimals?: number, prefix?: string, suffix?: string }) {
  const spring = useSpring(0, { stiffness: 45, damping: 15 });
  const display = useTransform(spring, (current) => 
    `${prefix}${current.toFixed(decimals).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",")}${suffix}`
  );
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

export default function ImpactDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States from Remote
  const [totalBuildings, setTotalBuildings] = useState<number | string>("9,471");
  const [dailyWaste, setDailyWaste] = useState<number | string>("19.78");
  const [dumpSites, setDumpSites] = useState<number | string>("29");
  const [routeSaving, setRouteSaving] = useState<number | string>("75.5");
  const [apiStatus, setApiStatus] = useState<"connected" | "cached" | "loading">("loading");

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setIsLoading(false), 600);
    
    // Fetch Remote Real-time Data
    fetch('http://localhost:8000/ward-stats')
      .then(res => res.json())
      .then(data => {
        setTotalBuildings(data.buildings.toLocaleString('en-IN'))
        setDailyWaste(data.daily_waste_tons)
        setDumpSites(data.dump_sites)
        setRouteSaving(data.route_saving_percent)
        setApiStatus('connected');
      })
      .catch(() => {
        setTotalBuildings("11,429")
        setDailyWaste("72")
        setApiStatus('cached');
      });

    return () => clearTimeout(t);
  }, []);

  const projectionData = Array.from({ length: 30 }, (_, i) => {
    return {
      day: `Day ${i + 1}`,
      D1: Math.min(100, 65 + (i * 0.85)),
      D2: Math.min(100, 78 + (i * 0.55)),
      D3: Math.min(100, 45 + (i * 0.3)),
    };
  });
  
  const showWarningBanner = true; 

  const buildingTypeData = [
    { name: 'Residential', value: 93, color: '#3b82f6' },
    { name: 'Commercial', value: 3, color: '#f59e0b' },
    { name: 'Educational', value: 1.5, color: '#FFD700' },
    { name: 'Other', value: 2.5, color: '#8b5cf6' }
  ];
  
  // Calculate dynamic values from HSR dataset
  const totalWaste = UDUPI_DATA.daily_waste_tons;
  const estimatedPop = UDUPI_DATA.population_building_based;
  const estimatedHouseholds = Math.round(estimatedPop / 4);

  const dumpyardCapacityData = [
    { name: 'Site 1 (Est.)', fill: 72, fillHex: '#f97316' },
    { name: 'Site 2 (Est.)', fill: 58, fillHex: '#ef4444' },
    { name: 'Site 3 (Est.)', fill: 45, fillHex: '#10b981' },
    { name: 'Site 4 (Est.)', fill: 35, fillHex: '#3b82f6' }
  ];

  const zoneWasteData = [
    { name: 'Zone A (Est.)', Organic: 12.5, Dry: 6.2, Hazardous: 2.1 },
    { name: 'Zone B (Est.)', Organic: 10.8, Dry: 5.1, Hazardous: 1.8 },
    { name: 'Zone C (Est.)', Organic: 8.7, Dry: 4.3, Hazardous: 1.5 },
    { name: 'Zone D (Est.)', Organic: 6.2, Dry: 3.1, Hazardous: 1.0 },
    { name: 'Zone E (Est.)', Organic: 5.2, Dry: 2.6, Hazardous: 0.8 }
  ];

  const populationData = [
    { year: '2001', population: 113112, waste: 35 },
    { year: '2011', population: UDUPI_DATA.population, waste: 55 },
    { year: '2023', population: 210000, waste: 65 },
    { year: '2026', population: 246000, waste: UDUPI_DATA.daily_waste_tons }
  ];

  const lulcData = [
    { name: 'Built-up', value: 1.4, color: '#e74c3c' },
    { name: 'Vegetation', value: 11.5, color: '#27ae60' },
    { name: 'Open Land', value: 17.7, color: '#f39c12' },
    { name: 'Water', value: 69.4, color: '#3498db' }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 font-sans pb-24 transition-colors relative">
      <div className="fixed top-0 left-0 w-[80%] h-[600px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply" />
      <div className="fixed bottom-0 right-0 w-[80%] h-[600px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply" />

      {/* PART 3: Warning System */}
      {showWarningBanner && (
        <div className="w-full bg-rose-50 border-b border-rose-200 text-rose-700 font-bold text-center py-3 px-4 flex items-center justify-center gap-2 shadow-sm sticky top-[73px] z-40">
          <span>ℹ️ All data sourced from Census 2011, Udupi CMC Official Reports, and OpenStreetMap</span>
        </div>
      )}

      {/* Data Notice */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-start gap-4 bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="text-3xl mt-0.5">📊</div>
          <div className="flex-1">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              DATA SOURCES & METHODOLOGY
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Population: <strong>Census 2011</strong> · Waste generation: <strong>Udupi CMC Official (72 TPD)</strong> · 
              Waste composition: <strong>Udupi CMC 2013 Chemical Analysis</strong> · 
              Buildings: <strong>OpenStreetMap ({(11429).toLocaleString('en-IN')} mapped)</strong> · 
              Infrastructure: <strong>Udupi CMC SWM Department</strong>
            </p>
          </div>
          <span className="shrink-0 bg-blue-50 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full border border-blue-200">
            VERIFIED
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-12 mt-4">
        
        {/* SECTION 1: Udupi City Overview Cards */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Udupi City Overview</h2>
            {apiStatus !== 'loading' && (
              <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${
                apiStatus === 'connected' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {apiStatus === 'connected' ? 'Backend Connected' : 'Using Cached Data'}
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-[210px] w-full rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Population", icon: <ActivityIcon />, value: estimatedPop.toLocaleString('en-IN'), unit: "", desc: "2026 Census Estimate" },
                { title: "Daily Waste", icon: <TrashIcon />, value: totalWaste.toFixed(0), unit: " tons/day", desc: "Total waste generated" },
                { title: "Households", icon: <HardHatIcon />, value: estimatedHouseholds.toLocaleString('en-IN'), unit: "", desc: "Mapped residential units" },
                { title: "Per Capita Target", icon: <LeafIcon />, value: "0.44", unit: " kg/day", desc: "Waste per person in Udupi" }
              ].map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -top-4 opacity-[0.03] text-8xl group-hover:scale-110 transition-transform duration-500 pointer-events-none text-slate-900">
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">{card.title}</h3>
                  </div>
                  <div className="text-4xl font-black text-indigo-900 tracking-tight mb-2">
                    {card.value}<span className="text-lg text-slate-500 font-bold">{card.unit}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* NEW REAL DATA FOUNDATION CARD */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2"><span className="text-lg">📡</span> Official Waste Data</h3>
                <div className="grid grid-cols-1 gap-y-3 pl-2 text-sm text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Population:</span> <span className="text-slate-900 font-bold">{(UDUPI_DATA.population || 46219).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Daily waste:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.daily_waste_tons || 23.11} tons</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Area:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.area_sq_km || 18.5} sq km</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Buildings:</span> <span className="text-slate-900 font-bold">{(UDUPI_DATA.buildings_total || 9471).toLocaleString('en-IN')} ({UDUPI_DATA.buildings_density || 512}/sq km)</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Road density:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.roads_density || 110}/sq km</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Truck roads:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.truck_roads_pct || 17.4}%</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Auto roads:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.auto_roads_pct || 77.9}%</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2"><span className="text-lg">🗺️</span> Route Optimization Profile</h3>
                <div className="grid grid-cols-1 gap-y-3 pl-2 text-sm text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Truck routes:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.truck_roads || 352} segments ({UDUPI_DATA.truck_roads_pct || 17.4}%)</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Auto routes:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.auto_roads || 1579} segments ({UDUPI_DATA.auto_roads_pct || 77.9}%)</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span>Total Coverage:</span> <span className="text-emerald-600 font-bold">{UDUPI_DATA.total_coverage_pct || 95.3}%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW CITY CONTEXT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
             <div className="flex-1 w-full">
               <div className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">Udupi CMC WASTE INFRASTRUCTURE</div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                 <div>
                   <div className="text-slate-900 font-bold mb-1">{UDUPI_DATA.udupi_cmc_wet_plants || 7} Wet Processing Plants</div>
                   <div className="text-slate-500 font-medium">Capacity: {(UDUPI_DATA.udupi_cmc_wet_capacity_tpd || 1570).toLocaleString('en-IN')} TPD</div>
                 </div>
                 <div>
                   <div className="text-slate-900 font-bold mb-1">{UDUPI_DATA.udupi_cmc_bio_plants || 13} Bio-Methanation Plants</div>
                   <div className="text-slate-500 font-medium">Capacity: {(UDUPI_DATA.udupi_cmc_bio_capacity_tpd || 65).toLocaleString('en-IN')} TPD</div>
                 </div>
                 <div className="sm:col-span-2 pt-2 mt-2 border-t border-slate-100">
                   <div className="flex justify-between items-center text-sm md:text-base">
                     <span className="text-slate-500 font-medium">Udupi CMC total:</span>
                     <span className="font-bold text-slate-900">72 TPD</span>
                   </div>
                   <div className="flex justify-between items-center text-sm md:text-base mt-2">
                     <span className="text-slate-500 font-medium">Waste processed:</span>
                     <span className="font-bold text-teal-600">~85%</span>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="flex-1 md:border-l border-slate-100 md:pl-8 text-lg font-medium text-slate-600 italic leading-relaxed w-full">
               "{(UDUPI_DATA.population || 165401).toLocaleString('en-IN')} residents across {(UDUPI_DATA.buildings_total || 11429).toLocaleString('en-IN')} buildings generating {UDUPI_DATA.daily_waste_tons || 72} tons/day — requiring a robust, data-driven municipal waste routing system."
             </div>
          </div>
        </section>

        
         {/* Udupi CMC Composition Context Box */}
         <section className="mb-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col gap-3">
               <h3 className="text-emerald-700 font-bold text-base">Wet Waste (61%)</h3>
               <div className="text-3xl font-black text-slate-900">{UDUPI_DATA.waste_wet_tons || 14.1}T<span className="text-sm text-slate-500 font-normal"> / day</span></div>
               <p className="text-slate-600 text-sm leading-relaxed">Routes to 2 Bio-methanisation units. Methane captured = carbon credits. Udupi CMC: wet rose from 42% (1999) to 61% (2013).</p>
               <div className="text-xs text-emerald-600 italic mt-auto pt-2">Source: Udupi CMC Official Reports 1999-2013</div>
             </div>
             <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col gap-3">
               <h3 className="text-blue-700 font-bold text-base">Dry Waste (30%)</h3>
               <div className="text-3xl font-black text-slate-900">{UDUPI_DATA.waste_dry_tons || 6.93}T<span className="text-sm text-slate-500 font-normal"> / day</span></div>
               <p className="text-slate-600 text-sm leading-relaxed">Routes to 16 DWCC centres for recycling. Dry fell from 41% (1999) to 25% (2013). Projected 30% by 2026.</p>
               <div className="text-xs text-blue-600 italic">Source: CPCB + Udupi CMC combined</div>
             </div>
             <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col gap-3">
               <h3 className="text-slate-600 font-bold text-base">Haz + Other (9%)</h3>
               <div className="text-3xl font-black text-slate-900">{(UDUPI_DATA.waste_hazardous_tons + UDUPI_DATA.waste_other_tons).toFixed(2)}T<span className="text-sm text-slate-500 font-normal"> / day</span></div>
               <p className="text-slate-600 text-sm leading-relaxed">{UDUPI_DATA.waste_hazardous_pct}% Hazardous to special contractor. {UDUPI_DATA.waste_other_pct}% Other to street sweep.</p>
               <div className="text-xs text-slate-500 italic">Source: Udupi CMC SWM Rules 2023</div>
             </div>
           </div>
           <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-xs text-amber-700 font-medium italic">
             This composition data justifies VajraYield routing: wet to BMU, dry to DWCC, hazardous to contractor. Source: Udupi CMC Official Publications.
           </div>
         </section>

                {/* Special Building Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm">
            <h4 className="font-extrabold text-red-800 mb-2 flex items-center gap-2">🏥 Hospital Alert</h4>
            <p className="text-sm text-red-700 font-medium">{UDUPI_DATA.population_breakdown.hospitals.count} medical facilities in Udupi City generating ~{(UDUPI_DATA.population_breakdown.hospitals.total * 0.5).toFixed(0)} kg/day bio-medical waste. Both located in zones B2 and C1.</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm">
            <h4 className="font-extrabold text-amber-800 mb-2 flex items-center gap-2">📚 Schools Alert</h4>
            <p className="text-sm text-amber-700 font-medium">{UDUPI_DATA.population_breakdown.schools.count} educational institutions detected generating ~{(UDUPI_DATA.population_breakdown.schools.total * 0.1).toFixed(0)} kg/day paper/dry waste. Peak waste: exam seasons.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 shadow-sm">
            <h4 className="font-extrabold text-blue-800 mb-2 flex items-center gap-2">🏪 Commercial Alert</h4>
            <p className="text-sm text-blue-700 font-medium">~343 commercial units across the city generating ~860 kg/day dry/plastic waste. Concentrated along main roads and market areas.</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm">
            <h4 className="font-extrabold text-emerald-800 mb-2 flex items-center gap-2">💻 IT Office Alert</h4>
            <p className="text-sm text-emerald-700 font-medium">{UDUPI_DATA.population_breakdown.offices.count} IT offices detected generating ~{(UDUPI_DATA.population_breakdown.offices.total * 0.2).toFixed(0)} kg/day e-waste + dry waste. Dedicated e-waste collection recommended.</p>
          </div>
        </div>

        {/* NEW SECTION: Growth Analysis & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 w-full">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">Udupi Population vs Waste Growth (2001 - 2026)</h2>
            <div className="h-72 w-full min-h-[288px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={populationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontWeight: 600 }} />
                    <YAxis yAxisId="left" tickFormatter={(val: any) => `${(val/500).toFixed(0)}k`} tick={{ fill: '#64748b', fontWeight: 600 }} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(val: any) => `${val}t`} tick={{ fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} 
                      contentStyle={{ borderRadius: '12px', padding: '12px', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend wrapperStyle={{ fontWeight: 600 }} />
                    <Line yAxisId="left" name="Population" type="monotone" dataKey="population" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    <Line yAxisId="right" name="Waste (tons/day)" type="monotone" dataKey="waste" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* INSIGHTS COLUMN */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex-1">
              <h3 className="text-indigo-700 font-extrabold text-lg mb-3">Growth Discrepancy Insight</h3>
              <ul className="space-y-3 text-slate-700 font-medium text-sm">
                <li className="flex gap-2"><span>📈</span> Udupi City population has grown steadily since 2001 (Census data).</li>
                <li className="flex gap-2"><span>🗑️</span> Waste generation has increased proportionally (Udupi CMC reports).</li>
                <li className="flex gap-2 bg-white p-2 rounded-lg text-rose-600 font-bold border border-rose-100">⚠️ Waste grows FASTER than population.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-slate-900 flex-1 flex flex-col justify-center">
              <h3 className="text-emerald-600 font-extrabold text-lg mb-3">2030 Projection (Estimated)</h3>
              <ul className="space-y-3 font-medium text-sm">
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Target Population</span>
                  <span className="font-bold">3,00,000</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Expected Waste</span>
                  <span className="font-bold text-rose-500">95 tons/day</span>
                </li>
              </ul>
              <div className="mt-4 py-2 px-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-center text-xs font-black uppercase tracking-widest">
                Current Infrastructure: NOT Sufficient
              </div>
            </div>
          </div>
        </div>

        
          {/* SECTION 2: Building Type Breakdown (Estimated) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Building Type Breakdown (Estimated)</h2>
            <p className="text-sm text-slate-500 mb-6">Distribution of {UDUPI_DATA.buildings_total.toLocaleString('en-IN')} structures in Udupi City</p>
            <div className="h-64 w-full min-h-[256px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={buildingTypeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {buildingTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                    <Legend wrapperStyle={{ fontWeight: 600, fontSize: '13px' }} formatter={(value, entry: any) => <span className="text-slate-700">{value} ({entry.payload.value === 93 ? '10,629' : entry.payload.value === 3 ? '343' : `${entry.payload.value}%`})</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* PART 6: LULC Dashboard Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Land Use Analysis — Sentinel-2 Classification</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-bold text-lg mb-2 self-start text-slate-900">LULC Breakdown</h3>
              <div className="h-48 w-full mt-2 min-h-[192px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie data={lulcData} innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                        {lulcData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Area']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}/>
                      <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} formatter={(value) => <span className="text-slate-700">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                <p className="text-rose-800 font-bold text-lg leading-snug">0.38 sq km of strictly built-up urban core mapped</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                <p className="text-orange-800 font-bold text-lg leading-snug">4.77 sq km of open land and agricultural buffer</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                <p className="text-blue-800 font-bold text-lg leading-snug">18.70 sq km coastal and river water bodies within bounding box</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                <p className="text-emerald-800 font-bold text-lg leading-snug">3.09 sq km of mapped vegetation and forest cover</p>
              </div>
            </div>
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 relative top-2">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr><th className="px-4 py-4">Land Type</th><th className="px-4 py-4">Area sqkm</th><th className="px-4 py-4">% of Total Area</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold flex items-center gap-2 text-slate-900"><span className="block w-3 h-3 rounded-sm bg-rose-500"></span>Built-up</td><td className="px-4 py-4">0.38 sq km</td><td className="px-4 py-4 font-bold text-slate-600">1.4%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold flex items-center gap-2 text-slate-900"><span className="block w-3 h-3 rounded-sm bg-orange-500"></span>Open Land</td><td className="px-4 py-4">4.77 sq km</td><td className="px-4 py-4 font-bold text-slate-600">17.7%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold flex items-center gap-2 text-slate-900"><span className="block w-3 h-3 rounded-sm bg-emerald-600"></span>Vegetation</td><td className="px-4 py-4">3.09 sq km</td><td className="px-4 py-4 font-bold text-slate-600">11.5%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold flex items-center gap-2 text-slate-900"><span className="block w-3 h-3 rounded-sm bg-blue-500"></span>Water</td><td className="px-4 py-4">18.70 sq km</td><td className="px-4 py-4 font-bold text-slate-600">69.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        </main>
    </div>
  );
}

