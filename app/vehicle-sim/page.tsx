'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

// --- Facilities ---
const DEPOT_COORDS: [number, number] = [77.6392, 12.9158]; // KCDC Depot
const FACILITIES = [
  { id: 'BMU-1', type: 'bmu', label: 'Kudlu BMU (Liquid/Wet Waste)', coords: [77.650711, 12.896183], icon: '💧' },
  { id: 'DUMP-1', type: 'dump', label: 'Yelahanka Dumpyard (Rejects)', coords: [77.645922, 13.103583], icon: '🏭' }, // Off map, but we route to edge
  { id: 'DWCC-1', type: 'dwcc', label: 'DWCC Sector 2 East', coords: [77.64903, 12.91263], icon: '♻️' },
  { id: 'DWCC-2', type: 'dwcc', label: 'DWCC Sector 3 North', coords: [77.64688, 12.92218], icon: '♻️' },
  { id: 'DWCC-3', type: 'dwcc', label: 'DWCC Sector 3 Central', coords: [77.64545, 12.91811], icon: '♻️' },
  { id: 'DWCC-4', type: 'dwcc', label: 'DWCC Sector 1 East', coords: [77.64755, 12.91218], icon: '♻️' },
  { id: 'DWCC-5', type: 'dwcc', label: 'DWCC Sector 1 SW', coords: [77.63312, 12.90536], icon: '♻️' },
  { id: 'DWCC-6', type: 'dwcc', label: 'DWCC Sector 1 South', coords: [77.64077, 12.89907], icon: '♻️' },
];

// --- Fake 16-Vehicle Baseline Generation ---
// Generate 12 Auto Tippers (short local routes) and 4 Trucks (long routes)
function generateBaselineFleet() {
  const fleet = [];
  // 12 Autos (Primary)
  for (let i = 1; i <= 12; i++) {
    const targetDwcc = FACILITIES[2 + (i % 6)]; // Pick a DWCC
    fleet.push({
      id: `AT-${i.toString().padStart(2, '0')}`,
      type: 'auto_tipper',
      load: 450 + Math.floor(Math.random() * 50), // ~500kg
      target: targetDwcc.coords as [number, number]
    });
  }
  // 4 Trucks (Secondary/Liquid)
  for (let i = 1; i <= 4; i++) {
    const target = i % 2 === 0 ? FACILITIES[0].coords : [77.6600, 12.9250]; // BMU or generic exit
    fleet.push({
      id: `TRK-${i.toString().padStart(2, '0')}`,
      type: 'heavy_truck',
      load: 8000 + Math.floor(Math.random() * 2000), // ~10T
      target: target as [number, number]
    });
  }
  return fleet;
}

interface VehicleSimState {
  id: string;
  type: string;
  load: number;
  coordinates: [number, number][];
  currentIdx: number;
  progress: number;
  position: [number, number];
  bearing: number;
  completed: boolean;
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

export default function BaselineSimulation() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleSimState[]>([]);
  
  const animationRef = useRef<number>();
  const vehiclesRef = useRef<VehicleSimState[]>([]);

  // 1. Fetch OSRM Routes for 16 Vehicles
  useEffect(() => {
    const initBaseline = async () => {
      try {
        const baselineFleet = generateBaselineFleet();
        const simVehicles: VehicleSimState[] = [];

        for (const v of baselineFleet) {
          // Add a random intermediate point to simulate messy street navigation
          const midPoint = [
            DEPOT_COORDS[0] + (Math.random() - 0.5) * 0.02,
            DEPOT_COORDS[1] + (Math.random() - 0.5) * 0.02
          ];
          const coordsString = `${DEPOT_COORDS[0]},${DEPOT_COORDS[1]};${midPoint[0]},${midPoint[1]};${v.target[0]},${v.target[1]}`;
          const routeRes = await fetch(`/api/route?coords=${coordsString}`);
          const routeData = await routeRes.json();
          
          if (routeData.geometry && routeData.geometry.coordinates.length > 0) {
            const pathCoords = routeData.geometry.coordinates as [number, number][];
            simVehicles.push({
              id: v.id,
              type: v.type,
              load: v.load,
              coordinates: pathCoords,
              currentIdx: 0,
              progress: 0,
              position: pathCoords[0],
              bearing: pathCoords.length > 1 ? getBearing(pathCoords[0], pathCoords[1]) : 0,
              completed: false,
            });
          }
        }
        
        setVehicles(simVehicles);
        vehiclesRef.current = simVehicles;
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    initBaseline();
  }, []);

  // 2. Initialize Map & Markers
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || loading) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: DEPOT_COORDS,
      zoom: 13.5,
      pitch: 45,
      bearing: -17,
      attributionControl: false,
    });

    map.on('load', () => {
      // Add Facility Markers
      FACILITIES.forEach(fac => {
        const el = document.createElement('div');
        el.className = 'facility-marker shadow-lg';
        el.innerHTML = `<div style="background:white; border:2px solid #333; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:16px;" title="${fac.label}">${fac.icon}</div>`;
        new maplibregl.Marker(el).setLngLat(fac.coords as [number, number]).addTo(map);
      });

      // Draw Routes and Setup Vehicle HTML Markers
      vehiclesRef.current.forEach((v) => {
        const color = v.type === 'auto_tipper' ? '#10b981' : '#f43f5e';

        map.addSource(`route-${v.id}`, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: v.coordinates } }
        });
        map.addLayer({
          id: `route-line-${v.id}`,
          type: 'line',
          source: `route-${v.id}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': color, 'line-width': 3, 'line-opacity': 0.4 }
        });

        // Create Custom HTML Marker for Emoji
        const el = document.createElement('div');
        el.style.fontSize = v.type === 'auto_tipper' ? '20px' : '28px';
        el.style.transition = 'transform 0.1s linear';
        el.innerHTML = v.type === 'auto_tipper' ? '🛺' : '🚛';
        
        const marker = new maplibregl.Marker(el).setLngLat(v.position).addTo(map);
        v.marker = marker;
      });
    });

    mapRef.current = map;
  }, [loading]);

  // 3. Animation Engine
  const animate = () => {
    let allCompleted = true;
    
    vehiclesRef.current = vehiclesRef.current.map(v => {
      if (v.completed) return v;
      allCompleted = false;

      const speedParam = v.type === 'auto_tipper' ? 0.8 : 0.4;
      let newProgress = v.progress + speedParam;
      let newIdx = v.currentIdx;
      let newPos = v.position;
      let newBearing = v.bearing;

      if (newProgress >= 1) {
        newProgress = 0;
        newIdx++;
        if (newIdx >= v.coordinates.length - 1) {
          return { ...v, completed: true, position: v.coordinates[v.coordinates.length - 1], progress: 1 };
        }
        newBearing = getBearing(v.coordinates[newIdx], v.coordinates[newIdx + 1]);
      }

      const p1 = v.coordinates[newIdx];
      const p2 = v.coordinates[newIdx + 1];
      if (p1 && p2) {
        newPos = [p1[0] + (p2[0] - p1[0]) * newProgress, p1[1] + (p2[1] - p1[1]) * newProgress];
      }

      // Update HTML Marker physically
      if (v.marker) {
        v.marker.setLngLat(newPos);
        // Rotate emoji marker to face travel direction
        v.marker.getElement().style.transform = `rotate(${newBearing}deg)`;
      }

      return { ...v, currentIdx: newIdx, progress: newProgress, position: newPos, bearing: newBearing };
    });

    setVehicles([...vehiclesRef.current]);

    if (!allCompleted && simulationActive) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (allCompleted) {
      setSimulationActive(false);
    }
  };

  useEffect(() => {
    if (simulationActive) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulationActive]);

  return (
    <div className="h-screen w-full flex bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-[#0f172a] to-transparent pointer-events-none z-10">
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            Baseline Simulation (16 Vehicles)
          </h1>
          <p className="text-slate-300 font-medium mt-2 max-w-2xl text-sm drop-shadow-md">
            Visualizing the chaotic pre-optimization collection model: 12 Auto Tippers and 4 Heavy Trucks operating simultaneously across DWCCs and Liquid/Wet Waste BMUs.
          </p>
        </div>
      </div>

      <div className="w-[400px] h-full bg-[#1e293b] border-l border-slate-800 shadow-2xl flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-sm uppercase bg-teal-500 text-[#0f172a] hover:bg-teal-400"
          >
            {loading ? 'Routing 16 Vehicles...' : simulationActive ? 'Pause Baseline' : '▶ Start Baseline System'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {!loading && vehicles.map((v, i) => {
            const pct = Math.min(100, Math.round((v.currentIdx / v.coordinates.length) * 100));
            const isAuto = v.type === 'auto_tipper';
            return (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0f172a] rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isAuto ? '🛺' : '🚛'}</span>
                    <div>
                      <p className="text-slate-200 font-bold text-sm">{v.id}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold">{v.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-teal-400">{v.completed ? 'ARRIVED' : `${pct}%`}</p>
                    <p className="text-slate-500 text-[10px]">Load: {v.load} kg</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
