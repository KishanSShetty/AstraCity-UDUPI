import { create } from 'zustand';

export type LayerId = 'dumps' | 'dryWaste' | 'processing' | 'methane' | 'compost' | 'density' | 'openSpaces' | 'segregation' | 'lulc' | 'truckHubs' | 'autoRoutes' | 'mainRoute' | 'agaraLake';

interface AppState {
  activeLayers: Record<LayerId, boolean>;
  toggleLayer: (layer: LayerId) => void;
  selectedWardId: string | null;
  setSelectedWardId: (id: string | null) => void;
  filteredWards: string[];
  setFilteredWards: (wards: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newSyntheticDumps: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNewSyntheticDumps: (dumps: any[]) => void;
}

export const useStore = create<AppState>((set) => ({
  activeLayers: {
    dumps: true,
    dryWaste: true,
    processing: true,
    methane: true,
    compost: true,
    density: false,
    openSpaces: false,
    segregation: false,
    lulc: false,
    truckHubs: true,
    autoRoutes: true,
    mainRoute: true,
    agaraLake: true,
  },
  toggleLayer: (layer) => set((state) => ({
    activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
  })),
  selectedWardId: null,
  setSelectedWardId: (id) => set({ selectedWardId: id }),
  filteredWards: [],
  setFilteredWards: (wards) => set({ filteredWards: wards }),
  newSyntheticDumps: [],
  setNewSyntheticDumps: (dumps) => set({ newSyntheticDumps: dumps }),
}));

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  location: string;
  description: string;
  date: string;
  status: ComplaintStatus;
  type: string;
  photoUrl: string | null;
}

interface ComplaintStore {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => void;
  updateStatus: (id: string, status: ComplaintStatus) => void;
}

const mockComplaints: Complaint[] = [
  { id: 'RPT-8422', location: 'Syndicate Circle, Manipal', description: 'Mixed waste dumped near the circle.', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'Pending', type: 'Mixed Waste Dump', photoUrl: null },
  { id: 'RPT-8109', location: 'Malpe Beach Road', description: 'Bin is overflowing and attracting strays.', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'In Progress', type: 'Overflowing Bin', photoUrl: null },
  { id: 'RPT-7944', location: 'Ajjarakadu Park', description: 'Large amount of dry leaves and branches.', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'Resolved', type: 'Green Waste', photoUrl: null }
];

export const useComplaintStore = create<ComplaintStore>((set) => ({
  complaints: mockComplaints,
  addComplaint: (data) => set((state) => {
    const newComplaint: Complaint = {
      id: `RPT-${Math.floor(Math.random() * 9000) + 1000}`,
      location: data.location,
      description: data.description || 'No description provided.',
      type: data.type,
      photoUrl: data.photoUrl,
      status: 'Pending',
      date: new Date().toISOString()
    };
    return { complaints: [newComplaint, ...state.complaints] };
  }),
  updateStatus: (id, status) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, status } : c)
  }))
}));

export type UserRole = 'citizen' | 'municipal' | null;

interface AuthStore {
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  login: (role) => set({ role }),
  logout: () => set({ role: null })
}));
