"use client";

import React, { useState } from "react";
import { MapPin, Radio, Navigation, Building2, Truck, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LiveMap() {
  const [activeLayer, setActiveLayer] = useState<"hotspots" | "facilities" | "trucks">("hotspots");

  const markers = [
    { id: 1, name: "Indrali Landfill & Remediation Hub", type: "CRITICAL", x: "68%", y: "38%", metrics: "480 ppm Methane • 42 TPD" },
    { id: 2, name: "Malpe Coastal DWCC & Port Hub", type: "HIGH", x: "24%", y: "52%", metrics: "Coastal Plastic Inflow • 18 TPD" },
    { id: 3, name: "Manipal University Commercial Zone", type: "WARNING", x: "78%", y: "65%", metrics: "Bulk Food Waste • 24 TPD" },
    { id: 4, name: "City Center KM Marg Secondary Station", type: "NORMAL", x: "48%", y: "45%", metrics: "Compactor Depot • 16 TPD" },
    { id: 5, name: "Gundibail Decentralized Biomethanation", type: "NORMAL", x: "55%", y: "28%", metrics: "Anaerobic Digester • 8 TPD" }
  ];

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200/90 bg-slate-50 shadow-xs flex flex-col justify-between p-4">
      {/* Map Grid Pattern Background - Light Clean Theme */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />
      
      {/* Udupi Coastal Outline Graphic Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] stroke-emerald-600 fill-emerald-50/50 stroke-[0.8]">
          <polygon points="20,15 45,18 70,30 85,55 75,85 50,90 25,75 18,45" />
          <path d="M 20,15 Q 18,45 25,75" strokeDasharray="2,2" />
        </svg>
      </div>

      {/* Top Map HUD */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">Udupi Municipal Geospatial Grid</span>
          <Badge variant="outline" className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border-emerald-300">LIVE SENSORS</Badge>
        </div>

        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-xs">
          <button 
            onClick={() => setActiveLayer("hotspots")}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${activeLayer === "hotspots" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Hotspots
          </button>
          <button 
            onClick={() => setActiveLayer("facilities")}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${activeLayer === "facilities" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            DWCC & Plants
          </button>
          <button 
            onClick={() => setActiveLayer("trucks")}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${activeLayer === "trucks" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Fleets
          </button>
        </div>
      </div>

      {/* Interactive Map Nodes */}
      <div className="relative z-10 flex-1 w-full h-full">
        {markers.map((m) => (
          <div 
            key={m.id}
            style={{ left: m.x, top: m.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-60 ${
                m.type === 'CRITICAL' ? 'bg-rose-400' : m.type === 'HIGH' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <div className={`relative inline-flex items-center justify-center rounded-full h-6 w-6 text-white shadow-md ${
                m.type === 'CRITICAL' ? 'bg-rose-600' : m.type === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {m.type === 'CRITICAL' ? <MapPin className="h-3.5 w-3.5" /> : m.type === 'HIGH' ? <Building2 className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
              </div>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-lg border border-slate-200 text-xs whitespace-nowrap z-30">
              <span className="font-bold text-slate-900">{m.name}</span>
              <span className="text-[10px] text-slate-500">{m.metrics}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Map Info Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-700 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-rose-500" /> Methane / Fire Hazard</span>
          <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-amber-500" /> Overflow Warning</span>
          <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-600" /> Processing Nominal</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
          <Navigation className="h-3 w-3 text-emerald-600" />
          13.3409° N, 74.7421° E · Udupi CMC Limits
        </div>
      </div>
    </div>
  );
}
