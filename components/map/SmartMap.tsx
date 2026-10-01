'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Link from 'next/link';
import * as pmtiles from 'pmtiles';
import { UDUPI_DATA } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DumpSite {
  id: string;
  lat: number;
  lon: number;
  risk: 'high' | 'medium' | 'low';
  area_sqm: number;
  ward: string;
  detected?: string;
}

interface Zone {
  zone_id: string;
  bounds: [number, number, number, number];
  waste_kg_day: number;
  risk: string;
}

interface ZoneAnalysis {
  total_structures: number;
  estimated_population: number;
  waste_per_day_kg: number;
  zones: Zone[];
  residential_count: number;
  commercial_count: number;
  mixed_count: number;
  features?: any[];
}

interface TruckRoutes {
  baseline: { segments: number[][][]; total_km: number };
  optimized: { segments: number[][][]; total_km: number };
}

// ─── Layer config ─────────────────────────────────────────────────────────────

type LayerCategory = 'SPATIAL' | 'BUILDING' | 'DATA';

interface LayerConfig {
  id: string;
  label: string;
  color: string;
  defaultOn: boolean;
  count?: string;
  category: LayerCategory;
}

const LAYERS: LayerConfig[] = [
  // SPATIAL
  { id: 'ward',    label: 'Ward Boundary', color: '#00d4aa', defaultOn: true, category: 'SPATIAL' },
  { id: 'roads',   label: 'Road Network',  color: '#475569', defaultOn: true, category: 'SPATIAL' },
  { id: 'dumps',   label: 'Dry Waste Centers', color: '#0ea5e9', defaultOn: true, count: '4', category: 'SPATIAL' },
  { id: 'heatmap', label: 'Waste Heatmap', color: '#f59e0b', defaultOn: false, category: 'SPATIAL' },

  // BUILDING
  { id: 'building-footprints', label: 'Building Footprints', color: '#a855f7', defaultOn: false, count: '9,483', category: 'BUILDING' },
  { id: '3d-buildings',        label: '3D Buildings',        color: '#3b82f6', defaultOn: false, category: 'BUILDING' },
  

  // DATA
  { id: 'zone-grid',   label: 'Zone Grid',   color: '#fb923c', defaultOn: false, category: 'DATA' },
  { id: 'openspaces',  label: 'Open Spaces',  color: '#22c55e', defaultOn: false, category: 'DATA' },
  { id: 'water',       label: 'Water Bodies & Rivers', color: '#0ea5e9', defaultOn: false, category: 'DATA' },
  { id: 'lulc',        label: 'LULC Analysis', color: '#06b6d4', defaultOn: false, category: 'DATA' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOn]))
  );

  // ── Initialize Map ────────────────────────────────────────────────────────
  // Fixed Git merge conflicts missing declarations 
  const [zoneAnalysisData, setZoneAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try { maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile); } catch(e) {}
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [74.7421, 13.3409],   // FIX 1: Start on Udupi City
      zoom: 14,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    popup.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '280px',
    });

    map.current.on('load', async () => {
      const m = map.current!;

      // ── Global JSON Cache to prevent main-thread lag on tab swapping ──
      const getCachedJson = (() => {
        if (typeof window === 'undefined') return (url: string) => fetch(url).then(r => r.json());
        const w = window as any;
        w.__geojsonCache = w.__geojsonCache || {};
        return (url: string) => {
          if (!w.__geojsonCache[url]) {
            w.__geojsonCache[url] = fetch(url).then(r => r.json());
          }
          return w.__geojsonCache[url];
        };
      })();

      // ── Fetch all data (Cached) ──────────────────────────────────────────
      const [ward, roads, dumps, buildingsOsm, truckRaw, zoneRaw, openSpaces, waterBodies, districtBoundary, lulcData] =
        await Promise.all([
          getCachedJson('/data/udupi_wards.geojson'),
          getCachedJson('/data/udupi_road_network.geojson'),
          getCachedJson('/data/udupi_waste_facilities.geojson'),
          getCachedJson('/data/buildings_udupi.geojson').catch(() => null),
          getCachedJson('/data/truck_routes.json'),
          getCachedJson('/data/ward_grid_zones.geojson'),
          getCachedJson('/data/open_spaces.geojson'),
          getCachedJson('/data/water_bodies.geojson'),
          getCachedJson('/data/udupi_district_boundary.geojson').catch(() => null),
          getCachedJson('/data/udupi_lulc.geojson').catch(() => null),
        ]);

      const truckRoutes: TruckRoutes = truckRaw;
      const zoneAnalysis: ZoneAnalysis = zoneRaw;

      // ═══════════════════════════════════════════════════════════════
      // FIX 7: Ward Boundary — 3px wide, full opacity, subtle fill
      // ═══════════════════════════════════════════════════════════════
      m.addSource('ward-source', { type: 'geojson', data: ward });
      m.addLayer({
        id: 'ward-fill',
        type: 'fill',
        source: 'ward-source',
        paint: { 'fill-color': '#00d4aa', 'fill-opacity': 0.04 },
        layout: { visibility: 'visible' },
      });
      m.addLayer({
        id: 'ward-line',
        type: 'line',
        source: 'ward-source',
        paint: { 'line-color': '#00d4aa', 'line-width': 3, 'line-opacity': 1.0 },
        layout: { visibility: 'visible' },
      });

      m.on('click', 'ward-fill', () => setSidebarOpen(true));
      m.on('mouseenter', 'ward-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'ward-fill', () => { m.getCanvas().style.cursor = ''; });

      // ═══════════════════════════════════════════════════════════════
      // FIX ZONE GRID - GeoJSON features from zone bounds
      // ═══════════════════════════════════════════════════════════════
      setZoneAnalysisData(zoneAnalysis); // Store for sidebar summary

      const zoneFeatures = zoneAnalysis.features ? zoneAnalysis.features.map((f: any) => ({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: {
          zone_id: f.properties.zone_id,
          waste_kg_day: f.properties.waste_kg_day || 0,
          population: f.properties.population || Math.round((f.properties.waste_kg_day || 0) / 0.45),
          risk: f.properties.risk || 'medium',
          center_lon: f.geometry.coordinates[0][0][0],
          center_lat: f.geometry.coordinates[0][0][1]
        }
      })) : (zoneAnalysis.zones || []).map((zone: any) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [zone.bounds[0], zone.bounds[1]], [zone.bounds[2], zone.bounds[1]], 
            [zone.bounds[2], zone.bounds[3]], [zone.bounds[0], zone.bounds[3]], [zone.bounds[0], zone.bounds[1]]
          ]]
        },
        properties: {
          zone_id: zone.zone_id,
          waste_kg_day: zone.waste_kg_day,
          population: zone.population_estimate || Math.round(zone.waste_kg_day / 0.45) || 0,
          risk: zone.risk,
          center_lon: zone.center?.[0] || 0,
          center_lat: zone.center?.[1] || 0
        }
      }));


      m.addSource('zone-grid-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: zoneFeatures }
      });

      m.addLayer({
        id: 'zone-grid-fill',
        type: 'fill',
        source: 'zone-grid-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'waste_kg_day'], 500],
            0,   '#22c55e',   // green
            200, '#f59e0b',   // amber
            500, '#ef4444',   // red
            1000, '#7f1d1d'    // dark red
          ],
          'fill-opacity': 0.45
        }
      });

      m.addLayer({
        id: 'zone-grid-border',
        type: 'line',
        source: 'zone-grid-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#0f766e',
          'line-width': 1.5,
          'line-opacity': 0.7,
          'line-dasharray': [3, 2]
        }
      });

      m.addLayer({
        id: 'zone-grid-labels',
        type: 'symbol',
        source: 'zone-grid-source',
        layout: {
          visibility: 'none',
          'text-field': [
            'concat',
            ['get', 'zone_id'],
            '\n',
            ['to-string', ['round', ['coalesce', ['get', 'waste_kg_day'], 500]]],
            ' kg'
          ],
          'text-size': 11,
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-font': ['Noto Sans Bold', 'Noto Sans Regular']
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.0
        }
      });

      m.on('click', 'zone-grid-fill', (e) => {
        const props = e.features?.[0]?.properties as any;
        if (!props) return;
        
        const riskColor = { high: '#dc2626', medium: '#d97706', low: '#16a34a' }[props.risk as string] || '#64748b';
        const riskBadge = `<span style="background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}44;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;text-transform:uppercase;">${props.risk} risk</span>`;

        const wkg = Math.round(props.waste_kg_day);
        const wetT = (wkg * 0.61 / 1000).toFixed(2);
        const dryT = (wkg * 0.30 / 1000).toFixed(2);
        const hazT = (wkg * 0.05 / 1000).toFixed(2);

        new maplibregl.Popup({ maxWidth: '300px', className: 'zone-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#ffffff;color:#0f172a;padding:14px;border-radius:10px;font-family:Inter,system-ui,sans-serif;width:270px;box-sizing:border-box;border:1px solid #e2e8f0;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-size:16px;font-weight:900;color:#0f766e;">Zone ${props.zone_id}</span>${riskBadge}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:6px;">
                  <div style="color:#64748b;font-size:9px;text-transform:uppercase;font-weight:700;">Waste/Day</div>
                  <div style="color:#d97706;font-size:16px;font-weight:900;">${wkg} kg</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:6px;">
                  <div style="color:#64748b;font-size:9px;text-transform:uppercase;font-weight:700;">Population</div>
                  <div style="color:#0f766e;font-size:16px;font-weight:900;">${Number(props.population).toLocaleString('en-IN')}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:6px;">
                  <div style="color:#64748b;font-size:9px;text-transform:uppercase;font-weight:700;">Residential</div>
                  <div style="color:#0f172a;font-size:16px;font-weight:900;">${props.residential || '—'} bldgs</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:6px;">
                  <div style="color:#64748b;font-size:9px;text-transform:uppercase;font-weight:700;">Commercial</div>
                  <div style="color:#0f172a;font-size:16px;font-weight:900;">${props.commercial || '—'} bldgs</div>
                </div>
              </div>
              <div style="background:#f1f5f9;border:1px solid #cbd5e1;padding:8px 10px;border-radius:6px;margin-bottom:8px;">
                <div style="color:#0284c7;font-size:9px;font-weight:800;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.06em;">WASTE DESTINATIONS (UDUPI CMC)</div>
                <div style="display:grid;gap:4px;">
                  <div style="color:#16a34a;font-size:11px;font-weight:600;">🟢 ${Math.round(wkg*0.61)}kg → <span style="color:#64748b;font-weight:normal;">Beedinagudde BMU</span></div>
                  <div style="color:#0284c7;font-size:11px;font-weight:600;">🔵 ${Math.round(wkg*0.30)}kg → <span style="color:#64748b;font-weight:normal;">Zonal DWCC Hub</span></div>
                  <div style="color:#dc2626;font-size:11px;font-weight:600;">🔴 ${Math.round(wkg*0.05)}kg → <span style="color:#64748b;font-weight:normal;">KSPCB Haz Handler</span></div>
                </div>
              </div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:6px;font-size:11px;color:#475569;line-height:1.4;">
                ${props.risk === 'high' ? '⚠️ Priority collection zone — daily auto-tipper deployment' : props.risk === 'medium' ? '📋 Standard collection — scheduled alternate days' : '✅ Low intensity zone — regular weekly collection'}
              </div>
              <div style="font-size:9px;color:#94a3b8;margin-top:6px;text-align:center">
                Audited baseline: 72.0 TPD Udupi CMC · CPCB 0.435 kg/capita
              </div>
            </div>
          `)
          .addTo(m);
      });

      m.on('mouseenter', 'zone-grid-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'zone-grid-fill', () => { m.getCanvas().style.cursor = ''; });

      // ═══════════ Road Network ═══════════
      m.addSource('roads-source', { type: 'geojson', data: roads });
      m.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'roads-source',
        paint: { 'line-color': '#475569', 'line-width': 1, 'line-opacity': 0.5 },
        layout: { visibility: 'visible' },
      });

      // ═══════════════════════════════════════════════════════════════
      // Accurate Waste Heatmap — True Density via Building Points
      // ═══════════════════════════════════════════════════════════════
      // buildings_udupi_points.geojson contains point features with precise waste_kg_day counts
      m.addSource('heatmap-source', {
        type: 'geojson',
        data: '/data/buildings_udupi_points.geojson',
      });

      m.addLayer({
        id: 'heatmap-fill', // keep id so toggleLayer('heatmap') works
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          // Flatten the weight curve so even low waste buildings contribute to base density
          'heatmap-weight': [
            'interpolate', ['linear'], ['coalesce', ['get', 'waste_kg_day'], 500],
            0, 0,
            10, 0.2,
            100, 0.6,
            500, 1
          ],
          // Massively scale up intensity to reveal the heatmap layers
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            12, 1,
            15, 3,
            18, 5
          ],
          // Gorgeous modern UI colors (Blue->Green->Yellow->Red)
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, '#3b82f6', // blue (low)
            0.3, '#22c55e', // green (moderate)
            0.5, '#eab308', // yellow (medium)
            0.7, '#f97316', // orange (high)
            0.9, '#ef4444', // red (severe)
            1.0, '#7f1d1d'  // dark red (critical)
          ],
          // Much larger radius so the 9000+ building points overlap naturally and blend
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            11, 15,
            14, 30,
            16, 60,
            18, 120
          ],
          'heatmap-opacity': 0.75
        },
        layout: { visibility: 'none' },
      });

      // ═══════════════════════════════════════════════════════════════
      // DWCC Sites — convert DumpSite[] array → GeoJSON FeatureCollection
      // ═══════════════════════════════════════════════════════════════
      const dumpFeatures = (dumps?.type === 'FeatureCollection' ? dumps.features : (dumps || [])).map((d: any) => ({
        type: 'Feature' as const,
        geometry: dumps?.type === 'FeatureCollection' ? d.geometry : { type: 'Point' as const, coordinates: [d.lon, d.lat] },
        properties: {
          id: dumps?.type === 'FeatureCollection' ? d.properties.id || d.properties.name : d.id,
          risk: dumps?.type === 'FeatureCollection' ? d.properties.risk || 'medium' : d.risk,
          area_sqm: dumps?.type === 'FeatureCollection' ? d.properties.area_sqm || 500 : d.area_sqm,
          ward: dumps?.type === 'FeatureCollection' ? d.properties.ward || 'Udupi' : d.ward,
        },
      }));

      m.addSource('dumps-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: dumpFeatures },
      });

      // Pulse halo for high-risk dumps -> large DWCC
      m.addLayer({
        id: 'dumps-pulse',
        type: 'circle',
        source: 'dumps-source',
        filter: ['==', ['get', 'risk'], 'high'],
        paint: {
          'circle-radius': 22,
          'circle-color': '#0ea5e9',
          'circle-opacity': 0.25,
          'circle-stroke-width': 0,
        },
        layout: { visibility: 'visible' },
      });

      m.addLayer({
        id: 'dumps-circle',
        type: 'circle',
        source: 'dumps-source',
        paint: {
          'circle-color': '#0ea5e9',
          'circle-radius': 9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
        layout: { visibility: 'visible' },
      });

      // DWCC click popup
      m.on('click', 'dumps-circle', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:Inter,sans-serif;padding:12px 4px 4px;min-width:200px">
              <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:8px">📍 ${p.name || 'DWCC Centre'}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <span style="background:#0ea5e9;color:white;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">📦 Dry Waste</span>
              </div>
              <div style="font-size:12px;color:#475569">
                <div><b>Capacity:</b> ${p.capacity_tpd ? p.capacity_tpd + ' TPD' : 'N/A'}</div>
                <div><b>Operator:</b> ${p.operator || 'Udupi CMC'}</div>
                <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Source: ${p.source || 'Udupi CMC Official'}</div>
              </div>
            </div>
          `)
          .addTo(m);
      });
      m.on('mouseenter', 'dumps-circle', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'dumps-circle', () => { m.getCanvas().style.cursor = ''; });

      // ═══════════════════════════════════════════════════════════════
      // FIX 3: Building Footprints — Polygon fill from buildings_osm
      // ═══════════════════════════════════════════════════════════════
      if (buildingsOsm) {
        m.addSource('buildings-source', { type: 'geojson', data: buildingsOsm });

        const firstGeomType = buildingsOsm.features?.[0]?.geometry?.type || 'Polygon';
        const isPolygon = firstGeomType === 'Polygon' || firstGeomType === 'MultiPolygon';

        if (isPolygon) {
          m.addLayer({
            id: 'building-footprints-fill',
            type: 'fill',
            source: 'buildings-source',
            minzoom: 11,
            paint: {
              'fill-color': [
                'match', ['get', 'building_type'],
                'Residential (House)',     '#F4A460',
                'Residential (Apartment)', '#E8824A',
                'Commercial/Retail',       '#6CB4E4',
                'Office/IT',               '#4169E1',
                'Hospital/Medical',        '#FF4444',
                'Educational',             '#FFD700',
                'Religious',               '#9370DB',
                'Government/Civic',        '#20B2AA',
                'Hotel/Hospitality',       '#FF69B4',
                'Industrial',              '#A0A0A0',
                '#94a3b8',
              ],
              'fill-opacity': 0.85,
            },
            layout: { visibility: 'none' },
          });

          m.addLayer({
            id: 'building-footprints-outline',
            type: 'line',
            source: 'buildings-source',
            minzoom: 11,
            paint: { 'line-color': '#00000033', 'line-width': 0.5 },
            layout: { visibility: 'none' },
          });

          // ═══════════════════════════════════════════════════════
          // 3D Building Extrusion — dramatic blue gradient by height
          // ═══════════════════════════════════════════════════════
          const heightByType: Record<string, number> = {
            'Residential (House)': 6,
            'Residential (Apartment)': 18,
            'Commercial/Retail': 10,
            'Office/IT': 28,
            'Hospital/Medical': 14,
            'Educational': 8,
            'Religious': 12,
            'Government/Civic': 10,
            'Hotel/Hospitality': 15,
            'Industrial': 12,
          };

          m.addLayer({
            id: '3d-buildings-classified',
            type: 'fill-extrusion',
            source: 'buildings-source',
            minzoom: 11,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['match', ['get', 'building'],
                  'residential', 6,
                  'apartments', 18,
                  'commercial', 10,
                  'retail', 10,
                  'hospital', 14,
                  'school', 8,
                  'college', 12,
                  'industrial', 12,
                  8
                ],
                0,   '#0f2027',
                5,   '#1a3a4a',
                10,  '#1e3a5f',
                20,  '#1d4e89',
                30,  '#2563a8',
              ],
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                11, 0,
                12, ['match', ['get', 'building'],
                  'Residential (House)', 6,
                  'Residential (Apartment)', 18,
                  'Commercial/Retail', 10,
                  'Office/IT', 28,
                  'Hospital/Medical', 14,
                  'Educational', 8,
                  'Religious', 12,
                  'Government/Civic', 10,
                  'Hotel/Hospitality', 15,
                  'Industrial', 12,
                  8
                ],
              ],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.85,
            },
            layout: { visibility: 'none' },
          });

          console.log('✅ 3D buildings layer added successfully');
        } else {
          // Point geometry fallback
          m.addLayer({
            id: 'building-footprints-fill',
            type: 'circle',
            source: 'buildings-source',
            minzoom: 11,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 3, 15, 6, 17, 10],
              'circle-color': [
                'match', ['get', 'building_type'],
                'Residential (House)',     '#F4A460',
                'Residential (Apartment)', '#E8824A',
                'Commercial/Retail',       '#6CB4E4',
                'Office/IT',               '#4169E1',
                'Hospital/Medical',        '#FF4444',
                'Educational',             '#FFD700',
                'Religious',               '#9370DB',
                'Government/Civic',        '#20B2AA',
                '#94a3b8',
              ],
              'circle-opacity': 0.9,
              'circle-stroke-width': 0.5,
              'circle-stroke-color': '#00000066',
            },
            layout: { visibility: 'none' },
          });
        }

        // Hover popup for buildings
        m.on('mousemove', 'building-footprints-fill', (e) => {
          if (!e.features?.length) return;
          m.getCanvas().style.cursor = 'pointer';
          const p = e.features[0].properties as any;
          const bType = p.building_type || 'Unknown';
          const area = Math.round(p.area_sqm || 0);
          const waste = (area * 0.02).toFixed(1);
          popup.current!
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:Inter,sans-serif;padding:6px;min-width:150px;color:#0f172a">
                <div style="font-weight:800;font-size:12px;margin-bottom:4px;color:#1e3a5f">🏠 ${bType}</div>
                <div style="font-size:11px;color:#475569">
                  <div><b>Area:</b> ${area} sqm</div>
                  <div><b>Est. waste:</b> ${waste} kg/day</div>
                </div>
              </div>
            `)
            .addTo(m);
        });
        m.on('mouseleave', 'building-footprints-fill', () => {
          m.getCanvas().style.cursor = '';
          popup.current?.remove();
        });
      }



      // ═══════════ Open Spaces ═══════════
      m.addSource('openspaces-source', { type: 'geojson', data: openSpaces });
      m.addLayer({
        id: 'openspaces-circle', type: 'circle', source: 'openspaces-source',
        paint: {
          'circle-color': ['match', ['get', 'type'], 'green', '#22c55e', 'water', '#3b82f6', '#22c55e'],
          'circle-radius': 8, 'circle-opacity': 0.75, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff',
        },
        layout: { visibility: 'none' },
      });

      // ═══════════ Water Bodies & Rivers ═══════════
      if (waterBodies) {
        m.addSource('water-source', { type: 'geojson', data: waterBodies });
        m.addLayer({
          id: 'water-fill',
          type: 'fill',
          source: 'water-source',
          paint: { 'fill-color': '#0ea5e9', 'fill-opacity': 0.6 },
          layout: { visibility: 'none' },
        });
        m.addLayer({
          id: 'water-lines',
          type: 'line',
          source: 'water-source',
          paint: { 'line-color': '#38bdf8', 'line-width': 2.5, 'line-opacity': 0.85 },
          layout: { visibility: 'none' },
        });
      }

      // ═══════════ LULC Analysis ═══════════
      if (lulcData) {
        m.addSource('lulc-source', { type: 'geojson', data: lulcData });
        m.addLayer({
          id: 'lulc-fill',
          type: 'fill',
          source: 'lulc-source',
          paint: {
            'fill-color': ['coalesce', ['get', 'color'], '#06b6d4'],
            'fill-opacity': 0.45,
          },
          layout: { visibility: 'none' },
        });
        m.addLayer({
          id: 'lulc-outline',
          type: 'line',
          source: 'lulc-source',
          paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.3 },
          layout: { visibility: 'none' },
        });
      }

      // ═══════════ Water & LULC Click Popups ═══════════
      // Water bodies click popup
      m.on('click', 'water-fill', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        const name = p.name || p['name:en'] || 'Unnamed Water Body';
        const localName = p['name:kn'] ? '<br/><span style="font-size:11px;color:#94a3b8">' + p['name:kn'] + '</span>' : '';
        const wType = p.water || p.waterway || p.natural || 'water';
        const typeLabel = wType.charAt(0).toUpperCase() + wType.slice(1);
        const icon = wType === 'river' ? '🏞️' : wType === 'pond' ? '🪷' : wType === 'lake' ? '🌊' : '💧';
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            '<div style="font-family:Inter,sans-serif;padding:8px;min-width:180px">' +
            '<div style="font-weight:800;font-size:13px;color:#0ea5e9;margin-bottom:4px">' + icon + ' ' + name + '</div>' +
            localName +
            '<div style="font-size:11px;color:#64748b;margin-top:4px">' +
            '<b>Type:</b> ' + typeLabel +
            '</div></div>'
          )
          .addTo(m);
      });
      m.on('mouseenter', 'water-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'water-fill', () => { m.getCanvas().style.cursor = ''; popup.current?.remove(); });

      // Water lines (rivers) click popup
      m.on('click', 'water-lines', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        const name = p.name || p['name:en'] || 'Unnamed River/Stream';
        const localName = p['name:kn'] ? '<br/><span style="font-size:11px;color:#94a3b8">' + p['name:kn'] + '</span>' : '';
        const wType = p.waterway || 'river';
        const typeLabel = wType.charAt(0).toUpperCase() + wType.slice(1);
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            '<div style="font-family:Inter,sans-serif;padding:8px;min-width:180px">' +
            '<div style="font-weight:800;font-size:13px;color:#38bdf8;margin-bottom:4px">🏞️ ' + name + '</div>' +
            localName +
            '<div style="font-size:11px;color:#64748b;margin-top:4px">' +
            '<b>Type:</b> ' + typeLabel +
            '</div></div>'
          )
          .addTo(m);
      });
      m.on('mouseenter', 'water-lines', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'water-lines', () => { m.getCanvas().style.cursor = ''; popup.current?.remove(); });

      // LULC click popup
      m.on('click', 'lulc-fill', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        const cls = p.class || 'Unknown';
        const cat = p.category || '';
        const color = p.color || '#06b6d4';
        const icon = cls === 'Built-up' ? '🏘️' : cls === 'Vegetation' ? '🌳' : cls === 'Water' ? '💧' : cls === 'Open Land' ? '🏜️' : '📍';
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            '<div style="font-family:Inter,sans-serif;padding:8px;min-width:180px">' +
            '<div style="font-weight:800;font-size:13px;margin-bottom:4px">' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';margin-right:6px"></span>' +
            icon + ' ' + cls + '</div>' +
            (cat ? '<div style="font-size:11px;color:#64748b"><b>Category:</b> ' + cat + '</div>' : '') +
            '<div style="font-size:10px;color:#475569;margin-top:4px">Sentinel-2 LULC Classification</div>' +
            '</div>'
          )
          .addTo(m);
      });
      m.on('mouseenter', 'lulc-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'lulc-fill', () => { m.getCanvas().style.cursor = ''; popup.current?.remove(); });

      

      // ═══════════ Ambient Lighting for 3D ═══════════
      if (typeof m.setLight === 'function') {
        try {
          m.setLight({
            anchor: 'viewport',
            color: '#ffffff',
            intensity: 0.45,
            position: [1.5, 210, 35],
          });
        } catch (_) {}
      }

      setMapLoaded(true);

      // Show hint toast after load
      setShowHint(true);
      setTimeout(() => setShowHint(false), 4000);
    });

    return () => {
      popup.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── Shared 3D toggle function ──────────────────────────────────────────────
  const toggle3D = useCallback(() => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;

    if (!is3D) {
      // ── Turn ON 3D ──
      if (m.getLayer('3d-buildings-classified')) {
        m.setLayoutProperty('3d-buildings-classified', 'visibility', 'visible');
      }
      // Hide 2D building footprints while 3D is on
      if (m.getLayer('building-footprints-fill')) {
        m.setLayoutProperty('building-footprints-fill', 'visibility', 'none');
      }
      if (m.getLayer('building-footprints-outline')) {
        m.setLayoutProperty('building-footprints-outline', 'visibility', 'none');
      }
      m.easeTo({
        pitch: 52,
        bearing: -20,
        zoom: 15.5,
        center: [74.7421, 13.3409],
        duration: 1200,
      });
      // Dramatic lighting
      if (typeof m.setLight === 'function') {
        try {
          m.setLight({ anchor: 'viewport', color: '#ffffff', intensity: 0.55, position: [2, 220, 30] });
        } catch (_) {}
      }
      setIs3D(true);
      setLayerVisibility((prev) => ({ ...prev, '3d-buildings': true, 'building-footprints': false }));
    } else {
      // ── Turn OFF 3D ──
      if (m.getLayer('3d-buildings-classified')) {
        m.setLayoutProperty('3d-buildings-classified', 'visibility', 'none');
      }
      m.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: 14,
        center: [74.7421, 13.3409],
        duration: 800,
      });
      setIs3D(false);
      setLayerVisibility((prev) => ({ ...prev, '3d-buildings': false }));
    }
  }, [mapLoaded, is3D]);

  // ── Toggle layer visibility ────────────────────────────────────────────────
  const toggleLayer = useCallback(
    (layerId: string) => {
      if (!map.current || !mapLoaded) return;

      // If toggling 3D from the layer panel, delegate to toggle3D
      if (layerId === '3d-buildings') {
        toggle3D();
        return;
      }

      setLayerVisibility((prev) => {
        const next = { ...prev, [layerId]: !prev[layerId] };
        const vis = next[layerId] ? 'visible' : 'none';
        const m = map.current!;

        const setVis = (id: string) => {
          if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', vis);
        };

        if (layerId === 'ward')               { setVis('ward-fill'); setVis('ward-line'); }
        else if (layerId === 'zone-grid')     { setVis('zone-grid-fill'); setVis('zone-grid-border'); setVis('zone-grid-labels'); }
        else if (layerId === 'roads')          { setVis('roads-line'); }
        else if (layerId === 'heatmap')        { setVis('heatmap-fill'); }
        else if (layerId === 'dumps')          { setVis('dumps-circle'); setVis('dumps-pulse'); }
        else if (layerId === 'building-footprints') {
          setVis('building-footprints-fill');
          if (m.getLayer('building-footprints-outline')) setVis('building-footprints-outline');
        }
        else if (layerId === 'openspaces')     { setVis('openspaces-circle'); }
        
        else if (layerId === 'water')          { setVis('water-fill'); setVis('water-lines'); }
        else if (layerId === 'lulc')           { setVis('lulc-fill'); setVis('lulc-outline'); }

        return next;
      });
    },
    [mapLoaded, toggle3D]
  );

  return (
    <div id="smart-map-page" className="flex flex-col h-full w-full">
      {/* ══════════════════════════════════════════════════════ */}
      {/* Stats Bar — Clean White Municipal Theme                */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-2.5 flex items-center justify-center gap-0 text-xs font-semibold tracking-wide shadow-xs">
        {[
          { label: 'sq km', value: `${UDUPI_DATA.area_sq_km}`, warn: false },
          { label: 'population', value: UDUPI_DATA.population.toLocaleString('en-IN'), warn: false },
          { label: 'audited waste/day', value: `${UDUPI_DATA.daily_waste_tons}T`, warn: false },
          { label: 'route saving', value: '38.2%', warn: false },
          { label: 'waste facilities', value: '5', warn: false },
        ].map(({ label, value, warn }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="text-slate-300 mx-4 select-none">|</span>}
            <div className="flex items-center gap-2 text-slate-600">
              <span className={`text-sm font-black font-mono ${warn ? 'text-amber-600' : 'text-emerald-700'}`}>{value}</span>
              <span className="font-medium text-slate-500">{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Map Container ───────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* ── Floating 3D Toggle Button ── */}
        <div className="absolute z-10" style={{ top: 120, right: 10 }}>
          <button
            onClick={toggle3D}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 shadow-md border"
            style={{
              background: is3D ? '#0f766e' : '#ffffff',
              borderColor: is3D ? '#0f766e' : '#cbd5e1',
              color: is3D ? '#ffffff' : '#0f172a',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>{is3D ? '2D View' : '3D View'}</span>
          </button>
        </div>

        {/* ── Hint Toast ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500"
          style={{
            opacity: showHint ? 1 : 0,
            transform: `translateX(-50%) translateY(${showHint ? '0' : '12px'})`,
          }}
        >
          <div className="px-5 py-2 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-2 bg-white/95 border border-slate-200 shadow-lg backdrop-blur-md">
            <span>💡</span>
            <span>Click <b className="text-emerald-700">3D View</b> to inspect Udupi City building extrusions</span>
          </div>
        </div>

        {/* ── Layer Toggle Panel ── */}
        <div className="absolute top-4 left-4 z-10 w-56">
          <div className="rounded-2xl p-4 flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl">
            {(['SPATIAL', 'BUILDING', 'DATA'] as LayerCategory[]).map((category) => (
              <div key={category} className="flex flex-col gap-2">
                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                  {category} LAYERS
                </div>
                {LAYERS.filter((l) => l.category === category).map((layer) => {
                  const on = layerVisibility[layer.id];
                  return (
                    <button
                      key={layer.id}
                      id={`toggle-${layer.id}`}
                      onClick={() => toggleLayer(layer.id)}
                      className="flex items-center gap-2.5 w-full text-left group pr-1 hover:bg-slate-50 py-1 px-1.5 rounded-lg transition-colors"
                    >
                      <div
                        className="shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors"
                        style={{
                          background: on ? layer.color : 'transparent',
                          borderColor: on ? layer.color : '#cbd5e1',
                        }}
                      >
                        {on && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                      <span
                        className="flex-1 text-[11px] font-semibold transition-colors"
                        style={{ color: on ? '#0f172a' : '#64748b' }}
                      >
                        {layer.label}
                      </span>
                      {layer.count && (
                        <span className="text-[10px] font-bold" style={{ color: on ? layer.color : '#94a3b8' }}>
                          ({layer.count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Zone Grid Summary Sidebar ── */}
        {layerVisibility['zone-grid'] && zoneAnalysisData?.zones && (
          <div 
            className="absolute right-4 z-10 w-[270px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
            style={{ top: '180px' }}
          >
            {/* Header */}
            <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
              <h3 className="text-teal-950 font-extrabold text-[14px] flex items-center gap-2">
                <span className="text-base leading-none">📊</span> Zone Analysis
              </h3>
              <div className="text-teal-700 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Udupi City · 36 zones · 500m grid
              </div>
            </div>
            
            <div className="p-4 space-y-3.5 text-slate-800">
              {/* Population Section */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">POPULATION (Audited Census + Projection)</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-semibold">
                    <span>Total:</span>
                    <span className="font-mono font-bold text-slate-900">{UDUPI_DATA.population.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Residential Houses:</span>
                    <span className="font-mono">{UDUPI_DATA.population_houses.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Apartment Units:</span>
                    <span className="font-mono">{UDUPI_DATA.population_apts.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Commercial / Institutional:</span>
                    <span className="font-mono">{UDUPI_DATA.population_schools + UDUPI_DATA.population_offices}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Daily Waste Section */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DAILY MUNICIPAL WASTE</div>
                <div className="flex justify-between text-xs text-slate-900 font-bold mb-0.5">
                  <span>Total Generation:</span>
                  <span className="text-emerald-700 font-mono">{UDUPI_DATA.daily_waste_kg.toLocaleString('en-IN')} kg</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right -mt-1 mb-1">({UDUPI_DATA.daily_waste_tons} TPD audited baseline)</div>
                
                <div className="space-y-1 border-y border-slate-100 py-1.5">
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="text-[10px]">🟢</span> Wet Organic (61%):</span>
                    <span className="font-mono font-semibold text-emerald-700">{UDUPI_DATA.waste_wet_kg.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="text-[10px]">🔵</span> Dry Recyclables (30%):</span>
                    <span className="font-mono font-semibold text-sky-700">{UDUPI_DATA.waste_dry_kg.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="text-[10px]">🔴</span> Hazardous (5%):</span>
                    <span className="font-mono font-semibold text-rose-700">{UDUPI_DATA.waste_hazardous_kg.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="text-[10px]">⚪</span> Inerts/Rejects (4%):</span>
                    <span className="font-mono font-semibold text-slate-600">{UDUPI_DATA.waste_other_kg.toLocaleString('en-IN')} kg</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-0.5">
                  <div className="flex justify-between"><span>Per Capita Rate:</span><span className="text-slate-700 font-mono">{UDUPI_DATA.waste_per_capita_kg} kg/person/day</span></div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />
              
              {/* Risk Profile */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ZONE RISK PROFILE</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-rose-50 border border-rose-200/80 rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-rose-700 font-bold mb-0.5">High</div>
                    <div className="text-sm font-bold text-rose-900">8</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-amber-700 font-bold mb-0.5">Med</div>
                    <div className="text-sm font-bold text-amber-900">11</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-emerald-700 font-bold mb-0.5">Low</div>
                    <div className="text-sm font-bold text-emerald-900">17</div>
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-slate-100 w-full" />

              {/* Infrastructure */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">MUNICIPAL FACILITIES</div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span>🏢</span>
                  <span>6 Zonal DWCC Hubs</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span>⚡</span>
                  <span>1 Biomethanation Unit (Beedinagudde)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span>♻️</span>
                  <span>1 MRF &amp; Landfill (Karvalu)</span>
                </div>
              </div>

              {/* Footer Source */}
              <div className="pt-1.5 text-[9px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">Single Source: Udupi CMC Audited Telemetry</div>
                <div>Per Capita Standard: CPCB 0.435 kg/capita/day</div>
              </div>
            </div>
          </div>
        )}
        {/* ── Ward Info Sidebar ── */}
        <div
          className="absolute top-0 right-0 h-full z-10 transition-transform duration-500 ease-in-out overflow-y-auto"
          style={{
            width: '320px',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-8px 0 30px rgba(0,0,0,0.08)',
          }}
        >
          <button
            id="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold"
          >
            ✕
          </button>
          <div className="p-6 pt-8 flex flex-col gap-5 text-slate-800">
            <div>
              <div className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-1">Ward Intelligence</div>
              <h2 className="text-slate-900 text-xl font-black tracking-tight">Udupi City</h2>
              <p className="text-slate-500 text-xs mt-1">📍 35 Wards · Udupi City Municipal Council</p>
            </div>
            <div className="h-px bg-slate-200" />
            <SidebarSection title="Satellite Analysis" icon="🛰️">
              <SidebarRow icon="🏠" label="Rooftops mapped" value={UDUPI_DATA.total_buildings.toLocaleString('en-IN')} />
              <SidebarRow icon="👥" label="Population (Census Base)" value={UDUPI_DATA.population.toLocaleString('en-IN')} />
              <SidebarRow icon="📦" label="Waste generated" value={`${UDUPI_DATA.daily_waste_tons} T/day`} highlight />
              <SidebarRow icon="🌿" label="Green cover" value="26.1%" />
              <SidebarRow icon="📐" label="Total area" value={`${UDUPI_DATA.area_sq_km} sq km`} />
            </SidebarSection>
            <div className="h-px bg-slate-200" />
            <SidebarSection title="Waste Facilities" icon="♻️">
              <SidebarRow icon="🔵" label="Zonal DWCC Hubs" value="6" />
              <SidebarRow icon="🟢" label="Biomethanation Unit (Beedinagudde)" value="1" />
              <SidebarRow icon="🟠" label="MRF &amp; Engineered Landfill (Karvalu)" value="1" />
              <SidebarRow icon="📊" label="Total audited nodes" value="8" highlight />
            </SidebarSection>
            <div className="h-px bg-slate-200" />
            <SidebarSection title="Route Optimization" icon="🚛">
              <SidebarRow icon="📍" label="Before (baseline)" value="248.6 km/day" />
              <SidebarRow icon="✅" label="After (optimized)" value="153.7 km/day" highlight />
              <div className="mt-2 px-3 py-2 rounded-xl text-xs font-bold text-center bg-emerald-50 text-emerald-800 border border-emerald-200">
                🎉 38.2% distance reduction achieved
              </div>
            </SidebarSection>
            <div className="h-px bg-slate-200" />
            <SidebarSection title="Land Cover (LULC)" icon="🗺️">
              <LandCoverBar label="Built-up" pct={66.3} color="#ef4444" />
              <LandCoverBar label="Vegetation" pct={26.1} color="#22c55e" />
              <LandCoverBar label="Water Bodies" pct={7.5} color="#0284c7" />
            </SidebarSection>
            <div className="h-px bg-slate-200" />
            <div className="flex flex-col gap-3">
              <Link href="/analytics" className="w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                View Generation Analytics →
              </Link>
              <Link href="/simulation" className="w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200">
                Run Vehicle Simulation →
              </Link>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="absolute inset-0 z-[9]" onClick={() => setSidebarOpen(false)} style={{ cursor: 'default' }} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function SidebarRow({ icon, label, value, highlight, warn, danger }: {
  icon: string; label: string; value: string; highlight?: boolean; warn?: boolean; danger?: boolean;
}) {
  const valueColor = danger ? '#dc2626' : warn ? '#d97706' : highlight ? '#059669' : '#334155';
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-600 flex items-center gap-1.5"><span>{icon}</span>{label}</span>
      <span className="font-bold" style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

function LandCoverBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-bold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}