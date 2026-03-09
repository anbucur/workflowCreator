import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InfographicData } from '../types';

export interface OpenProject {
  id: string;
  name: string;
  data: InfographicData;
  thumbnail: string | null;
  lastAccessed: number;
  isDirty: boolean;
}

interface ProjectTabsState {
  openProjects: OpenProject[];
  activeProjectId: string | null;
  
  // Actions
  openProject: (data: InfographicData, thumbnail?: string | null) => void;
  switchToProject: (projectId: string, currentData: InfographicData, currentThumbnail?: string | null) => void;
  closeProject: (projectId: string) => void;
  closeAllProjects: () => void;
  updateThumbnail: (projectId: string, thumbnail: string) => void;
  markDirty: (projectId: string, isDirty?: boolean) => void;
  updateProjectData: (projectId: string, data: InfographicData) => void;
  renameProject: (projectId: string, name: string) => void;
  getActiveProject: () => OpenProject | null;
  isOpen: (projectId: string) => boolean;
}

export const useProjectTabsStore = create<ProjectTabsState>()(
  persist(
    (set, get) => ({
      openProjects: [],
      activeProjectId: null,

      openProject: (data, thumbnail = null) => {
        const existing = get().openProjects.find(p => p.id === data.id);
        if (existing) {
          // Already open, just switch to it
          set({ activeProjectId: data.id });
          return;
        }

        const newProject: OpenProject = {
          id: data.id,
          name: data.name || 'Untitled Project',
          data,
          thumbnail,
          lastAccessed: Date.now(),
          isDirty: false,
        };

        set(state => ({
          openProjects: [...state.openProjects, newProject],
          activeProjectId: data.id,
        }));
      },

      switchToProject: (projectId, currentData, currentThumbnail) => {
        const { openProjects, activeProjectId } = get();
        
        // Update current project's data and thumbnail before switching
        if (activeProjectId && currentThumbnail) {
          set(state => ({
            openProjects: state.openProjects.map(p => 
              p.id === activeProjectId 
                ? { ...p, data: currentData, thumbnail: currentThumbnail, lastAccessed: Date.now() }
                : p
            ),
          }));
        }

        // Check if target project exists
        const targetProject = openProjects.find(p => p.id === projectId);
        if (!targetProject) return;

        set({ activeProjectId: projectId });
      },

      closeProject: (projectId) => {
        const { openProjects, activeProjectId } = get();
        const newProjects = openProjects.filter(p => p.id !== projectId);
        
        let newActiveId = activeProjectId;
        if (activeProjectId === projectId) {
          // If closing active project, switch to the most recently accessed
          const remaining = newProjects.sort((a, b) => b.lastAccessed - a.lastAccessed);
          newActiveId = remaining[0]?.id || null;
        }

        set({
          openProjects: newProjects,
          activeProjectId: newActiveId,
        });
      },

      closeAllProjects: () => {
        set({ openProjects: [], activeProjectId: null });
      },

      updateThumbnail: (projectId, thumbnail) => {
        set(state => ({
          openProjects: state.openProjects.map(p =>
            p.id === projectId ? { ...p, thumbnail } : p
          ),
        }));
      },

      markDirty: (projectId, isDirty = true) => {
        set(state => ({
          openProjects: state.openProjects.map(p =>
            p.id === projectId ? { ...p, isDirty } : p
          ),
        }));
      },

      updateProjectData: (projectId, data) => {
        set(state => ({
          openProjects: state.openProjects.map(p =>
            p.id === projectId ? { ...p, data, isDirty: true } : p
          ),
        }));
      },

      renameProject: (projectId, name) => {
        set(state => ({
          openProjects: state.openProjects.map(p =>
            p.id === projectId ? { ...p, name, data: { ...p.data, name } } : p
          ),
        }));
      },

      getActiveProject: () => {
        const { openProjects, activeProjectId } = get();
        return openProjects.find(p => p.id === activeProjectId) || null;
      },

      isOpen: (projectId) => {
        return get().openProjects.some(p => p.id === projectId);
      },
    }),
    {
      name: 'project-tabs',
      partialize: (state) => ({
        openProjects: state.openProjects.map(p => ({
          id: p.id,
          name: p.name,
          data: p.data,
          thumbnail: p.thumbnail,
          lastAccessed: p.lastAccessed,
          isDirty: p.isDirty,
        })),
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);