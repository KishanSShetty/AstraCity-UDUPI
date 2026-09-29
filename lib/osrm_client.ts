/**
 * OSRM Client — Road-snapped route computation for waste collection vehicles.
 * Uses the public OSRM demo server (rate limited ~1 req/sec).
 * 
 * PRD §8.2: https://router.project-osrm.org/route/v1/driving/
 */

const OSRM_BASE = 'https://router.project-osrm.org';

// Simple in-memory route cache (coordinate hash → result)
const routeCache = new Map<string, OSRMRouteResult>();

export interface OSRMRouteResult {
  geometry: GeoJSON.LineString;
  distance_m: number;
  distance_km: number;
  duration_s: number;
  duration_min: number;
  legs: Array<{
    distance: number;
    duration: number;
  }>;
  cached: boolean;
}

/**
 * Hash coordinates for caching.
 */
function coordHash(coords: [number, number][]): string {
  return coords.map(c => `${c[0].toFixed(5)},${c[1].toFixed(5)}`).join(';');
}

/**
 * Compute a road-snapped route between waypoints via OSRM.
 * 
 * @param coordinates Array of [longitude, latitude] pairs (OSRM format: lon first)
 * @returns Route geometry, distance, and duration
 */
export async function computeRoute(
  coordinates: [number, number][]
): Promise<OSRMRouteResult | null> {
  if (coordinates.length < 2) return null;

  // Check cache
  const hash = coordHash(coordinates);
  if (routeCache.has(hash)) {
    const cached = routeCache.get(hash)!;
    return { ...cached, cached: true };
  }

  // Build OSRM URL
  const coordStr = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM_BASE}/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`OSRM error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM returned no routes:', data.code);
      return null;
    }

    const route = data.routes[0];
    const result: OSRMRouteResult = {
      geometry: route.geometry,
      distance_m: route.distance,
      distance_km: Math.round(route.distance / 10) / 100, // 2 decimal places
      duration_s: route.duration,
      duration_min: Math.round(route.duration / 6) / 10, // 1 decimal place
      legs: route.legs.map((leg: { distance: number; duration: number }) => ({
        distance: leg.distance,
        duration: leg.duration,
      })),
      cached: false,
    };

    // Cache the result
    routeCache.set(hash, result);

    return result;
  } catch (error) {
    console.error('OSRM fetch error:', error);
    return null;
  }
}

/**
 * Compute route for a vehicle from depot → stops → destination.
 * Used by VRP solver to get actual road distances.
 */
export async function computeVehicleRoute(
  depotCoord: [number, number],
  stopCoords: [number, number][],
  destinationCoord: [number, number]
): Promise<OSRMRouteResult | null> {
  const allCoords = [depotCoord, ...stopCoords, destinationCoord];
  return computeRoute(allCoords);
}

/**
 * Get distance matrix between all pairs of points (Haversine fallback).
 * Used when OSRM is unavailable or for initial VRP solution.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Build a distance matrix for N points using Haversine.
 */
export function buildDistanceMatrix(
  points: { lat: number; lon: number }[]
): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }
  return matrix;
}

/**
 * Compute CO2 emissions for a given route distance.
 * Based on average waste collection vehicle emissions.
 */
export function computeCO2(distanceKm: number, vehicleType: string): number {
  const emissionFactors: Record<string, number> = {
    auto_tipper: 0.12,      // kg CO2/km (CNG)
    small_compactor: 0.35,   // kg CO2/km (Diesel)
    large_compactor: 0.45,   // kg CO2/km (Diesel)
    hook_loader: 0.55,       // kg CO2/km (Diesel)
    garbage_truck: 0.35,     // kg CO2/km (Diesel)
  };
  const factor = emissionFactors[vehicleType] || 0.35;
  return Math.round(distanceKm * factor * 100) / 100;
}

export function clearRouteCache(): void {
  routeCache.clear();
}
