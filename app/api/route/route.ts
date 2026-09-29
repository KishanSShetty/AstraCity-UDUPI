/**
 * OSRM Route API — Proxy for road-snapped route computation.
 * PRD §8.1: /api/route
 */
import { NextRequest, NextResponse } from 'next/server';

const OSRM_BASE = 'https://router.project-osrm.org';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coords = searchParams.get('coords');

  if (!coords) {
    return NextResponse.json(
      { error: 'Missing coords parameter. Format: lon1,lat1;lon2,lat2;...' },
      { status: 400 }
    );
  }

  try {
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `OSRM returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) {
      return NextResponse.json(
        { error: 'OSRM returned no valid route', code: data.code },
        { status: 422 }
      );
    }

    const route = data.routes[0];
    return NextResponse.json({
      geometry: route.geometry,
      distance_m: route.distance,
      distance_km: Math.round(route.distance / 10) / 100,
      duration_s: route.duration,
      duration_min: Math.round(route.duration / 6) / 10,
      legs: route.legs?.map((leg: { distance: number; duration: number; steps: unknown[] }) => ({
        distance_m: leg.distance,
        duration_s: leg.duration,
        steps: leg.steps?.length || 0,
      })),
    });
  } catch (error) {
    console.error('OSRM proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch route from OSRM' },
      { status: 500 }
    );
  }
}
