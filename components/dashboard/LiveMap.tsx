"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Radio, Navigation, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LayerMode = "all" | "hotspots" | "facilities" | "trucks";

interface MapFeatureItem {
  id: string;
  name: string;
  category: "hotspot" | "facility" | "truck";
  severity?: "CRITICAL" | "HIGH" | "NORMAL" | "WARNING";
  coords: [number, number];
  icon: string;
  metrics: string;
  ward: string;
  color: string;
}

const UDUPI_MAP_FEATURES: MapFeatureItem[] = [
  // Hotspots / Methane hazards
  {
    id: "H-1",
    name: "Indrali Landfill & Remediation Hub",
    category: "hotspot",
    severity: "CRITICAL",
    coords: [74.7645, 13.3482],
    icon: "🔥",
    metrics: "480 ppm Methane · 42 TPD Legacy Waste",
    ward: "Indrali Ward 20",
    color: "#e11d48", // rose-600
  },
  {
    id: "H-2",
    name: "Car Street Blackspot Dump",
    category: "hotspot",
    severity: "HIGH",
    coords: [74.7465, 13.3418],
    icon: "⚠️",
    metrics: "Overflow Warning · 2.4 TPD Mixed Accumulation",
    ward: "Ward 25 Maruthi Veethika",
    color: "#f59e0b", // amber-500
  },
  {
    id: "H-3",
    name: "Manipal University Commercial Hub",
    category: "hotspot",
    severity: "WARNING",
    coords: [74.7872, 13.3525],
    icon: "⚠️",
    metrics: "Bulk Food Waste Surge · 24 TPD",
    ward: "Ward 18 Manipal",
    color: "#f59e0b",
  },
  {
    id: "H-4",
    name: "Malpe Port Fish Market Dock",
    category: "hotspot",
    severity: "HIGH",
    coords: [74.7042, 13.3533],
    icon: "🐟",
    metrics: "Fishery Wet Waste · Rapid Putrefaction",
    ward: "Ward 04 Malpe Port",
    color: "#f59e0b",
  },

  // Municipal Processing Facilities & DWCCs
  {
    id: "F-1",
    name: "Beedinagudde Dry Waste Center & MRF",
    category: "facility",
    severity: "NORMAL",
    coords: [74.7455, 13.3415],
    icon: "♻️",
    metrics: "Functional MRF · 4.2 TPD Dry Baling",
    ward: "Ward 24 Kasturba Nagar",
    color: "#059669", // emerald-600
  },
  {
    id: "F-2",
    name: "Beedinagudde Biomethanation Unit (BMU)",
    category: "facility",
    severity: "NORMAL",
    coords: [74.7460, 13.3415],
    icon: "💧",
    metrics: "Anaerobic Digester · 5 TPD Wet Waste",
    ward: "Central BMU Campus",
    color: "#0284c7", // sky-600
  },
  {
    id: "F-3",
    name: "Karavali Junction DWCC",
    category: "facility",
    severity: "NORMAL",
    coords: [74.7370, 13.3377],
    icon: "♻️",
    metrics: "Secondary Collection Hub · 3.8 TPD",
    ward: "Ward 12 Karavali Bypass",
    color: "#059669",
  },
  {
    id: "F-4",
    name: "Karvalu SWM Plant & Regional Landfill",
    category: "facility",
    severity: "NORMAL",
    coords: [74.75028, 13.35028],
    icon: "🏭",
    metrics: "Engineered Regional Landfill · 22 Acres",
    ward: "Alevoor Karvalu",
    color: "#059669",
  },
  {
    id: "F-5",
    name: "Santhekatte DWCC Hub",
    category: "facility",
    severity: "NORMAL",
    coords: [74.7450, 13.3800],
    icon: "🏬",
    metrics: "North Sector Collection Hub · 4.0 TPD",
    ward: "Ward 01 Santhekatte",
    color: "#059669",
  },

  // Active Fleets in transit
  {
    id: "T-1",
    name: "AT-01 Auto Tipper",
    category: "truck",
    severity: "NORMAL",
    coords: [74.7440, 13.3420],
    icon: "🛺",
    metrics: "Door-to-Door Route · Load: 460 kg (92%)",
    ward: "Ward 24 Kasturba Nagar",
    color: "#10b981",
  },
  {
    id: "T-2",
    name: "AT-04 Auto Tipper",
    category: "truck",
    severity: "NORMAL",
    coords: [74.7390, 13.3390],
    icon: "🛺",
    metrics: "Bannanje Route · Load: 440 kg (88%)",
    ward: "Ward 14 Bannanje",
    color: "#10b981",
  },
  {
    id: "T-3",
    name: "C-01 Small Compactor",
    category: "truck",
    severity: "NORMAL",
    coords: [74.7490, 13.3460],
    icon: "🚛",
    metrics: "Secondary Bulk Transit · 4,850 kg",
    ward: "City Center Arterial Route",
    color: "#0284c7",
  },
  {
    id: "T-4",
    name: "AT-07 Auto Tipper",
    category: "truck",
    severity: "NORMAL",
    coords: [74.7810, 13.3505],
    icon: "🛺",
    metrics: "Manipal Hilltop Sector · Load: 485 kg (97%)",
    ward: "Ward 18 Manipal",
    color: "#10b981",
  },
];

export function LiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [activeLayer, setActiveLayer] = useState<LayerMode>("all");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [74.7473, 13.3450], // Central Udupi
      zoom: 12.4,
      pitch: 28,
      bearing: -5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);

      // Add Udupi CMC boundary outline
      map.addSource("udupi-boundary-line", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[
              [74.700, 13.340],
              [74.710, 13.375],
              [74.748, 13.385],
              [74.795, 13.365],
              [74.790, 13.330],
              [74.755, 13.325],
              [74.720, 13.330],
              [74.700, 13.340],
            ]],
          },
        },
      });

      map.addLayer({
        id: "udupi-boundary-stroke",
        type: "line",
        source: "udupi-boundary-line",
        paint: {
          "line-color": "#059669",
          "line-width": 2,
          "line-dasharray": [3, 2],
          "line-opacity": 0.5,
        },
      });

      map.addLayer({
        id: "udupi-boundary-fill",
        type: "fill",
        source: "udupi-boundary-line",
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.04,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers with Active Layer filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter features
    const visibleFeatures = UDUPI_MAP_FEATURES.filter((item) => {
      if (activeLayer === "all") return true;
      if (activeLayer === "hotspots") return item.category === "hotspot";
      if (activeLayer === "facilities") return item.category === "facility";
      if (activeLayer === "trucks") return item.category === "truck";
      return true;
    });

    // Create MapLibre HTML Markers
    visibleFeatures.forEach((item) => {
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";

      // Pulsing glow for critical / hotspots
      const isCritical = item.severity === "CRITICAL";
      const isWarning = item.severity === "HIGH" || item.severity === "WARNING";

      const badgeHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${item.color};
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          font-size: 15px;
        ">
          ${isCritical ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${item.color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ""}
          <span style="position: relative; z-index: 1;">${item.icon}</span>
        </div>
      `;
      el.innerHTML = badgeHtml;

      // Popup
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 13px; color: #0f172a;">${item.name}</span>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${item.color}20; color: ${item.color}; text-transform: uppercase;">
              ${item.severity || item.category}
            </span>
          </div>
          <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0; font-weight: 500;">${item.metrics}</p>
          <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; align-items: center; gap: 4px;">
            <span>📍 ${item.ward}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(item.coords)
        .setPopup(popup)
        .addTo(map);

      // Show popup on hover
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      markersRef.current.push(marker);
    });
  }, [activeLayer, mapLoaded]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [74.7473, 13.3450],
        zoom: 12.4,
        pitch: 28,
        bearing: -5,
        speed: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-slate-200/90 bg-slate-50 shadow-xs flex flex-col justify-between">
      {/* Real MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Map HUD Overlay */}
      <div className="relative z-10 p-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">Udupi Geospatial Twin</span>
          <Badge variant="outline" className="text-[9px] font-black text-emerald-700 bg-emerald-50 border-emerald-300">
            LIVE MAP
          </Badge>
        </div>

        {/* Layer Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveLayer("all")}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeLayer === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveLayer("hotspots")}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeLayer === "hotspots" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hotspots
          </button>
          <button
            onClick={() => setActiveLayer("facilities")}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeLayer === "facilities" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            DWCC &amp; Plants
          </button>
          <button
            onClick={() => setActiveLayer("trucks")}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeLayer === "trucks" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fleets
          </button>

          <button
            onClick={handleResetView}
            title="Reset Map Center"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Map Info Footer Overlay */}
      <div className="relative z-10 m-3 flex flex-wrap items-center justify-between text-[11px] text-slate-700 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs gap-2 pointer-events-auto">
        <div className="flex items-center gap-3.5 font-medium">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Methane / Hazard</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Overflow Warning</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>DWCC / Facility</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Active Fleet</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
          <Navigation className="h-3 w-3 text-emerald-600" />
          <span>13.3409° N, 74.7421° E · Udupi CMC Limits</span>
        </div>
      </div>
    </div>
  );
}
