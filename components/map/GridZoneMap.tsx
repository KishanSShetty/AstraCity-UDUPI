'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GridZoneMapProps {
  onZoneClick?: (zoneId: string) => void;
  selectedZoneId?: string | null;
}

// Distinct vivid colors for the 35 CMC ward boundaries
const WARD_COLORS = [
  '#00d4aa', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF7675', '#74B9FF', '#A29BFE',
  '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894', '#E17055',
  '#0984E3', '#D63031', '#00CEC9', '#E84393', '#2D3436',
  '#55EFC4', '#81ECEC', '#F8A5C2', '#F3A683', '#778BEB',
  '#E77F67', '#CF6A87', '#786FA6', '#63CDDA', '#EA8685',
  '#596275', '#574B90', '#303952', '#B8E994', '#FEA47F',
];

export default function GridZoneMap({ onZoneClick, selectedZoneId }: GridZoneMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Center on Udupi CMC area
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [74.7610, 13.3530],
      zoom: 13.0,
      pitch: 0,
      bearing: 0,
      maxBounds: [[74.65, 13.27], [74.88, 13.44]],
    });

    mapRef.current = m;

    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' });

    m.on('load', async () => {
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

      // Fetch all data
      const [wardBoundary, gridZones] = await Promise.all([
        getCachedJson('/data/udupi_wards.geojson'),
        getCachedJson('/data/ward_grid_zones.json'),
      ]);

      // ═══════ Ward Boundaries (colored per ward) ═══════
      if (wardBoundary.features && wardBoundary.features.length > 0) {
        // Assign each ward a distinct color
        wardBoundary.features.forEach((feature: any, idx: number) => {
          feature.properties._wardColor = WARD_COLORS[idx % WARD_COLORS.length];
        });

        m.addSource('ward-boundary', { type: 'geojson', data: wardBoundary });

        // Ward fill — each ward gets a unique color
        m.addLayer({
          id: 'ward-boundary-fill', type: 'fill', source: 'ward-boundary',
          paint: {
            'fill-color': ['get', '_wardColor'],
            'fill-opacity': 0.12,
          },
        });

        // Ward border — thick colored lines  
        m.addLayer({
          id: 'ward-boundary-line', type: 'line', source: 'ward-boundary',
          paint: {
            'line-color': ['get', '_wardColor'],
            'line-width': 2.5,
            'line-opacity': 0.85,
          },
        });

        // Ward name labels
        m.addLayer({
          id: 'ward-labels', type: 'symbol', source: 'ward-boundary',
          layout: {
            'text-field': ['coalesce', ['get', 'KGISWardNa'], ['concat', 'Ward ', ['get', 'KGISWardNo']]],
            'text-size': ['interpolate', ['linear'], ['zoom'], 12, 8, 14, 11, 16, 14],
            'text-anchor': 'center',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1.5,
          },
          minzoom: 13,
        });
      }

      // ═══════ Grid Zones (within wards) ═══════
      const features = gridZones.zones.map((z: any) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [z.bounds[0], z.bounds[1]],
            [z.bounds[2], z.bounds[1]],
            [z.bounds[2], z.bounds[3]],
            [z.bounds[0], z.bounds[3]],
            [z.bounds[0], z.bounds[1]],
          ]],
        },
        properties: {
          zone_id: z.zone_id,
          total_buildings: z.total_buildings,
          residential_houses: z.residential_houses,
          apartments: z.apartments,
          commercial: z.commercial,
          offices: z.offices,
          hospitals: z.hospitals,
          schools: z.schools,
          population: z.population,
          total_roads: z.total_roads,
          waste_total_kg: z.waste_total_kg,
          waste_total_tons: z.waste_total_tons,
          waste_wet_tons: z.waste_wet_tons,
          waste_dry_tons: z.waste_dry_tons,
          waste_hazardous_tons: z.waste_hazardous_tons,
          risk: z.risk,
          assigned_dwcc: z.assigned_dwcc,
          collection_vehicle: z.collection_vehicle,
          center_lon: z.center[0],
          center_lat: z.center[1],
        },
      }));

      m.addSource('grid-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      // Fill — color by waste intensity + risk
      m.addLayer({
        id: 'grid-fill', type: 'fill', source: 'grid-zones',
        paint: {
          'fill-color': [
            'match', ['get', 'risk'],
            'High', 'rgba(220, 38, 38, 0.55)',
            'Medium', 'rgba(217, 119, 6, 0.45)',
            'Low', 'rgba(34, 197, 94, 0.35)',
            'rgba(100, 116, 139, 0.3)',
          ],
          'fill-opacity': [
            'interpolate', ['linear'], ['get', 'waste_total_kg'],
            200, 0.25,
            800, 0.45,
            1500, 0.65,
            2000, 0.8,
          ],
        },
      });

      // Border — dashed white
      m.addLayer({
        id: 'grid-border', type: 'line', source: 'grid-zones',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5,
          'line-opacity': 0.6,
          'line-dasharray': [4, 2],
        },
      });

      // Labels — Zone ID + waste
      m.addLayer({
        id: 'grid-labels', type: 'symbol', source: 'grid-zones',
        layout: {
          'text-field': ['concat', ['get', 'zone_id'], '\n', ['to-string', ['round', ['get', 'waste_total_kg']]], ' kg'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 12, 9, 14, 12, 16, 14],
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.8,
        },
      });

      // ═══════ CLICK Popup ═══════
      m.on('click', 'grid-fill', (e) => {
        const p = e.features?.[0]?.properties as any;
        if (!p) return;

        const riskColor: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
        const rc = riskColor[p.risk] || '#6b7280';
        const riskBadge = `<span style="background:${rc}22;color:${rc};border:1px solid ${rc};padding:2px 10px;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">${p.risk} risk</span>`;

        const wkg = Math.round(p.waste_total_kg);
        const wetT = Number(p.waste_wet_tons).toFixed(3);
        const dryT = Number(p.waste_dry_tons).toFixed(3);
        const hazT = Number(p.waste_hazardous_tons).toFixed(3);

        new maplibregl.Popup({ maxWidth: '340px', className: 'grid-zone-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#0f172a;color:white;padding:16px;border-radius:12px;font-family:Inter,system-ui,sans-serif;width:310px;box-sizing:border-box;border:1px solid rgba(255,255,255,0.08);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-size:20px;font-weight:900;color:#00d4aa;">${p.zone_id}</span>${riskBadge}
              </div>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Population</div>
                  <div style="color:#00d4aa;font-size:18px;font-weight:900;">${Number(p.population).toLocaleString('en-IN')}</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Buildings</div>
                  <div style="color:white;font-size:18px;font-weight:900;">${p.total_buildings}</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Waste/Day</div>
                  <div style="color:#f59e0b;font-size:18px;font-weight:900;">${wkg} kg</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Roads</div>
                  <div style="color:white;font-size:18px;font-weight:900;">${p.total_roads}</div>
                </div>
              </div>

              <div style="background:#1e293b;border:1px solid #334155;padding:10px;border-radius:8px;margin-bottom:10px;">
                <div style="color:#3b82f6;font-size:9px;font-weight:800;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.08em;">Waste Segregation</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
                  <div style="text-align:center;">
                    <div style="color:#22c55e;font-size:13px;font-weight:800;">${wetT}T</div>
                    <div style="color:#64748b;font-size:8px;font-weight:700;">WET</div>
                  </div>
                  <div style="text-align:center;">
                    <div style="color:#3b82f6;font-size:13px;font-weight:800;">${dryT}T</div>
                    <div style="color:#64748b;font-size:8px;font-weight:700;">DRY</div>
                  </div>
                  <div style="text-align:center;">
                    <div style="color:#ef4444;font-size:13px;font-weight:800;">${hazT}T</div>
                    <div style="color:#64748b;font-size:8px;font-weight:700;">HAZ</div>
                  </div>
                </div>
              </div>

              <div style="display:flex;gap:8px;margin-bottom:8px;">
                <div style="flex:1;background:#0d9488;padding:6px 10px;border-radius:6px;text-align:center;">
                  <div style="font-size:9px;color:rgba(255,255,255,0.7);font-weight:600;">DWCC</div>
                  <div style="font-size:12px;font-weight:800;color:white;">${p.assigned_dwcc}</div>
                </div>
                <div style="flex:1;background:#334155;padding:6px 10px;border-radius:6px;text-align:center;">
                  <div style="font-size:9px;color:rgba(255,255,255,0.7);font-weight:600;">Vehicle</div>
                  <div style="font-size:12px;font-weight:800;color:white;">${(p.collection_vehicle || '').replace('_', ' ')}</div>
                </div>
              </div>

              <div style="background:#1e293b;padding:8px;border-radius:6px;font-size:10px;color:#64748b;line-height:1.5;">
                ${p.residential_houses} houses | ${p.apartments} apts | ${p.commercial} commercial | ${p.schools} schools
              </div>
            </div>
          `)
          .addTo(m);

        if (onZoneClick) onZoneClick(p.zone_id);
      });

      // Hover cursor
      m.on('mouseenter', 'grid-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'grid-fill', () => { m.getCanvas().style.cursor = ''; });

      setLoaded(true);
    });

    return () => {
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400 mb-3" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading Udupi City Grid Map...</p>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-3 space-y-1.5">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Level</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-red-500/70 border border-red-400/50" /> High Risk
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-amber-500/60 border border-amber-400/50" /> Medium Risk
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/50 border border-emerald-400/50" /> Low Risk
        </div>
        <div className="border-t border-slate-700/50 pt-1.5">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Boundaries</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-3 h-3 rounded-sm" style={{background: 'linear-gradient(135deg, #00d4aa, #FF6B6B, #4ECDC4)'}} /> Ward Boundaries (colored)
          </div>
        </div>
      </div>

      {/* Top-left info badge */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2">
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Udupi City - 500m Grid</div>
        <div className="text-[10px] text-slate-400 font-medium">Click any zone for details</div>
      </div>
    </div>
  );
}
