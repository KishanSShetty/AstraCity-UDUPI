'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GridZoneMapProps {
  onZoneClick?: (zoneId: string) => void;
  selectedZoneId?: string | null;
}

// Distinct vivid colors for ward boundaries
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Udupi district center approximately
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [74.88, 13.52],
      zoom: 9.5,
      pitch: 0,
      bearing: 0,
      maxBounds: [[74.3, 12.9], [75.5, 14.2]],
    });

    mapRef.current = m;

    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    m.on('load', async () => {
      // Fetch all data
      const [districtBoundary, wardBoundary, gridZones] = await Promise.all([
        fetch('/data/udupi_district_polygon.geojson').then(r => r.json()),
        fetch('/data/udupi_wards.geojson').then(r => r.json()),
        fetch('/data/district_grid_zones.json').then(r => r.json()),
      ]);

      // ═══════ District Boundary (outer) ═══════
      m.addSource('district-boundary', { type: 'geojson', data: districtBoundary });
      m.addLayer({
        id: 'district-boundary-fill', type: 'fill', source: 'district-boundary',
        paint: { 'fill-color': '#0f172a', 'fill-opacity': 0.15 },
      });
      m.addLayer({
        id: 'district-boundary-line', type: 'line', source: 'district-boundary',
        paint: { 'line-color': '#00d4aa', 'line-width': 3.5, 'line-opacity': 1.0 },
      });

      // ═══════ Ward Boundaries (colored) ═══════
      // Add each ward as a separate feature with unique color
      if (wardBoundary.features && wardBoundary.features.length > 0) {
        // Add color property to each ward feature
        wardBoundary.features.forEach((feature: any, idx: number) => {
          feature.properties._wardColor = WARD_COLORS[idx % WARD_COLORS.length];
          feature.properties._wardIndex = idx;
        });

        m.addSource('ward-boundaries', { type: 'geojson', data: wardBoundary });

        // Ward fill — each ward gets a distinct color
        m.addLayer({
          id: 'ward-fill', type: 'fill', source: 'ward-boundaries',
          paint: {
            'fill-color': ['get', '_wardColor'],
            'fill-opacity': 0.25,
          },
        });

        // Ward border — thick colored lines
        m.addLayer({
          id: 'ward-border', type: 'line', source: 'ward-boundaries',
          paint: {
            'line-color': ['get', '_wardColor'],
            'line-width': 2.5,
            'line-opacity': 0.9,
          },
        });

        // Ward labels
        m.addLayer({
          id: 'ward-labels', type: 'symbol', source: 'ward-boundaries',
          layout: {
            'text-field': ['coalesce', ['get', 'KGISWardNa'], ['concat', 'Ward ', ['get', 'KGISWardNo']]],
            'text-size': ['interpolate', ['linear'], ['zoom'], 10, 8, 13, 11, 15, 14],
            'text-anchor': 'center',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1.5,
          },
          minzoom: 11,
        });
      }

      // ═══════ District Grid Zones ═══════
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
          is_urban: z.is_urban,
          ward_name: z.ward_name,
          area_sqkm: z.area_sqkm,
          population: z.population,
          buildings: z.buildings,
          waste_kg_day: z.waste_kg_day,
          waste_tons_day: z.waste_tons_day,
          risk: z.risk,
          center_lon: z.center[0],
          center_lat: z.center[1],
        },
      }));

      m.addSource('grid-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      // Grid fill — color by risk level
      m.addLayer({
        id: 'grid-fill', type: 'fill', source: 'grid-zones',
        paint: {
          'fill-color': [
            'match', ['get', 'risk'],
            'High', 'rgba(220, 38, 38, 0.5)',
            'Medium', 'rgba(217, 119, 6, 0.35)',
            'Low', 'rgba(34, 197, 94, 0.25)',
            'rgba(100, 116, 139, 0.2)',
          ],
          'fill-opacity': [
            'interpolate', ['linear'], ['get', 'waste_kg_day'],
            50, 0.15,
            500, 0.35,
            1500, 0.55,
            3000, 0.75,
          ],
        },
      });

      // Grid border — thin white dashed lines
      m.addLayer({
        id: 'grid-border', type: 'line', source: 'grid-zones',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.8,
          'line-opacity': 0.35,
          'line-dasharray': [3, 2],
        },
      });

      // Grid labels — only at higher zoom
      m.addLayer({
        id: 'grid-labels', type: 'symbol', source: 'grid-zones',
        layout: {
          'text-field': ['concat', ['get', 'zone_id'], '\n', ['to-string', ['round', ['get', 'waste_kg_day']]], ' kg'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 8, 13, 10, 15, 13],
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5,
        },
        minzoom: 11,
      });

      // ═══════ CLICK Popup ═══════
      m.on('click', 'grid-fill', (e) => {
        const p = e.features?.[0]?.properties as any;
        if (!p) return;

        const riskColor: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
        const rc = riskColor[p.risk] || '#6b7280';
        const riskBadge = `<span style="background:${rc}22;color:${rc};border:1px solid ${rc};padding:2px 10px;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">${p.risk} risk</span>`;

        const urbanBadge = p.is_urban === true || p.is_urban === 'true'
          ? `<span style="background:#00d4aa22;color:#00d4aa;border:1px solid #00d4aa;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:800;">URBAN (CMC)</span>`
          : `<span style="background:#64748b22;color:#94a3b8;border:1px solid #64748b;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:800;">RURAL</span>`;

        const wkg = Math.round(p.waste_kg_day);

        new maplibregl.Popup({ maxWidth: '340px', className: 'grid-zone-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="background:#0f172a;color:white;padding:16px;border-radius:12px;font-family:Inter,system-ui,sans-serif;width:310px;box-sizing:border-box;border:1px solid rgba(255,255,255,0.08);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:20px;font-weight:900;color:#00d4aa;">${p.zone_id}</span>${riskBadge}
              </div>
              <div style="margin-bottom:12px;">${urbanBadge}${p.ward_name ? ` <span style="color:#94a3b8;font-size:10px;">in ${p.ward_name}</span>` : ''}</div>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Population</div>
                  <div style="color:#00d4aa;font-size:18px;font-weight:900;">${Number(p.population).toLocaleString('en-IN')}</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Buildings</div>
                  <div style="color:white;font-size:18px;font-weight:900;">${p.buildings}</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Waste/Day</div>
                  <div style="color:#f59e0b;font-size:18px;font-weight:900;">${wkg} kg</div>
                </div>
                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                  <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.08em;">Area</div>
                  <div style="color:white;font-size:18px;font-weight:900;">${Number(p.area_sqkm).toFixed(1)} km2</div>
                </div>
              </div>

              <div style="background:#1e293b;padding:8px;border-radius:6px;font-size:10px;color:#64748b;line-height:1.5;">
                Waste: ${Number(p.waste_tons_day).toFixed(3)}T/day | ${(p.is_urban === true || p.is_urban === 'true') ? 'Urban CMC Zone' : 'Rural District Zone'}
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
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading Udupi District Grid Map...</p>
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
        <div className="border-t border-slate-700/50 pt-1.5 space-y-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Boundaries</div>
          <div className="flex items-center gap-2 text-[10px] text-teal-400">
            <span className="w-3 h-0.5 bg-teal-400 rounded" /> District Boundary
          </div>
          <div className="flex items-center gap-2 text-[10px] text-pink-400">
            <span className="w-3 h-0.5 bg-pink-400 rounded" /> Ward Boundaries (CMC)
          </div>
        </div>
      </div>

      {/* Top-left info badge */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2">
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Udupi District - 2km Grid</div>
        <div className="text-[10px] text-slate-400 font-medium">980 zones | Click any zone for details</div>
      </div>
    </div>
  );
}
