/**
 * Vehicle Store — Zustand state for vehicle positions, routes, and fleet status.
 * PRD §6.5.1: VehicleStore with 10 vehicle objects
 */
import { create } from 'zustand';
import routingConfig from './routing_config.json';

export interface VehicleState {
  id: string;
  type: string;
  lat: number;
  lng: number;
  heading: number;
  status: 'depot' | 'en_route' | 'collecting' | 'unloading' | 'returning';
  load_kg: number;
  capacity_kg: number;
  color: string;
  route: GeoJSON.LineString | null;
  routeProgress: number; // 0.0 → 1.0
  currentStop: string;
  nextStop: string;
  fuel: string;
  zone: string;
  speed_factor: number;
  trail: [number, number][]; // Last N positions
}

interface VehicleStoreState {
  vehicles: VehicleState[];
  selectedVehicleId: string | null;
  isAnimating: boolean;
  animationSpeed: number;
  
  // Actions
  setVehicles: (vehicles: VehicleState[]) => void;
  updateVehicle: (id: string, update: Partial<VehicleState>) => void;
  selectVehicle: (id: string | null) => void;
  setAnimating: (value: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  initializeFleet: () => void;
  resetFleet: () => void;
}

const DEPOT = {
  lat: routingConfig.depot.coordinates[1],
  lng: routingConfig.depot.coordinates[0],
};

export const useVehicleStore = create<VehicleStoreState>((set, get) => ({
  vehicles: [],
  selectedVehicleId: null,
  isAnimating: false,
  animationSpeed: 1,

  setVehicles: (vehicles) => set({ vehicles }),

  updateVehicle: (id, update) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...update } : v
      ),
    })),

  selectVehicle: (id) => set({ selectedVehicleId: id }),
  setAnimating: (value) => set({ isAnimating: value }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  initializeFleet: () => {
    const vehicles: VehicleState[] = routingConfig.vehicle_fleet.map((v) => ({
      id: v.id,
      type: v.type,
      lat: DEPOT.lat + (Math.random() - 0.5) * 0.001, // Slight offset at depot
      lng: DEPOT.lng + (Math.random() - 0.5) * 0.001,
      heading: 0,
      status: 'depot' as const,
      load_kg: 0,
      capacity_kg: v.capacity_kg,
      color: v.color,
      route: null,
      routeProgress: 0,
      currentStop: 'Depot',
      nextStop: '',
      fuel: v.fuel,
      zone: v.zone,
      speed_factor: v.speed_factor,
      trail: [],
    }));
    set({ vehicles });
  },

  resetFleet: () => {
    const state = get();
    const vehicles = state.vehicles.map((v) => ({
      ...v,
      lat: DEPOT.lat + (Math.random() - 0.5) * 0.001,
      lng: DEPOT.lng + (Math.random() - 0.5) * 0.001,
      heading: 0,
      status: 'depot' as const,
      load_kg: 0,
      route: null,
      routeProgress: 0,
      currentStop: 'Depot',
      nextStop: '',
      trail: [],
    }));
    set({ vehicles, isAnimating: false });
  },
}));

/**
 * DWCC Load Store — Track capacity usage for all 6 in-ward DWCCs.
 */
export interface DWCCLoadState {
  id: string;
  lat: number;
  lon: number;
  label: string;
  capacity_tpd: number;
  current_load_kg: number;
  load_pct: number;
  status: 'normal' | 'yellow' | 'red' | 'critical';
}

interface DWCCStoreState {
  dwccs: DWCCLoadState[];
  setDWCCLoad: (id: string, load_kg: number) => void;
  initializeDWCCs: () => void;
}

export const useDWCCStore = create<DWCCStoreState>((set) => ({
  dwccs: [],

  setDWCCLoad: (id, load_kg) =>
    set((state) => ({
      dwccs: state.dwccs.map((d) => {
        if (d.id !== id) return d;
        const pct = Math.round((load_kg / (d.capacity_tpd * 1000)) * 100);
        let status: DWCCLoadState['status'] = 'normal';
        if (pct >= 100) status = 'critical';
        else if (pct >= 90) status = 'red';
        else if (pct >= 70) status = 'yellow';
        return { ...d, current_load_kg: load_kg, load_pct: pct, status };
      }),
    })),

  initializeDWCCs: () => {
    const dwccs: DWCCLoadState[] = [
      { id: 'DWCC-1', lat: 12.91263, lon: 77.64903, label: 'DWCC Sector 2 East', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
      { id: 'DWCC-2', lat: 12.92218, lon: 77.64688, label: 'DWCC Sector 3 North', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
      { id: 'DWCC-3', lat: 12.91811, lon: 77.64545, label: 'DWCC Sector 3 Central', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
      { id: 'DWCC-4', lat: 12.91218, lon: 77.64755, label: 'DWCC Sector 2 East', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
      { id: 'DWCC-5', lat: 12.90536, lon: 77.63312, label: 'DWCC Sector 1 SW', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
      { id: 'DWCC-6', lat: 12.89907, lon: 77.64077, label: 'DWCC Sector 1 South', capacity_tpd: 3, current_load_kg: 0, load_pct: 0, status: 'normal' },
    ];
    set({ dwccs });
  },
}));
