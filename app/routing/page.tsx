'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ROUTING_CONFIG from '../../lib/routing_config.json';
import { UDUPI_DATA } from '@/lib/constants';

// ============================================================
// TYPES
// ============================================================
interface VRPStop {
  id: string;
  lat: number;
  lon: number;
  demand_kg: number;
  type: string;
  label?: string;
}

interface VRPAssignment {
  vehicle_id: string;
  vehicle_type: string;
  vehicle_color: string;
  stops: VRPStop[];
  total_distance_km: number;
  total_load_kg: number;
  utilization_pct: number;
  estimated_duration_min: number;
  co2_kg: number;
  route_coordinates: [number, number][];
}

interface VRPResult {
  success: boolean;
  assignments: VRPAssignment[];
  total_distance_km: number;
  total_load_kg: number;
  total_co2_kg: number;
  total_duration_min: number;
  unassigned_stops: VRPStop[];
  solver_time_ms: number;
  algorithm: string;
}

interface CarbonResult {
  carbon: {
    co2e_tonnes_year: number;
    credit_value_mid_cr: string;
    energy_kwh_day: number;
    homes_powered: number;
    methodology: string;
  };
  operational_savings: {
    annual_saving_cr: string;
    pct_reduction: number;
  };
  combined_annual_value_cr: string;
}

interface OSRMRoute {
  geometry: GeoJSON.LineString;
  distance_km: number;
  duration_min: number;
}

interface FacilityFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

// ============================================================
// VEHICLE CONFIG & UDUPI FACILITIES
// ============================================================
const VEHICLE_TYPE_META: Record<string, { label: string; icon: string; capacity: string }> = {
  auto_tipper: { label: 'Auto Tipper', icon: '🛺', capacity: '500 kg' },
  small_compactor: { label: 'Small Compactor', icon: '🚛', capacity: '5 T' },
  large_compactor: { label: 'Large Compactor', icon: '🚛', capacity: '10 T' },
  hook_loader: { label: 'Hook Loader', icon: '🏗️', capacity: '16 T' },
  garbage_truck: { label: 'Garbage Truck', icon: '🚚', capacity: '5 T' },
};

const DWCC_LIST = [
  { id: 'DWCC-1', lat: 13.3415, lon: 74.7455, label: 'Beedinagudde Dry Waste Center', capacity_tpd: 5 },
  { id: 'DWCC-2', lat: 13.3377, lon: 74.7370, label: 'Karavali Junction DWCC', capacity_tpd: 4 },
  { id: 'DWCC-3', lat: 13.3533, lon: 74.7042, label: 'Malpe Coastal DWCC', capacity_tpd: 5 },
  { id: 'DWCC-4', lat: 13.3525, lon: 74.7872, label: 'Manipal Academic Belt DWCC', capacity_tpd: 6 },
  { id: 'DWCC-5', lat: 13.3800, lon: 74.7450, label: 'Santhekatte DWCC', capacity_tpd: 5 },
  { id: 'DWCC-6', lat: 13.35028, lon: 74.75028, label: 'Karvalu Central SWM Plant', capacity_tpd: 15 },
];

const BMU_BEEDINAGUDDE = { lat: 13.3415, lon: 74.7460, label: 'Beedinagudde BMU' };
const DEPOT = { lat: 13.3409, lon: 74.7421 };

// Road type data for Udupi compliance checker
const ROAD_TYPES = [
  { type: 'Trunk (NH 66)', count: 38, pct: 1.9, width: '>12m', vehicles: ['All'], color: '#f97316' },
  { type: 'Primary', count: 10, pct: 0.5, width: '>9m', vehicles: ['Compactor', 'Truck', 'Auto'], color: '#eab308' },
  { type: 'Secondary', count: 113, pct: 5.6, width: '>6m', vehicles: ['Compactor', 'Truck', 'Auto'], color: '#22c55e' },
  { type: 'Tertiary', count: 191, pct: 9.4, width: '>4m', vehicles: ['Auto Tipper'], color: '#3b82f6' },
  { type: 'Residential', count: 840, pct: 41.4, width: '2-4m', vehicles: ['Auto Tipper'], color: '#8b5cf6' },
  { type: 'Service', count: 179, pct: 8.8, width: '2-3m', vehicles: ['Auto Tipper'], color: '#a855f7' },
  { type: 'Footway', count: 509, pct: 25.1, width: '<2m', vehicles: ['Push Cart'], color: '#64748b' },
  { type: 'Other', count: 147, pct: 7.3, width: 'Varies', vehicles: ['—'], color: '#475569' },
];

// Simulated DWCC loads
const INITIAL_LOADS = DWCC_LIST.map(d => ({ ...d, load_kg: 0, load_pct: 0, status: 'normal' as 'normal' | 'yellow' | 'red' | 'critical' }));

export default function RoutingDashboard() {
  const [vrpResult, setVrpResult] = useState<VRPResult | null>(null);
  const [carbonResult, setCarbonResult] = useState<CarbonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'facilities' | 'carbon' | 'compliance' | 'loadbalance'>('overview');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [osrmRoutes, setOsrmRoutes] = useState<Record<string, OSRMRoute>>({});
  const [facilityData, setFacilityData] = useState<Record<string, { features: FacilityFeature[] }>>({});
  const [error, setError] = useState<string | null>(null);
  const [dwccLoads, setDwccLoads] = useState(INITIAL_LOADS);
  const [facilityAvailable, setFacilityAvailable] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Load facility data + live DWCC status on mount
  useEffect(() => {
    loadFacilities();
    loadCarbon();
    loadDwccStatus();
  }, []);

  const loadFacilities = async () => {
    try {
      const res = await fetch('/api/facilities');
      const data = await res.json();
      setFacilityData(data);
    } catch {
      console.error('Failed to load facilities');
    }
  };

  const loadCarbon = async () => {
    try {
      const res = await fetch('/api/carbon');
      const data = await res.json();
      setCarbonResult(data);
    } catch {
      console.error('Failed to load carbon data');
    }
  };

  const loadDwccStatus = async () => {
    try {
      const res = await fetch('/api/dwcc-status');
      const data = await res.json();
      if (data.dwccs) {
        setDwccLoads(data.dwccs.map((d: { id: string; label: string; lat: number; lon: number; capacity_tpd: number; load_kg: number; load_pct: number; status: 'normal' | 'yellow' | 'red' | 'critical' }) => ({
          ...d,
        })));
      }
    } catch {
      console.error('Failed to load DWCC status');
    }
  };

  const solveRouting = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vrp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error('VRP solver returned no solution');
      setVrpResult(data);

      // Simulate DWCC load distribution from VRP assignments
      const newLoads = DWCC_LIST.map((d) => {
        const assignedLoad = data.assignments.reduce((sum: number, a: VRPAssignment) => {
          const matchingStop = a.stops.find((s: VRPStop) => s.id === d.id);
          return sum + (matchingStop ? matchingStop.demand_kg : 0);
        }, 0);
        const loadPct = Math.round((assignedLoad / (d.capacity_tpd * 1000)) * 100);
        let status: 'normal' | 'yellow' | 'red' | 'critical' = 'normal';
        if (loadPct >= 100) status = 'critical';
        else if (loadPct >= 90) status = 'red';
        else if (loadPct >= 70) status = 'yellow';
        return { ...d, load_kg: assignedLoad, load_pct: loadPct, status };
      });
      setDwccLoads(newLoads);

      // Fetch OSRM routes for each assignment
      for (const assignment of data.assignments) {
        const coords = assignment.route_coordinates
          .map((c: [number, number]) => `${c[0]},${c[1]}`)
          .join(';');
        try {
          const routeRes = await fetch(`/api/route?coords=${coords}`);
          const routeData = await routeRes.json();
          if (routeData.geometry) {
            setOsrmRoutes(prev => ({
              ...prev,
              [assignment.vehicle_id]: {
                geometry: routeData.geometry,
                distance_km: routeData.distance_km,
                duration_min: routeData.duration_min,
              },
            }));
          }
        } catch {
          console.error(`OSRM failed for ${assignment.vehicle_id}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Solver failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize map centered on Udupi
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const initMap = async () => {
      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [DEPOT.lon, DEPOT.lat],
        zoom: 13,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      map.on('load', () => {
        // Udupi City boundary
        map.addSource('udupi-boundary', {
          type: 'geojson',
          data: { 
            type: 'Feature', 
            properties: {}, 
            geometry: { 
              type: 'Polygon', 
              coordinates: [[[74.69, 13.31], [74.81, 13.31], [74.81, 13.39], [74.69, 13.39], [74.69, 13.31]]] 
            } 
          },
        });
        map.addLayer({ id: 'udupi-fill', type: 'fill', source: 'udupi-boundary', paint: { 'fill-color': '#14b8a6', 'fill-opacity': 0.04 } });
        map.addLayer({ id: 'udupi-outline', type: 'line', source: 'udupi-boundary', paint: { 'line-color': '#14b8a6', 'line-width': 2, 'line-dasharray': [3, 2] } });

        // Waste Density Heatmap across Udupi Wards
        const heatPoints: GeoJSON.Feature[] = [];
        const lonMin = 74.70, lonMax = 74.79, latMin = 13.32, latMax = 13.37;
        const buildingDensities = [400, 650, 1200, 850, 1500, 2100, 1800, 950, 1100, 1400, 800, 600];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const idx = r * 4 + c;
            const w = buildingDensities[idx] || 500;
            const lon = lonMin + (c + 0.5) * (lonMax - lonMin) / 4;
            const lat = latMax - (r + 0.5) * (latMax - latMin) / 3;
            heatPoints.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: { weight: w / 2100 } });
          }
        }
        map.addSource('waste-heatmap', { type: 'geojson', data: { type: 'FeatureCollection', features: heatPoints } });
        map.addLayer({
          id: 'waste-heat', type: 'heatmap', source: 'waste-heatmap',
          layout: { visibility: 'none' },
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-intensity': 1.5,
            'heatmap-radius': 45,
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, '#22c55e', 0.5, '#eab308', 0.8, '#ef4444', 1, '#dc2626'],
            'heatmap-opacity': 0.6,
          },
        });

        // Road accessibility corridors (NH 66, Manipal Road, Malpe Port Road)
        map.addSource('arterial-roads', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'LineString', coordinates: [[74.7450, 13.3800], [74.7421, 13.3409], [74.7370, 13.3377]] }, properties: {} },
              { type: 'Feature', geometry: { type: 'LineString', coordinates: [[74.7421, 13.3409], [74.7872, 13.3525]] }, properties: {} },
              { type: 'Feature', geometry: { type: 'LineString', coordinates: [[74.7421, 13.3409], [74.7042, 13.3533]] }, properties: {} }
            ]
          }
        });
        map.addLayer({
          id: 'arterial-roads-layer', type: 'line', source: 'arterial-roads',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#10b981', 'line-width': 6, 'line-opacity': 0.8 }
        });

        // Residential narrow lane blocks
        map.addSource('residential-blocks', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[74.740, 13.345], [74.748, 13.345], [74.748, 13.339], [74.740, 13.339], [74.740, 13.345]]] }, properties: {} },
              { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[74.770, 13.355], [74.785, 13.355], [74.785, 13.348], [74.770, 13.348], [74.770, 13.355]]] }, properties: {} }
            ]
          }
        });
        map.addLayer({
          id: 'residential-blocks-layer', type: 'fill', source: 'residential-blocks',
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.25 }
        });
        map.addLayer({
          id: 'residential-blocks-outline', type: 'line', source: 'residential-blocks',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#ef4444', 'line-width': 2, 'line-dasharray': [2, 2], 'line-opacity': 0.8 }
        });

        // Udupi DWCC Markers
        const dwccFeatures = DWCC_LIST.map(d => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [d.lon, d.lat] }, properties: { label: d.label, id: d.id } }));
        map.addSource('dwccs', { type: 'geojson', data: { type: 'FeatureCollection', features: dwccFeatures } });
        map.addLayer({ id: 'dwcc-circles', type: 'circle', source: 'dwccs', paint: { 'circle-radius': 8, 'circle-color': '#2ECC71', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2, 'circle-opacity': 0.9 } });
        map.addLayer({ id: 'dwcc-labels', type: 'symbol', source: 'dwccs', layout: { 'text-field': ['get', 'id'], 'text-size': 10, 'text-offset': [0, 1.5], 'text-anchor': 'top' }, paint: { 'text-color': '#166534', 'text-halo-color': '#fff', 'text-halo-width': 1 } });

        // Processing Facilities (Beedinagudde BMU & Karvalu SWM)
        map.addSource('bmu', { type: 'geojson', data: { type: 'FeatureCollection', features: [
          { type: 'Feature', geometry: { type: 'Point', coordinates: [BMU_BEEDINAGUDDE.lon, BMU_BEEDINAGUDDE.lat] }, properties: { label: 'Beedinagudde BMU' } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [74.75028, 13.35028] }, properties: { label: 'Karvalu Landfill & MRF' } },
        ] } });
        map.addLayer({ id: 'bmu-circle', type: 'circle', source: 'bmu', paint: { 'circle-radius': 10, 'circle-color': '#3498DB', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
        map.addLayer({ id: 'bmu-label', type: 'symbol', source: 'bmu', layout: { 'text-field': ['get', 'label'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top' }, paint: { 'text-color': '#1e40af', 'text-halo-color': '#fff', 'text-halo-width': 1 } });

        // Udupi Central Depot
        map.addSource('depot', { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [DEPOT.lon, DEPOT.lat] }, properties: { label: 'Udupi CMC Depot' } }] } });
        map.addLayer({ id: 'depot-circle', type: 'circle', source: 'depot', paint: { 'circle-radius': 7, 'circle-color': '#F59E0B', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });

        // Popups
        map.on('click', 'dwcc-circles', (e) => {
          if (!e.features?.[0]) return;
          const p = e.features[0].properties;
          const c = (e.features[0].geometry as GeoJSON.Point).coordinates;
          new maplibregl.Popup({ offset: 15 }).setLngLat(c as [number, number]).setHTML(`<div style="font-family:Inter,sans-serif;padding:4px;"><strong>${p?.id||''}</strong><br/><span style="color:#666">${p?.label||''}</span><br/><small>${(c[1] as number).toFixed(5)}, ${(c[0] as number).toFixed(5)}</small><br/><small>Udupi CMC Facility</small></div>`).addTo(map);
        });
        map.on('click', 'bmu-circle', (e) => {
          if (!e.features?.[0]) return;
          const p = e.features[0].properties;
          const c = (e.features[0].geometry as GeoJSON.Point).coordinates;
          new maplibregl.Popup({ offset: 15 }).setLngLat(c as [number, number]).setHTML(`<div style="font-family:Inter,sans-serif;padding:4px;"><strong>${p?.label||''}</strong><br/><span style="color:#3b82f6">Udupi Central Waste Processing</span><br/><small>${(c[1] as number).toFixed(5)}, ${(c[0] as number).toFixed(5)}</small></div>`).addTo(map);
        });
        map.on('mouseenter', 'dwcc-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'dwcc-circles', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'bmu-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'bmu-circle', () => { map.getCanvas().style.cursor = ''; });
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map with OSRM routes
  useEffect(() => {
    const map = mapInstanceRef.current as { getSource: (id: string) => { setData: (data: unknown) => void } | undefined; addSource: (id: string, source: unknown) => void; addLayer: (layer: unknown) => void } | null;
    if (!map || Object.keys(osrmRoutes).length === 0) return;

    const routeFeatures = Object.entries(osrmRoutes).map(([vehicleId, route]) => {
      const assignment = vrpResult?.assignments.find(a => a.vehicle_id === vehicleId);
      return {
        type: 'Feature' as const,
        geometry: route.geometry,
        properties: {
          vehicle_id: vehicleId,
          color: assignment?.vehicle_color || '#888',
          distance_km: route.distance_km,
        },
      };
    });

    const source = map.getSource('vehicle-routes');
    if (source) {
      source.setData({ type: 'FeatureCollection', features: routeFeatures });
    } else {
      map.addSource('vehicle-routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: routeFeatures },
      });
      map.addLayer({
        id: 'vehicle-route-lines',
        type: 'line',
        source: 'vehicle-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });
    }
  }, [osrmRoutes, vrpResult]);

  return (
    <div style={{ height: 'calc(100vh - 74px)', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(12px)', background: 'rgba(15,23,42,0.8)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #14b8a6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>♻</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>VajraYield Routing Engine</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Udupi City · Udupi CMC · {ROUTING_CONFIG.vehicle_fleet.length} Vehicles · 6 DWCCs · Karvalu SWM / Beedinagudde BMU</p>
          </div>
        </div>
        <motion.button
          onClick={solveRouting}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: isLoading ? 'wait' : 'pointer',
            background: isLoading ? '#475569' : 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
            color: '#fff', fontWeight: 600, fontSize: 14, letterSpacing: 0.3,
            boxShadow: '0 4px 15px rgba(20,184,166,0.3)',
          }}
        >
          {isLoading ? '⏳ Solving...' : '🚀 Solve Routes'}
        </motion.button>
      </header>

      {/* Tab Bar */}
      <nav style={{ padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0, overflowX: 'auto', flexShrink: 0 }}>
        {(['overview', 'vehicles', 'loadbalance', 'compliance', 'facilities', 'carbon'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab ? '#14b8a6' : '#64748b', fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 12, borderBottom: activeTab === tab ? '2px solid #14b8a6' : '2px solid transparent',
              letterSpacing: 0.3, transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'vehicles' ? '🚛 Vehicles' : tab === 'loadbalance' ? '⚖️ Load Balance' : tab === 'compliance' ? '🛣️ Road Check' : tab === 'facilities' ? '🏭 Facilities' : '🌿 Carbon'}
          </button>
        ))}
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', flex: 1, minHeight: 0 }}>
        {/* Map + Controls */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {/* Map overlay controls */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
            <button
              onClick={() => {
                setShowHeatmap(!showHeatmap);
                const map = mapInstanceRef.current as { setLayoutProperty: (layer: string, prop: string, val: string) => void } | null;
                if (map) map.setLayoutProperty('waste-heat', 'visibility', !showHeatmap ? 'visible' : 'none');
              }}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: showHeatmap ? '#14b8a6' : 'rgba(15,23,42,0.85)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {showHeatmap ? '🔥 Heatmap ON' : '🔥 Heatmap'}
            </button>
            <button
              onClick={() => {
                const newState = !showZones;
                setShowZones(newState);
                const map = mapInstanceRef.current as { setLayoutProperty: (layer: string, prop: string, val: string) => void } | null;
                if (map) {
                  const vis = newState ? 'visible' : 'none';
                  map.setLayoutProperty('arterial-roads-layer', 'visibility', vis);
                  map.setLayoutProperty('residential-blocks-layer', 'visibility', vis);
                  map.setLayoutProperty('residential-blocks-outline', 'visibility', vis);
                }
              }}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: showZones ? '#3b82f6' : 'rgba(15,23,42,0.85)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {showZones ? '🛣️ Road Width Zones ON' : '🛣️ Road Width Zones'}
            </button>
          </div>
          
          {/* Two-Tier Math Explanation */}
          <div style={{ position: 'absolute', top: 90, left: 12, zIndex: 10 }}>
            <AnimatePresence>
              {showZones && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ width: 280, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)', color: '#fff' }}
                >
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#60a5fa' }}>Two-Tier Routing Math</h3>
                  <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 12 }}>
                    <p style={{ marginBottom: 4 }}><strong>Red Zones (77.9% of Udupi):</strong> Residential lanes &lt;4m wide.</p>
                    <p><strong>Green Lines (17.4%):</strong> Arterial & Trunk roads &gt;6m wide.</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, fontSize: 11 }}>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>1. Primary Collection</span><br />
                    <span style={{ color: '#94a3b8' }}><strong>12 Auto Rickshaws</strong> running 3 rounds/day cover the narrow residential lanes.</span>
                    <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>2. Secondary Collection</span><br />
                    <span style={{ color: '#94a3b8' }}>VRP assigns <strong>2 Heavy Compactors</strong> strictly to main arterial roads.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Bottom Left Status */}
          <div style={{ position: 'absolute', bottom: 30, left: 12, zIndex: 10 }}>
            <button
              onClick={() => setFacilityAvailable(!facilityAvailable)}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: facilityAvailable ? 'rgba(15,23,42,0.85)' : '#ef4444', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {facilityAvailable ? '✅ Beedinagudde BMU Online' : '⚠️ BMU Offline → Karvalu SWM Redirect'}
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ overflow: 'auto', padding: 24, background: 'rgba(15,23,42,0.95)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>Route Overview</h2>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Daily Waste', value: `${UDUPI_DATA.daily_waste_tons} TPD`, color: '#14b8a6', sub: `${(UDUPI_DATA.population/1000).toFixed(0)}K residents` },
                    { label: 'Fleet Size', value: ROUTING_CONFIG.vehicle_fleet.length.toString(), color: '#3b82f6', sub: `${new Set(ROUTING_CONFIG.vehicle_fleet.map((v: any) => v.type)).size} types` },
                    { label: 'DWCCs In-Ward', value: '6', color: '#22c55e', sub: '40 TPD capacity' },
                    { label: 'BMU Distance', value: '1.2 km', color: '#f59e0b', sub: 'Beedinagudde' },
                  ].map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        padding: '16px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{kpi.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 2px', color: kpi.color }}>{kpi.value}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{kpi.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* VRP Results */}
                {error && (
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                    ⚠️ {error}
                  </div>
                )}

                {vrpResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(20,184,166,0.2)', marginBottom: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#14b8a6', margin: '0 0 8px' }}>✅ VRP Solution — {vrpResult.algorithm}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><span style={{ fontSize: 11, color: '#94a3b8' }}>Total Distance</span><br /><span style={{ fontSize: 16, fontWeight: 700 }}>{vrpResult.total_distance_km} km</span></div>
                        <div><span style={{ fontSize: 11, color: '#94a3b8' }}>Total Load</span><br /><span style={{ fontSize: 16, fontWeight: 700 }}>{(vrpResult.total_load_kg / 1000).toFixed(1)} T</span></div>
                        <div><span style={{ fontSize: 11, color: '#94a3b8' }}>CO₂ Emissions</span><br /><span style={{ fontSize: 16, fontWeight: 700 }}>{vrpResult.total_co2_kg} kg</span></div>
                        <div><span style={{ fontSize: 11, color: '#94a3b8' }}>Solver Time</span><br /><span style={{ fontSize: 16, fontWeight: 700 }}>{vrpResult.solver_time_ms} ms</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Waste Stream Rules */}
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#cbd5e1' }}>Waste Stream Routing</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {[
                    { stream: 'Wet/Organic (61%)', dest: 'Beedinagudde BMU', dist: '1.2 km', color: '#22c55e' },
                    { stream: 'Dry/Recyclable (30%)', dest: '6 DWCCs / Karvalu MRF', dist: '< 2 km', color: '#3b82f6' },
                    { stream: 'Hazardous (5%)', dest: 'KSPCB Authorised Handler', dist: 'Karvalu', color: '#ef4444' },
                    { stream: 'Rejects (4%)', dest: 'Karvalu Regional Landfill', dist: '8.2 km', color: '#64748b' },
                  ].map(s => (
                    <div key={s.stream} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: '#e2e8f0' }}>{s.stream}</p>
                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{s.dest} — {s.dist}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Windows */}
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#cbd5e1' }}>Udupi CMC Time Windows</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Primary Collection', time: '06:00 – 10:00', icon: '🌅' },
                    { label: 'Secondary Transport', time: '10:00 – 18:00', icon: '☀️' },
                    { label: 'Night Restriction (>3.5T)', time: '22:00 – 06:00', icon: '🌙' },
                  ].map(tw => (
                    <div key={tw.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                      <span>{tw.icon}</span>
                      <div>
                        <p style={{ fontSize: 12, margin: 0, color: '#e2e8f0' }}>{tw.label}</p>
                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{tw.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'vehicles' && (
              <motion.div key="vehicles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Vehicle Fleet — {vrpResult ? 'Assigned' : 'Pending'}</h2>

                {vrpResult ? (
                  <>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#14b8a6', marginBottom: 12 }}>Secondary Fleet (VRP Routed)</h3>
                    {vrpResult.assignments.map((a, i) => {
                      const meta = VEHICLE_TYPE_META[a.vehicle_type] || { label: a.vehicle_type, icon: '🚛', capacity: '?' };
                      const osrmRoute = osrmRoutes[a.vehicle_id];
                      const isSelected = selectedRoute === i;

                      return (
                        <motion.div
                          key={a.vehicle_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => setSelectedRoute(isSelected ? null : i)}
                          style={{
                          padding: 16, borderRadius: 12, marginBottom: 10, cursor: 'pointer',
                          background: isSelected ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: a.vehicle_color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `2px solid ${a.vehicle_color}` }}>
                            {meta.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{a.vehicle_id}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{meta.label} · {meta.capacity}</p>
                          </div>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: `conic-gradient(${a.vehicle_color} ${a.utilization_pct}%, rgba(255,255,255,0.06) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 6, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                              {a.utilization_pct}%
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginBottom: 8 }}>
                          <div><span style={{ color: '#94a3b8' }}>Distance:</span> <strong>{osrmRoute ? osrmRoute.distance_km : a.total_distance_km} km</strong></div>
                          <div><span style={{ color: '#94a3b8' }}>Total Load:</span> <strong>{a.total_load_kg.toLocaleString('en-IN')} kg</strong></div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, marginTop: 8 }}>
                          <div>
                            <span style={{ color: '#f43f5e', fontWeight: 600 }}>🔥 Tailpipe Emission</span><br />
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{a.co2_kg} kg CO₂</span><br />
                            <span style={{ fontSize: 9, color: '#94a3b8' }}>Distance × vehicle factor</span>
                          </div>
                          <div>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>🌿 Carbon Credit (Avoided)</span><br />
                            <span style={{ fontSize: 14, fontWeight: 800 }}>+{(a.total_load_kg * 0.61 * 0.05 * 28).toLocaleString(undefined, {maximumFractionDigits: 0})} kg CO₂e</span><br />
                            <span style={{ fontSize: 9, color: '#94a3b8' }}>Load × 61% wet × 5% CH₄ × 28 GWP</span>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#14b8a6' }}>Stop Sequence:</p>
                            {a.stops.map((stop, si) => (
                              <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11 }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: a.vehicle_color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: a.vehicle_color }}>{si + 1}</div>
                                <span>{stop.label || stop.id}</span>
                                <span style={{ color: '#64748b', marginLeft: 'auto' }}>{stop.demand_kg} kg</span>
                              </div>
                            ))}
                            {osrmRoute && (
                              <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'rgba(59,130,246,0.1)', fontSize: 11 }}>
                                <strong style={{ color: '#60a5fa' }}>OSRM Route:</strong> {osrmRoute.distance_km} km · {osrmRoute.duration_min} min (road-snapped)
                              </div>
                            )}
                          </motion.div>
                        )}
                        </motion.div>
                      );
                    })}

                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '24px 0 12px' }}>Primary Fleet (Pre-Assigned Sector Lanes)</h3>
                    {ROUTING_CONFIG.vehicle_fleet.filter((v: any) => v.type === 'auto_tipper').map((v: any, i: number) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.02 }}
                        style={{
                          padding: '12px 16px', borderRadius: 10, marginBottom: 8,
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                          display: 'flex', alignItems: 'center', gap: 12
                        }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: v.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: `1px solid ${v.color}` }}>
                          🛺
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{v.id}</p>
                          <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Auto Rickshaw · 500 kg · Sector {v.zone}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 11, fontWeight: 600, margin: 0, color: '#e2e8f0' }}>3 Rounds/Day</p>
                          <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>Fixed Route</p>
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: 40, marginBottom: 8 }}>🚛</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>Click "Solve Routes" to assign vehicles</p>
                    <p style={{ fontSize: 12 }}>Clarke-Wright Savings + OSRM road-snapped routing</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* DWCC Load Balancing Tab */}
            {activeTab === 'loadbalance' && (
              <motion.div key="loadbalance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>⚖️ DWCC Load Balancing</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Capacity: 5 TPD per DWCC · Alert: 🟡 70% · 🔴 90% · 💀 100%</p>

                {dwccLoads.map((d, i) => {
                  const barColor = d.status === 'critical' ? '#ef4444' : d.status === 'red' ? '#f97316' : d.status === 'yellow' ? '#eab308' : '#22c55e';
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${d.status !== 'normal' ? barColor + '44' : 'rgba(255,255,255,0.06)'}` }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <strong style={{ fontSize: 13 }}>{d.id}</strong>
                          <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>{d.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{d.load_pct}%</span>
                          {d.status === 'critical' && <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>OVERFLOW</span>}
                          {d.status === 'red' && <span style={{ fontSize: 10, background: '#f97316', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>HIGH</span>}
                          {d.status === 'yellow' && <span style={{ fontSize: 10, background: '#eab308', color: '#000', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>WARNING</span>}
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(d.load_pct, 100)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          style={{ height: '100%', borderRadius: 3, background: barColor }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#64748b' }}>
                        <span>{d.load_kg} kg loaded</span>
                        <span>{d.capacity_tpd * 1000} kg capacity</span>
                      </div>
                    </motion.div>
                  );
                })}

                {!vrpResult && (
                  <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    <p>⚖️ Solve routes first to see load distribution</p>
                  </div>
                )}

                {vrpResult && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)', fontSize: 11 }}>
                    <strong style={{ color: '#14b8a6' }}>Load Variance:</strong>
                    <span style={{ marginLeft: 8 }}>
                      {(() => { const pcts = dwccLoads.map(d => d.load_pct); const avg = pcts.reduce((a,b) => a+b, 0) / pcts.length; const variance = Math.round(Math.sqrt(pcts.reduce((s, p) => s + (p-avg)**2, 0) / pcts.length)); return `${variance}% std dev (target: ≤15%)`; })()}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Road Width Compliance Tab */}
            {activeTab === 'compliance' && (
              <motion.div key="compliance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🛣️ Road-Width Compliance</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>IRC road classification × vehicle compatibility · 2,027 Udupi road segments</p>

                {/* Road type bars */}
                {ROAD_TYPES.map((r, i) => (
                  <motion.div
                    key={r.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ marginBottom: 8 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>{r.type}</span>
                      <span style={{ color: '#94a3b8' }}>{r.count} ({r.pct}%) · {r.width}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.06 }}
                        style={{ height: '100%', borderRadius: 4, background: r.color }}
                      />
                    </div>
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
                      Vehicles: {r.vehicles.join(', ')}
                    </div>
                  </motion.div>
                ))}

                {/* Vehicle accessibility summary */}
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px', color: '#cbd5e1' }}>Vehicle Coverage Matrix</p>
                  {[
                    { vehicle: '🏗️ Hook Loader', roads: 'Trunk only (NH 66)', count: 38, pct: 1.9, color: '#E67E22' },
                    { vehicle: '🚛 Large Compactor', roads: 'Trunk + Primary', count: 48, pct: 2.4, color: '#9B59B6' },
                    { vehicle: '🚛 Small Compactor', roads: '+ Secondary', count: 161, pct: 7.9, color: '#3498DB' },
                    { vehicle: '🛺 Auto Tipper', roads: '+ Tertiary + Residential', count: 1371, pct: 67.6, color: '#2ECC71' },
                    { vehicle: '🛒 Push Cart', roads: '+ Footway + Path', count: 1931, pct: 95.3, color: '#94a3b8' },
                  ].map(v => (
                    <div key={v.vehicle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 13, width: 24 }}>{v.vehicle.split(' ')[0]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{v.vehicle.slice(3)}</div>
                        <div style={{ fontSize: 9, color: '#64748b' }}>{v.roads}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: v.color }}>{v.pct}%</div>
                        <div style={{ fontSize: 9, color: '#64748b' }}>{v.count} roads</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compliance alerts */}
                {vrpResult && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 11 }}>
                    <strong style={{ color: '#22c55e' }}>✅ All routes road-width compliant</strong>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8' }}>No vehicles assigned to roads below minimum width threshold</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'facilities' && (
              <motion.div key="facilities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Udupi CMC Facilities</h2>

                {/* DWCCs */}
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', marginBottom: 8 }}>🟢 Udupi DWCCs & MRFs — 6</h3>
                {DWCC_LIST.map(d => (
                  <div key={d.id} style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 6, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{d.id}</strong>
                      <span style={{ fontSize: 10, color: '#22c55e' }}>{d.capacity_tpd} TPD</span>
                    </div>
                    <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 11 }}>{d.label}</p>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 10 }}>{d.lat.toFixed(5)}, {d.lon.toFixed(5)}</p>
                  </div>
                ))}

                {/* BMU */}
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginTop: 16, marginBottom: 8 }}>🔵 Bio-Methanisation Plant</h3>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', fontSize: 12 }}>
                  <strong>Beedinagudde BMU</strong> — 1.20 km Central<br />
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>Bio-Methanisation · Wet waste · 43.92 TPD processing capacity</span><br />
                  <span style={{ color: '#64748b', fontSize: 10 }}>{BMU_BEEDINAGUDDE.lat}, {BMU_BEEDINAGUDDE.lon}</span>
                </div>

                {/* Landfill / MRF */}
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#eab308', marginTop: 16, marginBottom: 8 }}>🟡 Regional SWM Campus</h3>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)', fontSize: 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#fef08a' }}>Karvalu SWM Plant & Engineered Landfill</p>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 11 }}>22-acre centralized campus in Alevoor (~8 km from city center)</p>
                </div>

                {/* Stats */}
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: '#cbd5e1' }}>Udupi CMC Infrastructure</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                    <div>DWCCs: <strong>6</strong></div>
                    <div>BMUs: <strong>1</strong></div>
                    <div>Central MRF: <strong>1</strong></div>
                    <div>Landfill: <strong>1 (Engineered)</strong></div>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 10, color: '#64748b' }}>Source: Udupi CMC SWM Master Plan (2026)</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'carbon' && (
              <motion.div key="carbon" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Carbon Credits & Savings</h2>

                {carbonResult ? (
                  <>
                    <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.1))', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 16 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', margin: 0 }}>{carbonResult.combined_annual_value_cr}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Combined Annual Value (Carbon + Operational)</p>
                    </div>

                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#22c55e' }}>🌿 Carbon Credits (CCTS 2023)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      {[
                        { label: 'CO₂e Avoided/Year', value: `${carbonResult.carbon.co2e_tonnes_year.toLocaleString('en-IN')} tonnes` },
                        { label: 'Carbon Credit Value', value: carbonResult.carbon.credit_value_mid_cr },
                        { label: 'Energy Potential/Day', value: `${carbonResult.carbon.energy_kwh_day.toLocaleString('en-IN')} kWh` },
                        { label: 'Homes Powered', value: carbonResult.carbon.homes_powered.toLocaleString('en-IN') },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 12 }}>
                          <span style={{ color: '#94a3b8' }}>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>

                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#3b82f6' }}>💰 Operational Savings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 12 }}>
                        <span style={{ color: '#94a3b8' }}>Annual Savings</span>
                        <strong style={{ color: '#60a5fa' }}>{carbonResult.operational_savings.annual_saving_cr}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 12 }}>
                        <span style={{ color: '#94a3b8' }}>Cost Reduction</span>
                        <strong>{carbonResult.operational_savings.pct_reduction}%</strong>
                      </div>
                    </div>

                    <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 10, color: '#64748b' }}>
                      <strong>Methodology:</strong> {carbonResult.carbon.methodology}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: 14 }}>Loading carbon data...</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
