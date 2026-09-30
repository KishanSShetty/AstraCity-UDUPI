'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Navigation, ShieldCheck, Truck, MapPin } from 'lucide-react';

// --- Udupi Municipal Facilities & Central Depot ---
const DEPOT_COORDS: [number, number] = [74.7421, 13.3409]; // Udupi CMC Central Depot (Beedinagudde)

const FACILITIES = [
  { id: 'DWCC-1', type: 'dwcc', label: 'Beedinagudde Dry Waste Center & MRF', coords: [74.7455, 13.3415] as [number, number], icon: '♻️', sector: 'Sector A (Central)' },
  { id: 'DWCC-2', type: 'dwcc', label: 'Karavali Junction DWCC', coords: [74.7370, 13.3377] as [number, number], icon: '♻️', sector: 'Sector B (South-West)' },
  { id: 'DWCC-3', type: 'dwcc', label: 'Malpe Coastal DWCC', coords: [74.7042, 13.3533] as [number, number], icon: '⚓', sector: 'Sector C (Coastal Port)' },
  { id: 'DWCC-4', type: 'dwcc', label: 'Manipal DWCC', coords: [74.7872, 13.3525] as [number, number], icon: '🎓', sector: 'Sector D (Manipal Hilltop)' },
  { id: 'DWCC-5', type: 'dwcc', label: 'Santhekatte DWCC', coords: [74.7450, 13.3800] as [number, number], icon: '🏬', sector: 'Sector E (North Hub)' },
  { id: 'DWCC-6', type: 'dwcc', label: 'Karvalu Regional Landfill & SWM', coords: [74.75028, 13.35028] as [number, number], icon: '🏭', sector: 'Sector F (Alevoor)' },
  { id: 'BMU-1', type: 'bmu', label: 'Beedinagudde BMU (Bio-Methanisation)', coords: [74.7460, 13.3415] as [number, number], icon: '💧', sector: 'Central BMU' },
];

// Fleet definition matching Udupi Municipal Fleet (12 Auto Tippers, 2 Compactors, 2 Trucks)
function generateUdupiBaselineFleet() {
  const fleet = [];
  
  // 12 Primary Auto Tippers (Door-to-door wards -> Assigned DWCCs)
  const autoAssignments = [
    { id: 'AT-01', target: FACILITIES[0], zone: 'Ward 24 Kasturba Nagar' },
    { id: 'AT-02', target: FACILITIES[0], zone: 'Ward 25 Maruthi Veethika' },
    { id: 'AT-03', target: FACILITIES[1], zone: 'Ward 12 Karavali Bypass' },
    { id: 'AT-04', target: FACILITIES[1], zone: 'Ward 14 Bannanje' },
    { id: 'AT-05', target: FACILITIES[2], zone: 'Ward 04 Malpe Port North' },
    { id: 'AT-06', target: FACILITIES[2], zone: 'Ward 05 Kola Seaface' },
    { id: 'AT-07', target: FACILITIES[3], zone: 'Ward 18 Manipal University' },
    { id: 'AT-08', target: FACILITIES[3], zone: 'Ward 19 Saralebettu' },
    { id: 'AT-09', target: FACILITIES[4], zone: 'Ward 01 Santhekatte Market' },
    { id: 'AT-10', target: FACILITIES[4], zone: 'Ward 02 Gopalapura' },
    { id: 'AT-11', target: FACILITIES[5], zone: 'Ward 30 Alevoor Border' },
    { id: 'AT-12', target: FACILITIES[5], zone: 'Ward 31 Karvalu South' },
  ];

  for (const a of autoAssignments) {
    fleet.push({
      id: a.id,
      type: 'auto_tipper',
      label: 'Auto Tipper (Primary)',
      load: 440 + Math.floor(Math.random() * 55), // ~480kg
      capacity: 500,
      target: a.target.coords,
      targetLabel: a.target.label,
      zone: a.zone,
    });
  }

  // 4 Heavy Transport Compactors & Trucks
  fleet.push({
    id: 'C-01',
    type: 'compactor',
    label: 'Small Compactor',
    load: 4850,
    capacity: 5000,
    target: FACILITIES[5].coords, // Karvalu SWM Landfill
    targetLabel: FACILITIES[5].label,
    zone: 'Regional Secondary Transit',
  });
  fleet.push({
    id: 'C-02',
    type: 'compactor',
    label: 'Heavy Compactor',
    load: 9600,
    capacity: 10000,
    target: FACILITIES[5].coords, // Karvalu SWM Landfill
    targetLabel: FACILITIES[5].label,
    zone: 'Citywide Bulk Transfer',
  });
  fleet.push({
    id: 'GT-01',
    type: 'garbage_truck',
    label: 'Garbage Truck (Wet)',
    load: 4700,
    capacity: 5000,
    target: FACILITIES[6].coords, // Beedinagudde BMU
    targetLabel: FACILITIES[6].label,
    zone: 'Hotel & Market Wet Waste',
  });
  fleet.push({
    id: 'GT-02',
    type: 'garbage_truck',
    label: 'Garbage Truck (Secondary)',
    load: 4900,
    capacity: 5000,
    target: FACILITIES[5].coords, // Karvalu SWM Landfill
    targetLabel: FACILITIES[5].label,
    zone: 'Indrali Remediation Transit',
  });

  return fleet;
}

interface VehicleSimState {
  id: string;
  type: string;
  label: string;
  load: number;
  capacity: number;
  zone: string;
  targetLabel: string;
  coordinates: [number, number][];
  currentIdx: number;
  progress: number;
  position: [number, number];
  bearing: number;
  completed: boolean;
  distanceKm: number;
  marker?: maplibregl.Marker;
}

function getBearing(start: [number, number], end: [number, number]) {
  const lon1 = start[0] * (Math.PI / 180);
  const lat1 = start[1] * (Math.PI / 180);
  const lon2 = end[0] * (Math.PI / 180);
  const lat2 = end[1] * (Math.PI / 180);
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Fallback high-density trajectory generator if OSRM is busy or unavailable
function generateSmoothRoadPath(start: [number, number], end: [number, number], steps = 60): [number, number][] {
  const coords: [number, number][] = [];
  const midX = (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.008;
  const midY = (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 0.008;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve to simulate realistic road geometry
    const lon = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midX + t * t * end[0];
    const lat = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midY + t * t * end[1];
    coords.push([lon, lat]);
  }
  return coords;
}

export default function BaselineSimulation() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(2);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleSimState[]>([]);

  const animationRef = useRef<number | null>(null);
  const vehiclesRef = useRef<VehicleSimState[]>([]);
  const speedRef = useRef(speedMultiplier);
  const simActiveRef = useRef(simulationActive);

  speedRef.current = speedMultiplier;
  simActiveRef.current = simulationActive;

  // 1. Initialize Baseline Fleet and Route Geometry
  useEffect(() => {
    let isCancelled = false;

    const initFleet = async () => {
      try {
        const rawFleet = generateUdupiBaselineFleet();
        const loadedVehicles: VehicleSimState[] = [];

        // Concurrently fetch routes with safety fallback
        const routePromises = rawFleet.map(async (v, idx) => {
          let coordinates: [number, number][] = [];
          let distKm = 2.5;

          try {
            // Slight jitter for realistic street distribution
            const jitterMid: [number, number] = [
              (DEPOT_COORDS[0] + v.target[0]) / 2 + ((idx % 3) - 1) * 0.003,
              (DEPOT_COORDS[1] + v.target[1]) / 2 + (((idx + 1) % 3) - 1) * 0.003,
            ];
            const coordsString = `${DEPOT_COORDS[0]},${DEPOT_COORDS[1]};${jitterMid[0]},${jitterMid[1]};${v.target[0]},${v.target[1]}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`/api/route?coords=${coordsString}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data.geometry && data.geometry.coordinates?.length >= 2) {
                coordinates = data.geometry.coordinates;
                distKm = data.distance_km || 3.0;
              }
            }
          } catch {
            // Fallback handled below
          }

          if (coordinates.length < 2) {
            coordinates = generateSmoothRoadPath(DEPOT_COORDS, v.target, 55 + (idx % 20));
          }

          const initialBearing = coordinates.length > 1 ? getBearing(coordinates[0], coordinates[1]) : 0;

          return {
            id: v.id,
            type: v.type,
            label: v.label,
            load: v.load,
            capacity: v.capacity,
            zone: v.zone,
            targetLabel: v.targetLabel,
            coordinates,
            currentIdx: 0,
            progress: 0,
            position: coordinates[0],
            bearing: initialBearing,
            completed: false,
            distanceKm: distKm,
          } as VehicleSimState;
        });

        const results = await Promise.all(routePromises);
        if (!isCancelled) {
          vehiclesRef.current = results;
          setVehicles(results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fleet init error:', err);
        if (!isCancelled) setLoading(false);
      }
    };

    initFleet();
    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Initialize Map & Markers
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || loading || vehicles.length === 0) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [74.7473, 13.3450], // Central Udupi
      zoom: 12.8,
      pitch: 35,
      bearing: -5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add Central Depot Marker
      const depotEl = document.createElement('div');
      depotEl.className = 'depot-marker';
      depotEl.innerHTML = `
        <div style="background:#059669; color:white; border:2px solid white; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 10px rgba(5,150,105,0.4);" title="Udupi Central Depot (Beedinagudde)">
          🏛️
        </div>
      `;
      new maplibregl.Marker({ element: depotEl, anchor: 'center' }).setLngLat(DEPOT_COORDS).addTo(map);

      // Add Facility Destination Markers
      FACILITIES.forEach(fac => {
        const el = document.createElement('div');
        el.className = 'facility-marker cursor-pointer';
        el.innerHTML = `
          <div style="background:white; border:2px solid #059669; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:15px; box-shadow:0 3px 8px rgba(0,0,0,0.12);" title="${fac.label}">
            ${fac.icon}
          </div>
        `;
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(fac.coords).addTo(map);
      });

      // Draw Route Lines and Add Vehicle Markers
      vehiclesRef.current.forEach((v) => {
        const isAuto = v.type === 'auto_tipper';
        const color = isAuto ? '#059669' : '#0284c7';

        map.addSource(`route-${v.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: v.coordinates }
          }
        });

        map.addLayer({
          id: `route-line-${v.id}`,
          type: 'line',
          source: `route-${v.id}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': color,
            'line-width': isAuto ? 2.5 : 3.5,
            'line-opacity': 0.45,
            'line-dasharray': [2, 1]
          }
        });

        // Vehicle DOM Marker with inner rotating child (protecting MapLibre translate matrix)
        const el = document.createElement('div');
        el.id = `marker-${v.id}`;
        el.className = 'vehicle-marker-root';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'pointer';

        const inner = document.createElement('div');
        inner.className = 'vehicle-marker-inner';
        inner.style.width = '30px';
        inner.style.height = '30px';
        inner.style.borderRadius = '50%';
        inner.style.backgroundColor = isAuto ? '#ecfdf5' : '#f0f9ff';
        inner.style.border = isAuto ? '2px solid #059669' : '2px solid #0284c7';
        inner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)';
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'center';
        inner.style.fontSize = isAuto ? '15px' : '17px';
        inner.style.transition = 'transform 0.15s ease-out';
        inner.style.transform = `rotate(${v.bearing}deg)`;
        inner.innerHTML = isAuto ? '🛺' : '🚛';

        el.appendChild(inner);

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(v.position)
          .addTo(map);

        el.addEventListener('click', () => {
          setSelectedVehicleId(v.id);
          map.flyTo({ center: v.position, zoom: 14.5, speed: 1.2 });
        });

        v.marker = marker;
      });
    });

    mapRef.current = map;
  }, [loading, vehicles.length]);

  // 3. Smooth Physical Animation Loop
  const animateFrame = useCallback(() => {
    if (!simActiveRef.current) return;

    let anyMoving = false;
    const currentSpeed = speedRef.current;

    vehiclesRef.current = vehiclesRef.current.map((v) => {
      if (v.completed) return v;

      anyMoving = true;
      // Step size per frame for smooth 60fps movement
      const baseStep = v.type === 'auto_tipper' ? 0.035 : 0.022;
      let newProgress = v.progress + baseStep * currentSpeed;
      let newIdx = v.currentIdx;
      let newPos = v.position;
      let newBearing = v.bearing;

      if (newProgress >= 1) {
        newProgress = 0;
        newIdx++;
        if (newIdx >= v.coordinates.length - 1) {
          // Reached destination facility
          const finalPos = v.coordinates[v.coordinates.length - 1];
          if (v.marker) {
            v.marker.setLngLat(finalPos);
          }
          return {
            ...v,
            completed: true,
            currentIdx: v.coordinates.length - 1,
            progress: 1,
            position: finalPos,
          };
        }
        newBearing = getBearing(v.coordinates[newIdx], v.coordinates[newIdx + 1]);
      }

      const p1 = v.coordinates[newIdx];
      const p2 = v.coordinates[newIdx + 1];
      if (p1 && p2) {
        newPos = [
          p1[0] + (p2[0] - p1[0]) * newProgress,
          p1[1] + (p2[1] - p1[1]) * newProgress
        ];
      }

      // Update MapLibre marker position without destroying transform
      if (v.marker) {
        v.marker.setLngLat(newPos);
        const inner = v.marker.getElement().querySelector('.vehicle-marker-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = `rotate(${newBearing}deg)`;
        }
      }

      return {
        ...v,
        currentIdx: newIdx,
        progress: newProgress,
        position: newPos,
        bearing: newBearing,
      };
    });

    setVehicles([...vehiclesRef.current]);

    if (anyMoving && simActiveRef.current) {
      animationRef.current = requestAnimationFrame(animateFrame);
    } else if (!anyMoving) {
      setSimulationActive(false);
    }
  }, []);

  useEffect(() => {
    if (simulationActive) {
      animationRef.current = requestAnimationFrame(animateFrame);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulationActive, animateFrame]);

  // Start / Pause Toggle (with auto-restart if all arrived)
  const handleToggleSimulation = () => {
    if (!simulationActive) {
      const allCompleted = vehiclesRef.current.every(v => v.completed);
      if (allCompleted) {
        handleResetSimulation(true);
        return;
      }
      setSimulationActive(true);
    } else {
      setSimulationActive(false);
    }
  };

  // Reset Simulation to Depot
  const handleResetSimulation = (autoStart = false) => {
    setSimulationActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    vehiclesRef.current = vehiclesRef.current.map((v) => {
      const startPos = v.coordinates[0] || DEPOT_COORDS;
      const initialBearing = v.coordinates.length > 1 ? getBearing(v.coordinates[0], v.coordinates[1]) : 0;

      if (v.marker) {
        v.marker.setLngLat(startPos);
        const inner = v.marker.getElement().querySelector('.vehicle-marker-inner') as HTMLElement;
        if (inner) inner.style.transform = `rotate(${initialBearing}deg)`;
      }

      return {
        ...v,
        currentIdx: 0,
        progress: 0,
        position: startPos,
        bearing: initialBearing,
        completed: false,
      };
    });

    setVehicles([...vehiclesRef.current]);

    if (autoStart) {
      setTimeout(() => {
        setSimulationActive(true);
      }, 50);
    }
  };

  // Focus map on specific vehicle
  const handleSelectVehicle = (v: VehicleSimState) => {
    setSelectedVehicleId(v.id);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: v.position,
        zoom: 14.5,
        speed: 1.2
      });
    }
  };

  // Active status counters
  const activeCount = vehicles.filter(v => !v.completed).length;
  const completedCount = vehicles.filter(v => v.completed).length;

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Left Map Viewport */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-5 bg-gradient-to-b from-white/95 via-white/80 to-transparent pointer-events-none z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Udupi CMC Live GPS Twin
              </span>
              <span className="text-xs text-slate-500 font-medium">16 Baseline Units</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Municipal Fleet GPS Simulation
            </h1>
            <p className="text-slate-600 font-medium text-xs max-w-xl">
              Simulating 12 Auto Tippers (Door-to-Door Wards) &amp; 4 Heavy Transport Compactors connecting Udupi Central Depot to MRFs, DWCCs, and BMU.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start">
            <span className={`w-2.5 h-2.5 rounded-full ${simulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                {simulationActive ? 'Running' : completedCount === 16 ? 'All Arrived' : 'Standby'}
              </span>
              <span className="text-slate-500 ml-1.5 text-[11px]">
                ({completedCount}/16 completed)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-md flex items-center gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>Auto Tippers (12)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
            <span>Compactors &amp; Trucks (4)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>🏛️ Central Depot</span>
            <span>♻️ DWCC Hubs</span>
          </div>
        </div>
      </div>

      {/* Right Control & Vehicle Sidebar */}
      <div className="w-[410px] h-full bg-white border-l border-slate-200 shadow-md flex flex-col z-20">
        {/* Control Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSimulation}
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                simulationActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Routing Fleet...</span>
              ) : simulationActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{completedCount === 16 ? 'Restart Simulation' : 'Start Simulation'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleResetSimulation(false)}
              disabled={loading}
              title="Reset all vehicles to Depot"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 pl-2">Simulation Speed:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                    speedMultiplier === s
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-thin">
          {loading && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Computing Udupi street routes...</p>
            </div>
          )}

          {!loading && vehicles.map((v) => {
            const pct = Math.min(100, Math.round((v.currentIdx / Math.max(1, v.coordinates.length - 1)) * 100));
            const isAuto = v.type === 'auto_tipper';
            const isSelected = selectedVehicleId === v.id;

            return (
              <motion.div
                key={v.id}
                onClick={() => handleSelectVehicle(v)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isAuto ? '🛺' : '🚛'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-black text-xs">{v.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isAuto ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {isAuto ? 'Auto Tipper' : 'Heavy Compactor'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium leading-tight mt-0.5 truncate max-w-[190px]">
                        {v.zone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                      v.completed
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {v.completed ? 'ARRIVED' : `${pct}%`}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {v.distanceKm} km
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden my-2">
                  <div
                    className={`h-full transition-all duration-150 ${
                      v.completed ? 'bg-slate-400' : isAuto ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1 truncate max-w-[210px]">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{v.targetLabel}</span>
                  </div>
                  <span className="font-semibold text-slate-600 shrink-0">
                    {v.load} / {v.capacity} kg
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
