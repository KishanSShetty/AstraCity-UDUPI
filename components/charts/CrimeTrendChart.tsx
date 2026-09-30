"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Activity, Target, AlertCircle, Radio, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const sampleTelemetry = [
  { time: "Day 1", date: "Sep 01", baseline: 138, actual: 139, anomaly: null },
  { time: "Day 2", date: "Sep 02", baseline: 140, actual: 141, anomaly: null },
  { time: "Day 3", date: "Sep 03", baseline: 139, actual: 144, anomaly: null },
  { time: "Day 4", date: "Sep 04", baseline: 141, actual: 140, anomaly: null },
  { time: "Day 5", date: "Sep 05", baseline: 140, actual: 142, anomaly: null },
  { time: "Day 6", date: "Sep 06", baseline: 142, actual: 145, anomaly: null },
  { time: "Day 7", date: "Sep 07", baseline: 140, actual: 138, anomaly: null },
  { time: "Day 8", date: "Sep 08", baseline: 143, actual: 168, anomaly: 168 },
  { time: "Day 9", date: "Sep 09", baseline: 141, actual: 182, anomaly: 182 },
  { time: "Day 10", date: "Sep 10", baseline: 140, actual: 146, anomaly: null },
  { time: "Day 11", date: "Sep 11", baseline: 139, actual: 143, anomaly: null },
  { time: "Day 12", date: "Sep 12", baseline: 142, actual: 195, anomaly: 195 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();

  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col gap-1.5 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Date: {label}</span>
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
        </div>
        
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'anomaly' && !entry.value) return null;
          
          const displayName = entry.name;
          const color = entry.dataKey === 'anomaly' ? "#ef4444" : entry.color;

          return (
            <div key={index} className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 uppercase text-[10px]">{displayName}</span>
              <span className="font-mono font-bold" style={{ color }}>
                {entry.value} TPD
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function CrimeTrendChart() {
  const { t } = useLanguage();
  const [trendData] = useState<any[]>(sampleTelemetry);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-full mt-2">
      {/* Main Chart Area */}
      <div className="flex-1 h-[320px] relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 text-xs flex items-center gap-2 font-bold uppercase tracking-wider">
            <Activity className="h-4 w-4 text-emerald-600" />
            Daily Generation & Anomaly Telemetry (TPD)
          </h3>
          <div className="text-[10px] text-slate-500 uppercase flex gap-4 font-bold">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /> 140 TPD Baseline</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-600" /> Recorded Inflow</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> 3σ Outlier Spike</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaFillEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              domain={[120, 220]}
              dx={-5}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Baseline Track (140 TPD Average) */}
            <Line 
              type="monotone" 
              dataKey="baseline" 
              name="140 TPD Baseline" 
              stroke="#94a3b8" 
              strokeWidth={1.5} 
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Actual Track */}
            <Area 
              type="monotone" 
              dataKey="actual" 
              name="Recorded Tonnage" 
              stroke="#059669" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#areaFillEmerald)" 
              isAnimationActive={false}
            />

            {/* Anomaly Outlier Dots */}
            <Scatter 
              dataKey="anomaly" 
              name="Anomalous Surge" 
              fill="#ef4444" 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy & Threat Telemetry Card */}
      <div className="xl:w-64 flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Target className="h-3 w-3 text-emerald-600" />
              FORECAST ACCURACY
            </span>
            <div className="text-2xl font-black tracking-tight text-slate-900 mt-1 font-mono">97.2%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-[97.2%]" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              HOTSPOT STATUS
            </span>
            <div className="text-xs font-bold tracking-tight text-amber-800 mt-1">ELEVATED INFLOW</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              3 anomalous surges detected at Malpe & Indrali dumping perimeters.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">CMC SENSOR NET</span>
            <span className="font-mono text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              ONLINE (35 WARDS)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
