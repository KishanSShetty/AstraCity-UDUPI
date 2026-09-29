import { NextResponse } from 'next/server';

/**
 * GET /api/dwcc-status — Returns real-time DWCC load and capacity status for Udupi City.
 * 
 * Response structure:
 * {
 *   dwccs: [{ id, label, lat, lon, capacity_tpd, load_kg, load_pct, status }],
 *   total_capacity_tpd: 18,
 *   total_load_kg: number,
 *   avg_utilization_pct: number,
 *   alerts: [{ dwcc_id, level, message }]
 * }
 */

const DWCC_CONFIG = [
  { id: 'DWCC-1', label: 'Sector 2 East',    lat: 12.91263,  lon: 77.64903, capacity_tpd: 3 },
  { id: 'DWCC-2', label: 'Sector 3 North',   lat: 12.92218,  lon: 77.64688, capacity_tpd: 3 },
  { id: 'DWCC-3', label: 'Sector 3 Central',  lat: 12.91811,  lon: 77.64545, capacity_tpd: 3 },
  { id: 'DWCC-4', label: 'Sector 2 East Alt', lat: 12.91218,  lon: 77.64755, capacity_tpd: 3 },
  { id: 'DWCC-5', label: 'Sector 1 SW',       lat: 12.90536,  lon: 77.63312, capacity_tpd: 3 },
  { id: 'DWCC-6', label: 'Sector 1 South',    lat: 12.89907,  lon: 77.64077, capacity_tpd: 3 },
];

export async function GET() {
  // Simulate realistic load distribution based on HSR waste generation
  // Total dry waste directed to DWCCs: 30% of 55 TPD = 16.5 TPD across 6 DWCCs (2.75 TPD avg)
  const hour = new Date().getHours();
  const collectionFactor = hour >= 6 && hour <= 10 ? 0.85 : hour <= 18 ? 0.65 : 0.35;

  const loads = [
    2760, // DWCC-1: Sector 2 has highest building density (2189 buildings)
    2250, // DWCC-2: Sector 3 North, moderate
    2040, // DWCC-3: Sector 3 Central
    2640, // DWCC-4: Sector 2 East Alt, high density area
    1350, // DWCC-5: Sector 1 SW, lower density
    1650, // DWCC-6: Sector 1 South, moderate
  ];

  const dwccs = DWCC_CONFIG.map((d, i) => {
    const load_kg = Math.round(loads[i] * collectionFactor);
    const capacity_kg = d.capacity_tpd * 1000;
    const load_pct = Math.round((load_kg / capacity_kg) * 100);
    let status: 'normal' | 'yellow' | 'red' | 'critical' = 'normal';
    if (load_pct >= 100) status = 'critical';
    else if (load_pct >= 90) status = 'red';
    else if (load_pct >= 70) status = 'yellow';
    return { ...d, load_kg, load_pct, status };
  });

  const total_load_kg = dwccs.reduce((s, d) => s + d.load_kg, 0);
  const avg_utilization_pct = Math.round(dwccs.reduce((s, d) => s + d.load_pct, 0) / dwccs.length);

  const alerts = dwccs
    .filter(d => d.status !== 'normal')
    .map(d => ({
      dwcc_id: d.id,
      level: d.status,
      message: d.status === 'critical'
        ? `${d.id} at ${d.load_pct}% — OVERFLOW! Redirect vehicles to ${d.load_pct > 100 ? 'DWCC-5' : 'DWCC-3'}`
        : d.status === 'red'
        ? `${d.id} at ${d.load_pct}% — approaching capacity, consider redistribution`
        : `${d.id} at ${d.load_pct}% — monitoring`,
    }));

  return NextResponse.json({
    dwccs,
    total_capacity_tpd: 18,
    total_load_kg,
    avg_utilization_pct,
    collection_window: hour >= 6 && hour <= 10 ? 'Primary (06:00-10:00)' : hour <= 18 ? 'Secondary (10:00-18:00)' : 'Night',
    alerts,
    timestamp: new Date().toISOString(),
  });
}
