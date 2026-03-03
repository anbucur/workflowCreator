import { create } from 'zustand';
import type { InfographicData } from '../types';
import { useInfographicStore } from './useInfographicStore';

interface HistoryStore {
  past: InfographicData[];
  future: InfographicData[];
  maxHistory: number;

  pushState: (snapshot: InfographicData) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (snapshot) => set((s) => ({
    past: [...s.past.slice(-(s.maxHistory - 1)), snapshot],
    future: [],
  })),

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;
    const current = useInfographicStore.getState().getSnapshot();
    const previous = past[past.length - 1];
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [current, ...s.future],
    }));
    useInfographicStore.getState().loadInfographic(previous);
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    const current = useInfographicStore.getState().getSnapshot();
    const next = future[0];
    set((s) => ({
      past: [...s.past, current],
      future: s.future.slice(1),
    }));
    useInfographicStore.getState().loadInfographic(next);
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}));
