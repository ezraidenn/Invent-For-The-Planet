import { create } from "zustand";
import type { MaterialType, MapMarker } from "@/types";

interface MapFilters {
  showListings: boolean;
  showCenters: boolean;
  showRecyclers: boolean;
  materialFilter: MaterialType | null;
}

interface AppState {
  // Map state
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  mapFilters: MapFilters;
  selectedMarkerId: string | null;
  liveMarkers: MapMarker[];

  // Actions
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  setSelectedMarker: (id: string | null) => void;
  addLiveMarker: (marker: MapMarker) => void;
  removeLiveMarker: (id: string) => void;
  updateLiveMarker: (id: string, data: Partial<MapMarker>) => void;

  // Notification badge
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mapCenter: { lat: 20.9674, lng: -89.6235 },
  mapZoom: 13,
  mapFilters: {
    showListings: true,
    showCenters: true,
    showRecyclers: true,
    materialFilter: null,
  },
  selectedMarkerId: null,
  liveMarkers: [],

  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapFilters: (filters) =>
    set((state) => ({
      mapFilters: { ...state.mapFilters, ...filters },
    })),
  setSelectedMarker: (id) => set({ selectedMarkerId: id }),
  addLiveMarker: (marker) =>
    set((state) => ({
      liveMarkers: [
        ...state.liveMarkers.filter((m) => m.id !== marker.id),
        marker,
      ],
    })),
  removeLiveMarker: (id) =>
    set((state) => ({
      liveMarkers: state.liveMarkers.filter((m) => m.id !== id),
    })),
  updateLiveMarker: (id, data) =>
    set((state) => ({
      liveMarkers: state.liveMarkers.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    })),

  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
}));
