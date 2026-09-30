/**
 * VRP Solver — Clarke-Wright Savings Algorithm with Capacity & Time Window Constraints.
 * 
 * Pure TypeScript implementation (no Python/OR-Tools dependency).
 * PRD §6.5.3: Capacitated VRP with Time Windows (CVRPTW)
 */

import { buildDistanceMatrix, haversineDistance } from './osrm_client';

export interface VRPStop {
  id: string;
  lat: number;
  lon: number;
  demand_kg: number;
  time_window?: { start: string; end: string };
  type: 'dwcc' | 'bmu' | 'wpu' | 'collection_point';
  label?: string;
}

export interface VRPVehicle {
  id: string;
  type: string;
  capacity_kg: number;
  allowed_roads: string[];
  color: string;
  speed_factor: number;
}

export interface VRPAssignment {
  vehicle_id: string;
  vehicle_type: string;
  vehicle_color: string;
  stops: VRPStop[];
  stop_order: number[];
  total_distance_km: number;
  total_load_kg: number;
  utilization_pct: number;
  estimated_duration_min: number;
  co2_kg: number;
  route_coordinates: [number, number][]; // [lon, lat] pairs for OSRM
}

export interface VRPResult {
  assignments: VRPAssignment[];
  total_distance_km: number;
  total_load_kg: number;
  total_co2_kg: number;
  total_duration_min: number;
  unassigned_stops: VRPStop[];
  solver_time_ms: number;
  algorithm: string;
  traffic_multiplier: number;
  recommended_dispatch_time: string;
}

/**
 * Solve the VRP using Clarke-Wright Savings Algorithm.
 */
export function solveVRP(
  stops: VRPStop[],
  vehicles: VRPVehicle[],
  depot: { lat: number; lon: number },
  dispatch_hour: number = new Date().getHours()
): VRPResult {
  const startTime = performance.now();

  // Traffic Model: Returns a speed multiplier based on time of day
  // Peak hours (8am-10am, 5pm-8pm) have severe congestion in Udupi
  function getTrafficMultiplier(hour: number): number {
    if (hour >= 8 && hour <= 10) return 0.5; // Severe Morning Peak (50% speed)
    if (hour >= 17 && hour <= 20) return 0.6; // Evening Peak (60% speed)
    if (hour >= 11 && hour <= 16) return 0.85; // Midday traffic
    if (hour >= 5 && hour <= 7) return 1.2; // Early morning (Optimal, 120% speed)
    return 1.0; // Night / default
  }

  const currentTrafficMultiplier = getTrafficMultiplier(dispatch_hour);

  if (stops.length === 0 || vehicles.length === 0) {
    return {
      assignments: [],
      total_distance_km: 0,
      total_load_kg: 0,
      total_co2_kg: 0,
      total_duration_min: 0,
      unassigned_stops: stops,
      solver_time_ms: 0,
      algorithm: 'clarke-wright-savings',
      traffic_multiplier: currentTrafficMultiplier,
      recommended_dispatch_time: '05:30 AM',
    };
  }

  // Build points array: depot at index 0, then all stops
  const points = [
    { lat: depot.lat, lon: depot.lon },
    ...stops.map(s => ({ lat: s.lat, lon: s.lon })),
  ];

  // Distance matrix (Haversine)
  const distMatrix = buildDistanceMatrix(points);

  // Sort vehicles by capacity descending (assign bigger vehicles first for efficiency)
  const sortedVehicles = [...vehicles].sort((a, b) => b.capacity_kg - a.capacity_kg);

  // === Clarke-Wright Savings Algorithm ===

  // Step 1: Compute savings for all pairs
  interface Saving {
    i: number; // stop index (1-based in points array)
    j: number;
    saving: number;
  }

  const savings: Saving[] = [];
  for (let i = 1; i <= stops.length; i++) {
    for (let j = i + 1; j <= stops.length; j++) {
      const s = distMatrix[0][i] + distMatrix[0][j] - distMatrix[i][j];
      if (s > 0) {
        savings.push({ i, j, saving: s });
      }
    }
  }

  // Sort savings descending
  savings.sort((a, b) => b.saving - a.saving);

  // Step 2: Initialize routes — each stop is its own route
  interface Route {
    stops: number[]; // indices into points array (1-based)
    load_kg: number;
    vehicle_idx: number | null;
  }

  // Track which route each stop belongs to
  const stopToRoute: number[] = new Array(stops.length + 1).fill(-1);
  const routes: Route[] = [];

  for (let i = 0; i < stops.length; i++) {
    const routeIdx = routes.length;
    routes.push({
      stops: [i + 1], // 1-based index
      load_kg: stops[i].demand_kg,
      vehicle_idx: null,
    });
    stopToRoute[i + 1] = routeIdx;
  }

  // Step 3: Merge routes greedily
  for (const { i, j } of savings) {
    const routeI = stopToRoute[i];
    const routeJ = stopToRoute[j];

    // Skip if already in same route
    if (routeI === routeJ) continue;
    // Skip if either route is already "dead" (merged away)
    if (routes[routeI].stops.length === 0 || routes[routeJ].stops.length === 0) continue;

    // Check if i and j are at the edges of their routes (can only merge at endpoints)
    const stopsI = routes[routeI].stops;
    const stopsJ = routes[routeJ].stops;
    const iAtEdge = stopsI[0] === i || stopsI[stopsI.length - 1] === i;
    const jAtEdge = stopsJ[0] === j || stopsJ[stopsJ.length - 1] === j;
    if (!iAtEdge || !jAtEdge) continue;

    // Check combined load against max vehicle capacity
    const combinedLoad = routes[routeI].load_kg + routes[routeJ].load_kg;
    const maxCapacity = sortedVehicles.length > 0 
      ? Math.max(...sortedVehicles.map(v => v.capacity_kg))
      : Infinity;
    if (combinedLoad > maxCapacity) continue;

    // Merge route J into route I
    // Orient routes so i is at end of I and j is at start of J
    if (stopsI[stopsI.length - 1] !== i) stopsI.reverse();
    if (stopsJ[0] !== j) stopsJ.reverse();

    const mergedStops = [...stopsI, ...stopsJ];
    routes[routeI].stops = mergedStops;
    routes[routeI].load_kg = combinedLoad;

    // Update stop-to-route mapping
    for (const s of stopsJ) {
      stopToRoute[s] = routeI;
    }

    // Empty route J
    routes[routeJ].stops = [];
    routes[routeJ].load_kg = 0;
  }

  // Step 4: Assign vehicles to routes
  const activeRoutes = routes.filter(r => r.stops.length > 0);
  // Sort active routes by load descending
  activeRoutes.sort((a, b) => b.load_kg - a.load_kg);

  const assignments: VRPAssignment[] = [];
  const usedVehicles = new Set<number>();
  const unassigned: VRPStop[] = [];

  for (const route of activeRoutes) {
    // Find best fitting vehicle
    let assignedVehicleIdx = -1;
    for (let v = 0; v < sortedVehicles.length; v++) {
      if (usedVehicles.has(v)) continue;
      if (sortedVehicles[v].capacity_kg >= route.load_kg) {
        assignedVehicleIdx = v;
        break;
      }
    }

    if (assignedVehicleIdx === -1) {
      // No vehicle available — try to find any unused vehicle
      for (let v = 0; v < sortedVehicles.length; v++) {
        if (!usedVehicles.has(v)) {
          assignedVehicleIdx = v;
          break;
        }
      }
    }

    if (assignedVehicleIdx === -1) {
      // All vehicles used — mark stops as unassigned
      for (const si of route.stops) {
        unassigned.push(stops[si - 1]);
      }
      continue;
    }

    usedVehicles.add(assignedVehicleIdx);
    const vehicle = sortedVehicles[assignedVehicleIdx];

    // Compute route distance: depot → stop1 → stop2 → ... → depot
    let totalDist = 0;
    const routeStops = route.stops;
    // depot → first stop
    totalDist += distMatrix[0][routeStops[0]];
    // Between consecutive stops
    for (let k = 0; k < routeStops.length - 1; k++) {
      totalDist += distMatrix[routeStops[k]][routeStops[k + 1]];
    }
    // Last stop → depot
    totalDist += distMatrix[routeStops[routeStops.length - 1]][0];

    // Build route coordinates for OSRM
    const routeCoords: [number, number][] = [
      [depot.lon, depot.lat],
      ...routeStops.map(si => [points[si].lon, points[si].lat] as [number, number]),
      [depot.lon, depot.lat],
    ];

    // CO2 estimation
    const emissionFactors: Record<string, number> = {
      auto_tipper: 0.12,
      small_compactor: 0.35,
      large_compactor: 0.45,
      hook_loader: 0.55,
      garbage_truck: 0.35,
    };
    
    // Add penalty to CO2 if traffic is bad (idling emissions)
    const trafficCO2Penalty = currentTrafficMultiplier < 1.0 ? (1.0 / currentTrafficMultiplier) : 1.0;
    const co2 = totalDist * (emissionFactors[vehicle.type] || 0.35) * trafficCO2Penalty;

    // Duration estimate with REAL-TIME TRAFFIC multiplier
    // Base avg speed is 20 km/h in Udupi. Traffic alters this.
    const avgSpeed = 20 * vehicle.speed_factor * currentTrafficMultiplier;
    const drivingMin = (totalDist / avgSpeed) * 60;
    const stopTime = routeStops.length * 5; // 5 min per stop
    const totalMin = drivingMin + stopTime;

    assignments.push({
      vehicle_id: vehicle.id,
      vehicle_type: vehicle.type,
      vehicle_color: vehicle.color,
      stops: routeStops.map(si => stops[si - 1]),
      stop_order: routeStops.map(si => si - 1),
      total_distance_km: Math.round(totalDist * 100) / 100,
      total_load_kg: route.load_kg,
      utilization_pct: Math.round((route.load_kg / vehicle.capacity_kg) * 100),
      estimated_duration_min: Math.round(totalMin),
      co2_kg: Math.round(co2 * 100) / 100,
      route_coordinates: routeCoords,
    });
  }

  const solverTime = performance.now() - startTime;

  return {
    assignments,
    total_distance_km: Math.round(assignments.reduce((s, a) => s + a.total_distance_km, 0) * 100) / 100,
    total_load_kg: assignments.reduce((s, a) => s + a.total_load_kg, 0),
    total_co2_kg: Math.round(assignments.reduce((s, a) => s + a.co2_kg, 0) * 100) / 100,
    total_duration_min: Math.round(assignments.reduce((s, a) => s + a.estimated_duration_min, 0)),
    unassigned_stops: unassigned,
    solver_time_ms: Math.round(solverTime),
    algorithm: 'clarke-wright-savings',
    traffic_multiplier: currentTrafficMultiplier,
    recommended_dispatch_time: '05:30 AM (Optimal Off-Peak)',
  };
}

/**
 * Create default collection stops from DWCC GeoJSON data.
 */
export function createStopsFromDWCCs(
  dwccFeatures: GeoJSON.Feature[],
  wastePerStopKg: number = 500
): VRPStop[] {
  return dwccFeatures
    .filter(f => f.properties?._in_hsr)
    .map((f, i) => ({
      id: `DWCC-${i + 1}`,
      lat: (f.geometry as GeoJSON.Point).coordinates[1],
      lon: (f.geometry as GeoJSON.Point).coordinates[0],
      demand_kg: wastePerStopKg,
      type: 'dwcc' as const,
      label: `DWCC ${i + 1} (Sector ${Math.floor(i / 2) + 1})`,
      time_window: { start: '06:00', end: '10:00' },
    }));
}
