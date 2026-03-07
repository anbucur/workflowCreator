import { create } from 'zustand';
import type { SelectedElement, ConnectorHandlePosition } from '../types';

interface ConnectingFrom {
  stepId: string;
  handle: ConnectorHandlePosition;
}

interface UiStore {
  selectedElement: SelectedElement;
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  zoom: number;
  panX: number;
  panY: number;
  isDraggingCard: boolean;
  connectMode: boolean;
  connectingFrom: ConnectingFrom | null;
  wizardOpen: boolean;
  integrationsOpen: boolean;
  brandKitOpen: boolean;
  presentationOpen: boolean;

  setSelectedElement: (el: SelectedElement) => void;
  setSidebarOpen: (open: boolean) => void;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  setIsDraggingCard: (dragging: boolean) => void;
  setConnectMode: (on: boolean) => void;
  setConnectingFrom: (from: ConnectingFrom | null) => void;
  setWizardOpen: (open: boolean) => void;
  setIntegrationsOpen: (open: boolean) => void;
  setBrandKitOpen: (open: boolean) => void;
  setPresentationOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedElement: null,
  sidebarOpen: true,
  aiPanelOpen: false,
  zoom: 0.65,
  panX: 0,
  panY: 0,
  isDraggingCard: false,
  connectMode: false,
  connectingFrom: null,
  wizardOpen: false,
  integrationsOpen: false,
  brandKitOpen: false,
  presentationOpen: false,

  setSelectedElement: (el) => set({ selectedElement: el, sidebarOpen: true }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.2, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 0.65, panX: 0, panY: 0 }),
  setIsDraggingCard: (dragging) => set({ isDraggingCard: dragging }),
  setConnectMode: (on) => set({ connectMode: on, connectingFrom: on ? null : null }),
  setConnectingFrom: (from) => set({ connectingFrom: from }),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  setIntegrationsOpen: (open) => set({ integrationsOpen: open }),
  setBrandKitOpen: (open) => set({ brandKitOpen: open }),
  setPresentationOpen: (open) => set({ presentationOpen: open }),
}));
