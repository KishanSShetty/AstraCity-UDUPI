/**
 * VRP Solver API — Solve vehicle routing problem for waste collection.
 * PRD §8.1: /api/vrp
 */
import { NextRequest, NextResponse } from 'next/server';
import { solveVRP, VRPStop, VRPVehicle } from '@/lib/vrp_solver';
import routingConfig from '@/lib/routing_config.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stops, vehicles, depot } = body;

    // Use provided stops or defaults from routing config
    const vrpStops: VRPStop[] = stops || getDefaultStops();
    const vrpVehicles: VRPVehicle[] = vehicles || getDefaultVehicles();
    const vrpDepot = depot || {
      lat: routingConfig.depot.coordinates[1],
      lon: routingConfig.depot.coordinates[0],
    };

    // Solve VRP
    const result = solveVRP(vrpStops, vrpVehicles, vrpDepot);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('VRP solver error:', error);
    return NextResponse.json(
      { success: false, error: 'VRP solver failed' },
      { status: 500 }
    );
  }
}

function getDefaultStops(): VRPStop[] {
  // 6 Udupi DWCCs & Processing Plants
  const dwccs = [
    { id: 'DWCC-1', lat: 13.3415, lon: 74.7455, label: 'Beedinagudde Dry Waste Center' },
    { id: 'DWCC-2', lat: 13.3377, lon: 74.7370, label: 'Karavali Junction DWCC' },
    { id: 'DWCC-3', lat: 13.3533, lon: 74.7042, label: 'Malpe Coastal DWCC' },
    { id: 'DWCC-4', lat: 13.3525, lon: 74.7872, label: 'Manipal DWCC' },
    { id: 'DWCC-5', lat: 13.3800, lon: 74.7450, label: 'Santhekatte DWCC' },
    { id: 'DWCC-6', lat: 13.35028, lon: 74.75028, label: 'Karvalu Central SWM Plant' },
  ];

  const baseLoads = [3600, 2800, 3400, 4200, 3200, 4400];

  // Generate collection points around each DWCC (simulating zone stops)
  const stops: VRPStop[] = [];
  for (let i = 0; i < dwccs.length; i++) {
    const dwcc = dwccs[i];
    stops.push({
      id: dwcc.id,
      lat: dwcc.lat,
      lon: dwcc.lon,
      demand_kg: baseLoads[i],
      type: 'dwcc',
      label: dwcc.label,
      time_window: { start: '06:00', end: '10:00' },
    });
  }

  // Add Beedinagudde BMU as wet waste destination stop
  stops.push({
    id: 'BMU-Beedinagudde',
    lat: 13.3415,
    lon: 74.7460,
    demand_kg: 0,
    type: 'bmu',
    label: 'Beedinagudde BMU (Wet Waste)',
    time_window: { start: '10:00', end: '18:00' },
  });

  return stops;
}

function getDefaultVehicles(): VRPVehicle[] {
  return routingConfig.vehicle_fleet.map(v => ({
    id: v.id,
    type: v.type,
    capacity_kg: v.capacity_kg,
    allowed_roads: routingConfig.vehicle_road_compatibility[v.type as keyof typeof routingConfig.vehicle_road_compatibility] || [],
    color: v.color,
    speed_factor: v.speed_factor,
  }));
}
