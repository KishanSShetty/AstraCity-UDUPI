import { create } from 'zustand';

export type LayerId = 'dumps' | 'methane' | 'waste' | 'dumpProbability' | 'routes' | 'wardVulnerability';
export type UserRole = 'citizen' | 'municipal' | null;

interface AppState {
  activeLayers: Record<LayerId, boolean>;
  toggleLayer: (layer: LayerId) => void;
  selectedWardId: number | null;
  setSelectedWardId: (id: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  activeLayers: {
    dumps: true,
    methane: false,
    waste: false,
    dumpProbability: false,
    routes: false,
    wardVulnerability: true,
  },
  toggleLayer: (layer) => set((state) => ({
    activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
  })),
  selectedWardId: null,
  setSelectedWardId: (id) => set({ selectedWardId: id }),
}));

interface AuthState {
  role: UserRole;
  login: (role: 'citizen' | 'municipal') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: typeof window !== 'undefined' ? (localStorage.getItem('vajrayield_role') as UserRole) : null,
  login: (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vajrayield_role', role);
    }
    set({ role });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vajrayield_role');
      localStorage.clear();
      sessionStorage.clear();
    }
    set({ role: null });
  },
}));