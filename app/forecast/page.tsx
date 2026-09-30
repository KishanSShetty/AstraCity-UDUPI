'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, Settings, Building, Building2, MapPin, Recycle, Truck, Info } from 'lucide-react';
import { UDUPI_DATA } from '@/lib/constants';

interface Festival {
  date: string;
  name: string;
}

const initialFestivals: Festival[] = [
  { date: '2026-01-14', name: 'Udupi Rathotsava (Makara Sankranti)' },
  { date: '2026-01-18', name: 'Paryaya' },
  { date: '2026-09-04', name: 'Astami Udupi (Krishna Janmashtami)' },
  { date: '2026-09-14', name: 'Ganesh Chaturthi' },
];

export default function ForecastPage() {
  const [mounted, setMounted] = useState(false);
  const [weatherLoaded, setWeatherLoaded] = useState(false);

  const [festivals, setFestivals] = useState<Festival[]>(initialFestivals);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newFestDate, setNewFestDate] = useState('');
  const [newFestName, setNewFestName] = useState('');


  const getFestivalName = (dateStr: string) => {
    const ymd = dateStr.split('T')[0];
    const found = festivals.find(f => f.date === ymd);
    return found ? found.name : null;
  };

  const BASE_WET = UDUPI_DATA.waste_wet_tons; 
  const BASE_DRY = UDUPI_DATA.waste_dry_tons;  
  const BASE_HAZ = UDUPI_DATA.waste_haz_tons;  

  const CAP_WET = Number((BASE_WET * 1.25).toFixed(1)); // Buffet limit
  const CAP_DRY = Number((BASE_DRY * 1.25).toFixed(1));

  // Initialize 10 days starting from today
  const createInitialDays = () => Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return {
      date: dayStr,
      day: dayName,
      is_weekend: isWeekend,
      temp: 28,
      rain: 0,
      is_festival: !!initialFestivals.find(f => f.date === dayStr),
    };
  });

  const [days, setDays] = useState(createInitialDays());

  // Sync festivals when user adds/removes them
  useEffect(() => {
    if (mounted) {
      setDays(prev => prev.map(d => {
        const ymd = d.date.split('T')[0];
        const isFest = !!festivals.find(f => f.date === ymd);
        return { ...d, is_festival: d.is_festival || isFest };
      }));
    }
  }, [festivals, mounted]);

  // Fetch real 10-day weather forecast from Open-Meteo API (free, no API key)
  useEffect(() => {
    setMounted(true);
    const UDUPI_LAT = 13.3409;
    const UDUPI_LON = 74.7421;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${UDUPI_LAT}&longitude=${UDUPI_LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=10`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.daily) {
          const { time, temperature_2m_max, precipitation_sum } = data.daily;
          setDays(prev => prev.map((d, i) => {
            const realDate = new Date(time[i]);
            return {
              ...d,
              date: time[i],
              day: realDate.toLocaleDateString('en-US', { weekday: 'short' }),
              is_weekend: realDate.getDay() === 0 || realDate.getDay() === 6,
              temp: Math.round(temperature_2m_max[i]),
              rain: Math.round(precipitation_sum[i]),
            };
          }));
          setWeatherLoaded(true);
        }
      })
      .catch(err => {
        console.error('Weather API failed, using defaults:', err);
        setWeatherLoaded(false);
      });
  }, []);

  // --- THE FORMULA PREDICTION MODEL ---
  const calculateDay = (d: ReturnType<typeof createInitialDays>[0]) => {
    let mult_wet = 1.0;
    let mult_dry = 1.0;

    // 1. M_weather
    if (d.rain > 20) mult_wet += 0.25;
    else if (d.rain > 0) mult_wet += 0.08;

    if (d.temp > 34) mult_dry += 0.12;

    // 2. M_festival
    if (d.is_festival) {
      mult_wet += 0.35;
      mult_dry += 0.15;
    }

    // 3. M_day (Weekend)
    if (d.is_weekend) {
      mult_wet += 0.10;
      mult_dry += 0.05;
    }


    const wet = Number((BASE_WET * mult_wet).toFixed(2));
    const dry = Number((BASE_DRY * mult_dry).toFixed(2));
    const total = Number((wet + dry + BASE_HAZ).toFixed(2));

    return {
      ...d,
      predicted_wet: wet,
      predicted_dry: dry,
      total_waste: total,
      is_overflow: wet > CAP_WET || dry > CAP_DRY
    };
  };

  const computedData = days.map(calculateDay);

  const updateDay = (index: number, field: string, value: any) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-teal-500/5 to-transparent pointer-none" />

      {/* Header */}
      <div className="relative border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link href="/impact" className="text-teal-600 font-bold hover:text-teal-500 transition-opacity">← Back</Link>
          <div className="w-[1px] h-4 bg-slate-300" />
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">
            🔮 10-Day Waste Forecast — Udupi
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20 relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📋 INPUT DASHBOARD (2/3 Grid) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Live Parameter Inputs</h2>
            <p className="text-sm text-slate-500 mb-6">
              {weatherLoaded ? (
                <>
                  ✅ Live weather data from Open-Meteo API (Udupi: 13.34°N, 74.74°E). Adjust sliders to override. <a href="https://api.open-meteo.com/v1/forecast?latitude=13.3409&longitude=74.7421&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=10" target="_blank" className="text-sky-500 hover:text-sky-600 underline font-bold ml-2">View Raw API Data →</a>
                </>
              ) : (
                '⏳ Loading weather data from Open-Meteo API...'
              )}
            </p>

            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 font-bold text-slate-700">Date</th>
                  <th className="px-3 py-3 font-bold text-slate-700">Temp (°C)</th>
                  <th className="px-3 py-3 font-bold text-slate-700">Rain (mm)</th>
                  <th className="px-3 py-3 font-bold text-slate-700">Festival</th>
                  <th className="px-3 py-3 font-bold text-slate-700">Total Waste</th>
                  <th className="px-3 py-3 font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {computedData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-slate-900 font-bold text-xs">
                      {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({d.day})
                      {d.is_weekend && <span className="block text-sky-600 text-[10px] uppercase tracking-wider mt-0.5 font-black">Weekend</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input type="range" min={20} max={40} step={1} value={d.temp} onChange={(e) => updateDay(i, 'temp', Number(e.target.value))} className="w-16 accent-teal-600" />
                        <span className="text-xs text-slate-600 font-bold w-5">{d.temp}°</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={50} step={1} value={d.rain} onChange={(e) => updateDay(i, 'rain', Number(e.target.value))} className="w-16 accent-emerald-600" />
                        <span className="text-xs text-slate-600 font-bold w-5">{d.rain}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={d.is_festival} onChange={(e) => updateDay(i, 'is_festival', e.target.checked)} className="accent-orange-500 w-4 h-4 cursor-pointer" />
                        {getFestivalName(d.date) && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold truncate max-w-[80px]" title={getFestivalName(d.date) ?? ''}>{getFestivalName(d.date)}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-black text-slate-900 text-xs">
                      {d.total_waste} T
                    </td>
                    <td className="px-3 py-3 text-[10px] font-bold">
                      {d.is_overflow ? <span className="text-red-600 uppercase">OVERLOAD</span> : <span className="text-emerald-600">Normal</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📈 REAL-TIME CHART RENDERING (1/3 Grid) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Live Formula Graph</h2>
            <p className="text-[11px] text-slate-500 mb-6 font-medium">Redraws instantly with parameter slider triggers.</p>
            
            <div className="h-64 w-full min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={computedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', fontWeight: 'bold' }} />
                  
                  <ReferenceLine y={CAP_WET} stroke="#ef4444" strokeDasharray="4 4" />
                  <ReferenceLine y={CAP_DRY} stroke="#f59e0b" strokeDasharray="4 4" />
                  
                  <Area name="Wet" type="monotone" dataKey="predicted_wet" stroke="#10b981" fill="#10b981" fillOpacity={0.1} stackId="1" />
                  <Area name="Dry" type="monotone" dataKey="predicted_dry" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Formula Multipliers Used</h3>
            <ul className="text-xs space-y-2 text-slate-500 font-medium">
              <li className="flex justify-between"><span>Baseline Waste TPD:</span> <span className="text-slate-900 font-bold">{UDUPI_DATA.daily_waste_tons} Tons</span></li>
              <li className="flex justify-between"><span>Weather Source:</span> <span className="text-teal-600 font-bold">{weatherLoaded ? 'Open-Meteo API ✅' : 'Default'}</span></li>
              <li className="border-t border-slate-100 my-2"></li>
              <li className="flex justify-between"><span>Rain &gt; 20mm:</span> <span className="text-emerald-600 font-bold">+25% Wet</span></li>
              <li className="flex justify-between"><span>Rain &gt; 0mm:</span> <span className="text-emerald-600 font-bold">+8% Wet</span></li>
              <li className="flex justify-between"><span>Temp &gt; 34°C:</span> <span className="text-blue-600 font-bold">+12% Dry</span></li>
              <li className="flex justify-between"><span>Festival day:</span> <span className="text-orange-500 font-bold">+35% Wet, +15% Dry</span></li>
              <li className="flex justify-between"><span>Weekend:</span> <span className="text-sky-600 font-bold">+10% Wet, +5% Dry</span></li>
            </ul>
          </div>
        </div>


        {/* 📅 CALENDAR SECTION (Full Width) */}
        <div className="lg:col-span-3 space-y-6 mt-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-orange-500" />
                  Udupi Local Calendar & Festivals
                </h2>
                <p className="text-sm text-slate-500">Track and manage local events like Paryaya, Rathotsava, and Astami that impact waste generation.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm text-slate-600 hover:text-teal-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm text-slate-600 hover:text-teal-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Calendar Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center font-bold text-xs text-slate-400 py-2">{day}</div>)}
                  {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="h-20 bg-slate-50/50 rounded-xl" />)}
                  {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const fest = festivals.find(f => f.date === dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                      <div key={day} className={`h-20 border rounded-xl p-2 relative flex flex-col items-start transition-all ${isToday ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'} ${fest ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' : ''}`}>
                        <span className={`text-sm font-bold ${isToday ? 'text-teal-700' : 'text-slate-700'}`}>{day}</span>
                        {fest && <span className="text-[10px] mt-1 text-orange-700 font-extrabold bg-orange-100/80 w-full p-1 rounded-md line-clamp-2 leading-tight" title={fest.name}>{fest.name}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Festival Panel */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Add Local Event</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Event Name</label>
                      <input type="text" value={newFestName} onChange={(e) => setNewFestName(e.target.value)} placeholder="e.g. Kola / Jatre" className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-teal-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Date</label>
                      <input type="date" value={newFestDate} onChange={(e) => setNewFestDate(e.target.value)} className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-teal-500" />
                    </div>
                    <button 
                      onClick={() => {
                        if (newFestName && newFestDate) {
                          setFestivals([...festivals, { name: newFestName, date: newFestDate }]);
                          setNewFestName('');
                          setNewFestDate('');
                        }
                      }}
                      disabled={!newFestName || !newFestDate}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Event
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl max-h-[300px] overflow-y-auto shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex justify-between items-center">
                    Configured Events <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{festivals.length}</span>
                  </h3>
                  <ul className="space-y-2">
                    {festivals.sort((a,b) => a.date.localeCompare(b.date)).map((f, i) => (
                      <li key={i} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{f.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <button 
                          onClick={() => setFestivals(festivals.filter((_, idx) => idx !== i))}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚚 FLEET LOGISTICS SECTION */}
        {(() => {
          const maxWasteDay = computedData.reduce((max, d) => d.total_waste > max.total_waste ? d : max, computedData[0]);
          const peakTotal = maxWasteDay.total_waste;
          
          const baseAuto = Math.ceil(peakTotal / 3);
          const autoBuffer = Math.ceil(baseAuto * 0.1);
          
          const baseCompactor = Math.ceil((peakTotal - BASE_HAZ) / 20);
          const compactorBuffer = Math.ceil(baseCompactor * 0.1);
          
          let heavyWaste = BASE_HAZ;
          const baseTractor = Math.ceil(heavyWaste / 6);
          const tractorBuffer = Math.max(1, Math.ceil(baseTractor * 0.1));

          return (
            <div className="lg:col-span-3 space-y-6 mt-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Truck className="w-6 h-6 text-teal-400" />
                      Dynamic Fleet Optimization
                    </h2>
                    <p className="text-sm text-slate-400">Maximum vehicles required to handle the 10-day peak of <span className="text-teal-400 font-bold">{peakTotal} Tons</span> (expected on {new Date(maxWasteDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}).</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-300 text-xs p-3 rounded-xl flex gap-3 max-w-sm">
                    <Info className="w-8 h-8 text-teal-500 shrink-0" />
                    <p>Calculated using standard SWM methodology: Vehicles complete 2 trips/day. A 10% standby buffer is included for maintenance.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Primary Collection */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-teal-400 font-bold text-sm mb-1 uppercase tracking-wider">Primary Collection</h3>
                    <p className="text-slate-400 text-xs mb-4">Door-to-door (Narrow lanes)</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseAuto + autoBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Auto Tippers</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <li className="flex justify-between"><span>Capacity:</span> <span className="text-white font-bold">1.5 Tons</span></li>
                      <li className="flex justify-between"><span>Trips/Day:</span> <span className="text-white font-bold">2 (Total 3T)</span></li>
                      <li className="flex justify-between border-t border-slate-700 pt-1 mt-1"><span>Active:</span> <span className="text-white font-bold">{baseAuto} vehicles</span></li>
                      <li className="flex justify-between"><span>Buffer (10%):</span> <span className="text-amber-400 font-bold">+{autoBuffer} vehicles</span></li>
                    </ul>
                  </div>

                  {/* Secondary Transport */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-sky-400 font-bold text-sm mb-1 uppercase tracking-wider">Secondary Transport</h3>
                    <p className="text-slate-400 text-xs mb-4">Transfer Station to Landfill</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseCompactor + compactorBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Compactors</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <li className="flex justify-between"><span>Capacity:</span> <span className="text-white font-bold">10.0 Tons</span></li>
                      <li className="flex justify-between"><span>Trips/Day:</span> <span className="text-white font-bold">2 (Total 20T)</span></li>
                      <li className="flex justify-between border-t border-slate-700 pt-1 mt-1"><span>Active:</span> <span className="text-white font-bold">{baseCompactor} vehicles</span></li>
                      <li className="flex justify-between"><span>Buffer (10%):</span> <span className="text-amber-400 font-bold">+{compactorBuffer} vehicles</span></li>
                    </ul>
                  </div>

                  {/* Heavy / C&D */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-rose-400 font-bold text-sm mb-1 uppercase tracking-wider">Heavy / C&D Waste</h3>
                    <p className="text-slate-400 text-xs mb-4">Debris & Hazardous Material</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseTractor + tractorBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Tractors</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <li className="flex justify-between"><span>Capacity:</span> <span className="text-white font-bold">3.0 Tons</span></li>
                      <li className="flex justify-between"><span>Trips/Day:</span> <span className="text-white font-bold">2 (Total 6T)</span></li>
                      <li className="flex justify-between border-t border-slate-700 pt-1 mt-1"><span>Active:</span> <span className="text-white font-bold">{baseTractor} vehicles</span></li>
                      <li className="flex justify-between"><span>Buffer (10%):</span> <span className="text-amber-400 font-bold">+{tractorBuffer} vehicles</span></li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* 20-YEAR LONG-TERM FORECAST SECTION */}
        {(() => {
          // Generate 20-year data (2.5% annual growth)
          const currentYear = new Date().getFullYear();
          const years = Array.from({length: 21}, (_, i) => currentYear + i);
          
          let currentWet = BASE_WET;
          let currentDry = BASE_DRY;
          let currentHaz = BASE_HAZ;
          
          const longTermData = years.map(year => {
            const data = {
              year: year.toString(),
              Wet: Number(currentWet.toFixed(1)),
              Dry: Number(currentDry.toFixed(1)),
              Haz: Number(currentHaz.toFixed(1)),
              Total: Number((currentWet + currentDry + currentHaz).toFixed(1))
            };
            // 2.5% annual growth
            currentWet *= 1.025;
            currentDry *= 1.025;
            currentHaz *= 1.025;
            return data;
          });

          const maxYear = longTermData[longTermData.length - 1];
          const peakTotal = maxYear.Total;
          
          const baseAuto = Math.ceil(peakTotal / 3);
          const autoBuffer = Math.ceil(baseAuto * 0.1);
          
          const baseCompactor = Math.ceil((peakTotal - maxYear.Haz) / 20);
          const compactorBuffer = Math.ceil(baseCompactor * 0.1);
          
          const baseTractor = Math.ceil(maxYear.Haz / 6);
          const tractorBuffer = Math.max(1, Math.ceil(baseTractor * 0.1));

          return (
            <div className="lg:col-span-3 space-y-6 mt-8 mb-12">
              <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                <CalendarIcon className="w-7 h-7 text-indigo-400" />
                20-Year Strategic Forecast (2026-2046)
              </h2>
              
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-lg font-bold text-slate-200 mb-6">Projected Waste Generation Volume (2.5% CAGR)</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={longTermData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWetLT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDryLT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHazLT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="year" stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                      <Area type="monotone" dataKey="Haz" stackId="1" stroke="#ef4444" fill="url(#colorHazLT)" />
                      <Area type="monotone" dataKey="Dry" stackId="1" stroke="#3b82f6" fill="url(#colorDryLT)" />
                      <Area type="monotone" dataKey="Wet" stackId="1" stroke="#00d4aa" fill="url(#colorWetLT)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111827] border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Truck className="w-6 h-6 text-indigo-400" />
                      Max Optimal Fleet Size (2046 Projection)
                    </h2>
                    <p className="text-sm text-slate-400">Infrastructure capacity required to handle the projected 2046 peak of <span className="text-indigo-400 font-bold">{peakTotal} Tons/day</span>.</p>
                  </div>
                  <div className="bg-slate-800/80 border border-indigo-500/20 text-slate-300 text-xs p-3 rounded-xl flex gap-3 max-w-sm">
                    <Info className="w-8 h-8 text-indigo-500 shrink-0" />
                    <p>Accounts for a 2.5% compounded annual growth rate (CAGR) in municipal waste generation over the next two decades.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Primary Collection */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">Future Auto Tippers</h3>
                    <p className="text-slate-400 text-xs mb-4">Target for 2046</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseAuto + autoBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Units</span>
                    </div>
                  </div>

                  {/* Secondary Transport */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-sky-400 font-bold text-sm mb-1 uppercase tracking-wider">Future Compactors</h3>
                    <p className="text-slate-400 text-xs mb-4">Target for 2046</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseCompactor + compactorBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Units</span>
                    </div>
                  </div>

                  {/* Heavy / C&D */}
                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                    <h3 className="text-rose-400 font-bold text-sm mb-1 uppercase tracking-wider">Future Tractors</h3>
                    <p className="text-slate-400 text-xs mb-4">Target for 2046</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-4xl font-black text-white">{baseTractor + tractorBuffer}</span>
                      <span className="text-slate-500 font-bold pb-1">Units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}
