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
  // 6 in-ward DWCCs + collection zone centroids
  const dwccs = [
    { id: 'DWCC-1', lat: 12.91263, lon: 77.64903, label: 'DWCC Sector 2 East' },
    { id: 'DWCC-2', lat: 12.92218, lon: 77.64688, label: 'DWCC Sector 3 North' },
    { id: 'DWCC-3', lat: 12.91811, lon: 77.64545, label: 'DWCC Sector 3 Central' },
    { id: 'DWCC-4', lat: 12.91218, lon: 77.64755, label: 'DWCC Sector 2 East' },
    { id: 'DWCC-5', lat: 12.90536, lon: 77.63312, label: 'DWCC Sector 1 SW' },
    { id: 'DWCC-6', lat: 12.89907, lon: 77.64077, label: 'DWCC Sector 1 South' },
  ];

  const baseLoads = [2760, 2250, 2040, 2640, 1350, 1650];

  // Generate collection points around each DWCC (simulating zone stops)
  const stops: VRPStop[] = [];
  for (let i = 0; i < dwccs.length; i++) {
    const dwcc = dwccs[i];
    stops.push({
      id: dwcc.id,
      lat: dwcc.lat,
      lon: dwcc.lon,
      demand_kg: baseLoads[i], // Realistic distribution
      type: 'dwcc',
      label: dwcc.label,
      time_window: { start: '06:00', end: '10:00' },
    });
  }

  // Add Kudlu BMU as a destination stop
  stops.push({
    id: 'BMU-Kudlu',
    lat: 12.896183,
    lon: 77.650711,
    demand_kg: 0, // Destination, not pickup
    type: 'bmu',
    label: 'Kudlu BMU (Wet Waste)',
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
