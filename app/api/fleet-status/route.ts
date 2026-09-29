import { NextResponse } from 'next/server';

/**
 * GET /api/fleet-status — Returns real-time vehicle fleet status for Udupi City (Udupi CMC).
 */

interface VehicleStatus {
  id: string;
  type: string;
  icon: string;
  capacity_kg: number;
  fuel_type: string;
  co2_per_km: number;
  road_access: string[];
  road_coverage_pct: number;
  status: 'active' | 'idle' | 'maintenance' | 'returning';
  current_load_kg: number;
  trips_completed: number;
  total_distance_km: number;
  assigned_sector: string;
  assigned_dwcc: string;
}

const FLEET: VehicleStatus[] = [
  { id: 'AT-01', type: 'auto_tipper', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 67.6, status: 'active', current_load_kg: 380, trips_completed: 2, total_distance_km: 3.2, assigned_sector: 'Sector 1', assigned_dwcc: 'DWCC-5' },
  { id: 'AT-02', type: 'auto_tipper', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 67.6, status: 'active', current_load_kg: 240, trips_completed: 1, total_distance_km: 1.8, assigned_sector: 'Sector 2', assigned_dwcc: 'DWCC-1' },
  { id: 'AT-03', type: 'auto_tipper', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 67.6, status: 'returning', current_load_kg: 0, trips_completed: 3, total_distance_km: 4.1, assigned_sector: 'Sector 3', assigned_dwcc: 'DWCC-3' },
  { id: 'AT-04', type: 'auto_tipper', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 67.6, status: 'active', current_load_kg: 450, trips_completed: 2, total_distance_km: 2.9, assigned_sector: 'Sector 4', assigned_dwcc: 'DWCC-6' },
  { id: 'AT-05', type: 'auto_tipper', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 67.6, status: 'idle', current_load_kg: 0, trips_completed: 3, total_distance_km: 5.2, assigned_sector: 'Sector 5', assigned_dwcc: 'DWCC-4' },
  { id: 'SC-01', type: 'small_compactor', icon: '🚛', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 7.9, status: 'active', current_load_kg: 3200, trips_completed: 1, total_distance_km: 6.4, assigned_sector: 'Sector 2-3', assigned_dwcc: 'DWCC-1' },
  { id: 'LC-01', type: 'large_compactor', icon: '🚛', capacity_kg: 10000, fuel_type: 'Diesel', co2_per_km: 0.45, road_access: ['secondary', 'primary', 'trunk'], road_coverage_pct: 2.4, status: 'active', current_load_kg: 7500, trips_completed: 0, total_distance_km: 4.8, assigned_sector: 'Ward Transfer', assigned_dwcc: 'BMU Kudlu' },
  { id: 'HL-01', type: 'hook_loader', icon: '🏗️', capacity_kg: 16000, fuel_type: 'Diesel', co2_per_km: 0.55, road_access: ['primary', 'trunk'], road_coverage_pct: 1.9, status: 'maintenance', current_load_kg: 0, trips_completed: 0, total_distance_km: 0, assigned_sector: 'Depot', assigned_dwcc: 'N/A' },
  { id: 'GT-01', type: 'garbage_truck', icon: '🚚', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 7.9, status: 'active', current_load_kg: 2100, trips_completed: 1, total_distance_km: 3.5, assigned_sector: 'Sector 6-7', assigned_dwcc: 'DWCC-2' },
  { id: 'GT-02', type: 'garbage_truck', icon: '🚚', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 7.9, status: 'returning', current_load_kg: 0, trips_completed: 2, total_distance_km: 7.1, assigned_sector: 'Sector 1-4', assigned_dwcc: 'DWCC-6' },
];

export async function GET() {
  const active = FLEET.filter(v => v.status === 'active').length;
  const total_load = FLEET.reduce((s, v) => s + v.current_load_kg, 0);
  const total_distance = FLEET.reduce((s, v) => s + v.total_distance_km, 0);
  const total_trips = FLEET.reduce((s, v) => s + v.trips_completed, 0);
  const total_co2 = FLEET.reduce((s, v) => s + (v.total_distance_km * v.co2_per_km), 0);

  return NextResponse.json({
    vehicles: FLEET,
    summary: {
      total: FLEET.length,
      active,
      idle: FLEET.filter(v => v.status === 'idle').length,
      maintenance: FLEET.filter(v => v.status === 'maintenance').length,
      returning: FLEET.filter(v => v.status === 'returning').length,
      total_load_kg: total_load,
      total_distance_km: Math.round(total_distance * 10) / 10,
      total_trips,
      total_co2_kg: Math.round(total_co2 * 100) / 100,
    },
    collection_window: (() => {
      const h = new Date().getHours();
      if (h >= 6 && h <= 10) return { label: 'Primary Collection', time: '06:00-10:00', active: true };
      if (h <= 18) return { label: 'Secondary Transport', time: '10:00-18:00', active: true };
      return { label: 'Night Restriction', time: '22:00-06:00', active: false };
    })(),
    timestamp: new Date().toISOString(),
  });
}
