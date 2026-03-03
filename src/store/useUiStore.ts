import { create } from 'zustand';
import type { SelectedElement } from '../types';

interface UiStore {
  selectedElement: SelectedElement;
  sidebarOpen: boolean;
  zoom: number;
  panX: number;
  panY: number;

  setSelectedElement: (el: SelectedElement) => void;
  setSidebarOpen: (open: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedElement: null,
  sidebarOpen: true,
  zoom: 0.65,
  panX: 0,
  panY: 0,

  setSelectedElement: (el) => set({ selectedElement: el, sidebarOpen: true }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.2, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 0.65, panX: 0, panY: 0 }),
}));
