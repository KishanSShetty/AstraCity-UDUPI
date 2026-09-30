import { NextResponse } from 'next/server';

/**
 * GET /api/fleet-status — Real-time vehicle fleet status & mathematical telemetry for Udupi CMC.
 * Aligned with Udupi Municipal Fleet (12 Auto Tippers, 2 Compactors, 2 Trucks).
 */

interface VehicleStatus {
  id: string;
  type: string;
  label: string;
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
  // 12 Primary Auto Tippers (Door-to-door in residential/narrow streets)
  { id: 'AT-01', type: 'auto_tipper', label: 'Auto Tipper 01', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 440, trips_completed: 2, total_distance_km: 3.4, assigned_sector: 'Ward 24 Kasturba Nagar', assigned_dwcc: 'Beedinagudde DWCC-1' },
  { id: 'AT-02', type: 'auto_tipper', label: 'Auto Tipper 02', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 460, trips_completed: 2, total_distance_km: 3.1, assigned_sector: 'Ward 25 Maruthi Veethika', assigned_dwcc: 'Beedinagudde DWCC-1' },
  { id: 'AT-03', type: 'auto_tipper', label: 'Auto Tipper 03', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 430, trips_completed: 1, total_distance_km: 2.8, assigned_sector: 'Ward 12 Karavali Bypass', assigned_dwcc: 'Karavali Junction DWCC-2' },
  { id: 'AT-04', type: 'auto_tipper', label: 'Auto Tipper 04', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 470, trips_completed: 2, total_distance_km: 3.6, assigned_sector: 'Ward 14 Bannanje', assigned_dwcc: 'Karavali Junction DWCC-2' },
  { id: 'AT-05', type: 'auto_tipper', label: 'Auto Tipper 05', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 490, trips_completed: 3, total_distance_km: 5.4, assigned_sector: 'Ward 04 Malpe Port', assigned_dwcc: 'Malpe Coastal DWCC-3' },
  { id: 'AT-06', type: 'auto_tipper', label: 'Auto Tipper 06', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'returning', current_load_kg: 0, trips_completed: 2, total_distance_km: 4.8, assigned_sector: 'Ward 05 Kola Seaface', assigned_dwcc: 'Malpe Coastal DWCC-3' },
  { id: 'AT-07', type: 'auto_tipper', label: 'Auto Tipper 07', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 480, trips_completed: 3, total_distance_km: 6.9, assigned_sector: 'Ward 18 Manipal University', assigned_dwcc: 'Manipal DWCC-4' },
  { id: 'AT-08', type: 'auto_tipper', label: 'Auto Tipper 08', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 450, trips_completed: 2, total_distance_km: 5.7, assigned_sector: 'Ward 19 Saralebettu', assigned_dwcc: 'Manipal DWCC-4' },
  { id: 'AT-09', type: 'auto_tipper', label: 'Auto Tipper 09', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 460, trips_completed: 2, total_distance_km: 4.3, assigned_sector: 'Ward 01 Santhekatte Market', assigned_dwcc: 'Santhekatte DWCC-5' },
  { id: 'AT-10', type: 'auto_tipper', label: 'Auto Tipper 10', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'idle', current_load_kg: 0, trips_completed: 1, total_distance_km: 3.0, assigned_sector: 'Ward 02 Gopalapura', assigned_dwcc: 'Santhekatte DWCC-5' },
  { id: 'AT-11', type: 'auto_tipper', label: 'Auto Tipper 11', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'active', current_load_kg: 470, trips_completed: 2, total_distance_km: 6.2, assigned_sector: 'Ward 30 Alevoor Border', assigned_dwcc: 'Karvalu SWM DWCC-6' },
  { id: 'AT-12', type: 'auto_tipper', label: 'Auto Tipper 12', icon: '🛺', capacity_kg: 500, fuel_type: 'CNG', co2_per_km: 0.12, road_access: ['residential', 'service', 'tertiary', 'secondary', 'primary'], road_coverage_pct: 77.9, status: 'returning', current_load_kg: 0, trips_completed: 3, total_distance_km: 7.4, assigned_sector: 'Ward 31 Karvalu South', assigned_dwcc: 'Karvalu SWM DWCC-6' },

  // 4 Heavy Transport Vehicles (Secondary Hubs, Landfill & BMU)
  { id: 'C-01', type: 'small_compactor', label: 'Small Compactor C-01', icon: '🚛', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 17.4, status: 'active', current_load_kg: 4850, trips_completed: 1, total_distance_km: 8.4, assigned_sector: 'Regional Secondary Transit', assigned_dwcc: 'Karvalu Central MRF' },
  { id: 'C-02', type: 'large_compactor', label: 'Heavy Compactor C-02', icon: '🚛', capacity_kg: 10000, fuel_type: 'Diesel', co2_per_km: 0.45, road_access: ['secondary', 'primary', 'trunk'], road_coverage_pct: 7.5, status: 'active', current_load_kg: 9600, trips_completed: 1, total_distance_km: 11.2, assigned_sector: 'Citywide Bulk Transfer', assigned_dwcc: 'Karvalu Regional Landfill' },
  { id: 'GT-01', type: 'garbage_truck', label: 'Garbage Truck GT-01', icon: '🚚', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 17.4, status: 'active', current_load_kg: 4700, trips_completed: 2, total_distance_km: 7.9, assigned_sector: 'Commercial Wet Waste', assigned_dwcc: 'Beedinagudde BMU' },
  { id: 'GT-02', type: 'garbage_truck', label: 'Garbage Truck GT-02', icon: '🚚', capacity_kg: 5000, fuel_type: 'Diesel', co2_per_km: 0.35, road_access: ['tertiary', 'secondary', 'primary', 'trunk'], road_coverage_pct: 17.4, status: 'maintenance', current_load_kg: 0, trips_completed: 0, total_distance_km: 0, assigned_sector: 'Depot Maintenance Bay', assigned_dwcc: 'Udupi Central Depot' },
];

export async function GET() {
  const active = FLEET.filter(v => v.status === 'active').length;
  const idle = FLEET.filter(v => v.status === 'idle').length;
  const maintenance = FLEET.filter(v => v.status === 'maintenance').length;
  const returning = FLEET.filter(v => v.status === 'returning').length;

  const total_load_kg = FLEET.reduce((s, v) => s + v.current_load_kg, 0);
  const total_capacity_kg = FLEET.reduce((s, v) => s + v.capacity_kg, 0);
  const total_distance_km = FLEET.reduce((s, v) => s + v.total_distance_km, 0);
  const total_trips = FLEET.reduce((s, v) => s + v.trips_completed, 0);
  const total_co2_kg = FLEET.reduce((s, v) => s + (v.total_distance_km * v.co2_per_km), 0);

  // Payload utilization math
  const payload_utilization_pct = total_capacity_kg > 0 ? Math.round((total_load_kg / total_capacity_kg) * 100) : 0;

  return NextResponse.json({
    success: true,
    vehicles: FLEET,
    summary: {
      total: FLEET.length,
      active,
      idle,
      maintenance,
      returning,
      total_load_kg,
      total_capacity_kg,
      payload_utilization_pct,
      total_distance_km: Math.round(total_distance_km * 10) / 10,
      total_trips,
      total_co2_kg: Math.round(total_co2_kg * 100) / 100,
    },
    collection_window: (() => {
      const h = new Date().getHours();
      if (h >= 6 && h <= 10) return { label: 'Primary Door-to-Door Window', time: '06:00 - 10:00', active: true };
      if (h <= 18) return { label: 'Secondary Bulk Transit Window', time: '10:00 - 18:00', active: true };
      return { label: 'Night Restriction Period', time: '22:00 - 06:00', active: false };
    })(),
    timestamp: new Date().toISOString(),
  });
}
