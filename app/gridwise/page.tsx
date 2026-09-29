'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import gridData from '@/public/data/district_grid_zones.json';
import dynamic from 'next/dynamic';

const GridZoneMap = dynamic(() => import('@/components/map/GridZoneMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading District Grid Map...</p>
      </div>
    </div>
  ),
});

type Zone = typeof gridData.zones[number];

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; fill: string; dot: string }> = {
  High:   { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-600',    fill: '#e11d48', dot: 'bg-rose-500' },
  Medium: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-600',   fill: '#d97706', dot: 'bg-amber-500' },
  Low:    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: '#059669', dot: 'bg-emerald-500' },
};

export default function GridWisePage() {
  const zones = gridData.zones as Zone[];
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [filterType, setFilterType] = useState<'All' | 'Urban' | 'Rural'>('All');
  const [sortKey, setSortKey] = useState<'waste_tons_day' | 'population' | 'buildings' | 'area_sqkm'>('waste_tons_day');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // Summary stats
  const totalBuildings = useMemo(() => zones.reduce((a, z) => a + z.buildings, 0), [zones]);
  const totalPop = useMemo(() => zones.reduce((a, z) => a + z.population, 0), [zones]);
  const totalWaste = useMemo(() => zones.reduce((a, z) => a + z.waste_tons_day, 0), [zones]);
  const totalArea = useMemo(() => zones.reduce((a, z) => a + z.area_sqkm, 0), [zones]);
  const urbanZones = useMemo(() => zones.filter(z => z.is_urban), [zones]);
  const ruralZones = useMemo(() => zones.filter(z => !z.is_urban), [zones]);

  const riskCounts = useMemo(() => ({
    High: zones.filter(z => z.risk === 'High').length,
    Medium: zones.filter(z => z.risk === 'Medium').length,
    Low: zones.filter(z => z.risk === 'Low').length,
  }), [zones]);

  // Filter & Sort
  const processed = useMemo(() => {
    let result = [...zones];
    if (filterRisk !== 'All') result = result.filter(z => z.risk === filterRisk);
    if (filterType === 'Urban') result = result.filter(z => z.is_urban);
    if (filterType === 'Rural') result = result.filter(z => !z.is_urban);
    result.sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return result;
  }, [zones, filterRisk, filterType, sortKey, sortDir]);

  // Waste distribution chart
  const wasteDistChart = useMemo(() => {
    return [
      { name: 'Urban (CMC)', value: Number(urbanZones.reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)), fill: '#00d4aa' },
      { name: 'Rural', value: Number(ruralZones.reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)), fill: '#64748b' },
    ];
  }, [urbanZones, ruralZones]);

  // Risk-wise waste chart
  const riskWasteChart = useMemo(() => {
    return [
      { name: 'High Risk', value: Number(zones.filter(z => z.risk === 'High').reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)), fill: '#e11d48' },
      { name: 'Medium Risk', value: Number(zones.filter(z => z.risk === 'Medium').reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)), fill: '#d97706' },
      { name: 'Low Risk', value: Number(zones.filter(z => z.risk === 'Low').reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)), fill: '#059669' },
    ];
  }, [zones]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8 }}
        className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8"
      >

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: Page Header                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-teal-600 tracking-tight mb-2">
              District Grid-Wise Analysis
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xl text-slate-500 font-light">Udupi District, Karnataka</span>
              <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full font-mono tracking-wider">
                {zones.length} zones mapped - 2km grid
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white shadow-sm border border-slate-200 px-5 py-3 rounded-2xl flex flex-col min-w-[120px]">
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">Total Zones</span>
              <span className="text-2xl font-black text-slate-900">{zones.length}</span>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 px-5 py-3 rounded-2xl flex flex-col min-w-[120px]">
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">Area</span>
              <span className="text-2xl font-black text-teal-600">{totalArea.toFixed(0)} km2</span>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 px-5 py-3 rounded-2xl flex flex-col min-w-[120px]">
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">Population</span>
              <span className="text-2xl font-black text-slate-900">{totalPop.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 px-5 py-3 rounded-2xl flex flex-col min-w-[120px]">
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">Daily Waste</span>
              <span className="text-2xl font-black text-rose-600">{totalWaste.toFixed(1)}T</span>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: Two-Column Layout (LEFT Map, RIGHT Analytics)      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN (55%) - Map + Context */}
          <div className="w-full lg:w-[55%] flex flex-col gap-8">

            {/* Interactive Grid Map */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Udupi District Grid Map</h2>
                <span className="bg-teal-50 border border-teal-200 text-teal-600 text-sm font-bold px-4 py-2 rounded-lg">
                  District-Wide - MapLibre GL
                </span>
              </div>
              
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <GridZoneMap
                  selectedZoneId={selectedZone?.zone_id || null}
                  onZoneClick={(zoneId) => {
                    const z = zones.find(z => z.zone_id === zoneId);
                    if (z) setSelectedZone(z);
                  }}
                />
              </div>
              
              <p className="text-slate-500 text-sm font-light text-center mt-4">
                Risk-coded grid zones across entire Udupi District - Ward boundaries shown in color - Click any zone for details
              </p>
            </motion.div>

            {/* Risk Profile Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold mb-4 text-teal-600">District Risk Profile</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-light mb-6">
                Udupi District is divided into <strong className="text-slate-900">{zones.length} grid zones</strong> at 2km resolution, covering <strong className="text-slate-900">{totalArea.toFixed(0)} sq km</strong> with <strong className="text-slate-900">{totalPop.toLocaleString('en-IN')} residents</strong>. 
                Daily waste generation: <strong className="text-teal-600">{totalWaste.toFixed(1)} tons</strong>. 
                Urban CMC zones: <strong className="text-slate-900">{urbanZones.length}</strong> | Rural zones: <strong className="text-slate-900">{ruralZones.length}</strong>.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['High', 'Medium', 'Low'] as const).map(risk => {
                  const c = RISK_COLORS[risk];
                  const count = riskCounts[risk];
                  const zns = zones.filter(z => z.risk === risk);
                  const waste = zns.reduce((a, z) => a + z.waste_tons_day, 0);
                  return (
                    <button
                      key={risk}
                      onClick={() => setFilterRisk(filterRisk === risk ? 'All' : risk)}
                      className={`${c.bg} p-4 rounded-2xl border-2 transition-all hover:shadow-md ${filterRisk === risk ? c.border : 'border-transparent'}`}
                    >
                      <div className={`${c.text} font-black text-xl mb-1`}>{count} zones</div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{risk} Risk - {waste.toFixed(1)}T/day</div>
                      {filterRisk === risk && (
                        <div className={`mt-2 text-[10px] font-bold ${c.text}`}>Click to clear</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN (45%) - Analytics */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8">

            {/* Urban vs Rural Waste Distribution */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-slate-900">Waste: Urban vs Rural</h2>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={wasteDistChart} 
                    layout="vertical" 
                    margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 13 }}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.05)'}}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: any) => [`${value}T/day`, 'Waste']}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={40}>
                      {wasteDistChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="value" position="right" fill="#0f172a" fontSize={13} fontFamily="monospace" formatter={(v: any) => `${v}T`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Risk-wise Waste Distribution */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-slate-900">Waste by Risk Level</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={riskWasteChart} 
                    layout="vertical" 
                    margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 13 }}
                      width={110}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.05)'}}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: any) => [`${value}T/day`, 'Waste']}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={40}>
                      {riskWasteChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="value" position="right" fill="#0f172a" fontSize={13} fontFamily="monospace" formatter={(v: any) => `${v}T`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Zone Rankings Table */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg flex-1 flex flex-col"
            >
              <div className="p-6 pb-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Zone Rankings</h2>
                  <div className="flex gap-1.5">
                    {['All', 'High', 'Medium', 'Low'].map(r => (
                      <button
                        key={r}
                        onClick={() => setFilterRisk(r)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          filterRisk === r 
                            ? 'bg-teal-500 text-slate-900 shadow-sm' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['All', 'Urban', 'Rural'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        filterType === t 
                          ? 'bg-teal-500 text-slate-900 shadow-sm' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto flex-grow max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-teal-50 text-teal-900 font-bold border-y border-teal-100 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 cursor-pointer hover:text-teal-700" onClick={() => handleSort('waste_tons_day')}>
                        Zone
                      </th>
                      <th className="py-3 px-4 text-center">Type</th>
                      <th className="py-3 px-4 text-right cursor-pointer hover:text-teal-700" onClick={() => handleSort('buildings')}>
                        Bldgs {sortKey === 'buildings' ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer hover:text-teal-700" onClick={() => handleSort('population')}>
                        Pop. {sortKey === 'population' ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer hover:text-teal-700" onClick={() => handleSort('waste_tons_day')}>
                        Waste {sortKey === 'waste_tons_day' ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th className="py-3 px-4 text-right">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processed.slice(0, 100).map((z, idx) => {
                      const rc = RISK_COLORS[z.risk] || RISK_COLORS.Low;
                      const isSelected = selectedZone?.zone_id === z.zone_id;
                      return (
                        <tr 
                          key={z.zone_id}
                          onClick={() => setSelectedZone(isSelected ? null : z)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-teal-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-teal-50/50`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-900" style={{ borderLeft: isSelected ? '3px solid #0d9488' : '3px solid transparent' }}>{z.zone_id}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${z.is_urban ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                              {z.is_urban ? 'Urban' : 'Rural'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">{z.buildings}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">{z.population.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">{z.waste_tons_day.toFixed(3)}T</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${rc.bg} ${rc.border} ${rc.text}`}>
                              {z.risk}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-mono tracking-wide">
                Showing {Math.min(processed.length, 100)} of {processed.length} zones | Total: {totalWaste.toFixed(1)}T/day across {zones.length} zones
              </div>
            </motion.div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: Spatial Distribution Insights                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-200 pb-4">Spatial Distribution Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">&#128308;</span>
                <h3 className="text-lg font-bold text-rose-600">High-Risk Zones</h3>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                <strong className="text-slate-900">{riskCounts.High} zones</strong> generate {zones.filter(z => z.risk === 'High').reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)}T/day, accounting for {((zones.filter(z => z.risk === 'High').reduce((a, z) => a + z.waste_tons_day, 0) / totalWaste) * 100).toFixed(0)}% of total district waste. These zones require daily collection routes and priority scheduling.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">&#127968;</span>
                <h3 className="text-lg font-bold text-teal-600">Urban CMC Core</h3>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                <strong className="text-slate-900">{urbanZones.length} urban zones</strong> within Udupi CMC ward boundaries generate {urbanZones.reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)}T/day. These zones have colored ward boundaries visible on the map and are priority areas for door-to-door collection.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">&#127795;</span>
                <h3 className="text-lg font-bold text-emerald-600">Rural District</h3>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                <strong className="text-slate-900">{ruralZones.length} rural zones</strong> across the broader Udupi District generate {ruralZones.reduce((a, z) => a + z.waste_tons_day, 0).toFixed(1)}T/day. These areas require cluster-based collection with transfer stations for efficient waste management.
              </p>
            </div>

          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: District Summary                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">District Coverage Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Zones', value: zones.length.toString(), color: 'text-slate-900' },
              { label: 'Urban (CMC)', value: urbanZones.length.toString(), color: 'text-teal-600' },
              { label: 'Rural', value: ruralZones.length.toString(), color: 'text-slate-600' },
              { label: 'High Risk', value: riskCounts.High.toString(), color: 'text-rose-600' },
              { label: 'Medium Risk', value: riskCounts.Medium.toString(), color: 'text-amber-600' },
              { label: 'Low Risk', value: riskCounts.Low.toString(), color: 'text-emerald-600' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
                <div className={`text-2xl font-black ${item.color} mb-1`}>{item.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
