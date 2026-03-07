import { create } from 'zustand';
import type { InfographicData, Phase, Step, RoleDefinition, TitleBarConfig, LayoutConfig, StepType, Connector, ConnectorHandlePosition, ConnectorType } from '../types';
import { createDefaultInfographic, createPhase, createStep, createRole, createId } from '../types/defaults';

interface InfographicStore extends InfographicData {
  // Project properties
  setProjectName: (name: string) => void;

  // Title bar
  updateTitleBar: (updates: Partial<TitleBarConfig>) => void;

  // Phases
  addPhase: () => void;
  removePhase: (phaseId: string) => void;
  updatePhase: (phaseId: string, updates: Partial<Omit<Phase, 'id' | 'steps'>>) => void;
  reorderPhases: (fromIndex: number, toIndex: number) => void;

  // Steps
  addStep: (phaseId: string, type?: StepType) => void;
  removeStep: (phaseId: string, stepId: string) => void;
  updateStep: (phaseId: string, stepId: string, updates: Partial<Step>) => void;
  changeStepType: (phaseId: string, stepId: string, newType: StepType) => void;
  reorderSteps: (fromPhaseId: string, fromIndex: number, toPhaseId: string, toIndex: number) => void;

  // Roles
  addRole: (name: string, color: string) => void;
  removeRole: (roleId: string) => void;
  updateRole: (roleId: string, updates: Partial<Omit<RoleDefinition, 'id'>>) => void;
  toggleStepRole: (phaseId: string, stepId: string, roleId: string) => void;

  // Layout
  updateLayout: (updates: Partial<LayoutConfig>) => void;
  setBackgroundColor: (color: string) => void;

  // Connectors
  addConnector: (sourceStepId: string, sourceHandle: ConnectorHandlePosition, targetStepId: string, targetHandle: ConnectorHandlePosition, type?: ConnectorType) => void;
  removeConnector: (connectorId: string) => void;
  updateConnector: (connectorId: string, updates: Partial<Omit<Connector, 'id'>>) => void;
  addConnectorWaypoint: (connectorId: string, index: number, point: { x: number; y: number }) => void;
  updateConnectorWaypoint: (connectorId: string, index: number, point: { x: number; y: number }) => void;
  removeConnectorWaypoint: (connectorId: string, index: number) => void;

  // Bulk
  applyTheme: (themeId: string) => void;
  loadInfographic: (data: InfographicData) => void;
  resetToDefault: () => void;
  getSnapshot: () => InfographicData;
}

function extractData(state: InfographicStore): InfographicData {
  return {
    id: state.id,
    name: state.name,
    titleBar: state.titleBar,
    roles: state.roles,
    phases: state.phases,
    layout: state.layout,
    backgroundColor: state.backgroundColor,
    connectors: state.connectors || [],
  };
}

import { temporal } from 'zundo';
import { PREDEFINED_THEMES } from '../utils/themes';
import { sanitizeInfographicData } from '../utils/validation';

const defaultData = createDefaultInfographic();

export const useInfographicStore = create<InfographicStore>()(
  temporal((set, get) => ({
    ...defaultData,

    setProjectName: (name) => set({ name }),

    updateTitleBar: (updates) => set((s) => ({ titleBar: { ...s.titleBar, ...updates } })),

    addPhase: () => set((s) => ({ phases: [...s.phases, createPhase()] })),

    removePhase: (phaseId) => set((s) => ({
      phases: s.phases.filter((p) => p.id !== phaseId),
    })),

    updatePhase: (phaseId, updates) => set((s) => ({
      phases: s.phases.map((p) => p.id === phaseId ? { ...p, ...updates } : p),
    })),

    reorderPhases: (fromIndex, toIndex) => set((s) => {
      const phases = [...s.phases];
      const [moved] = phases.splice(fromIndex, 1);
      phases.splice(toIndex, 0, moved);
      return { phases };
    }),

    addStep: (phaseId, type = 'standard') => set((s) => ({
      phases: s.phases.map((p) =>
        p.id === phaseId ? { ...p, steps: [...p.steps, createStep(type)] } : p
      ),
    })),

    removeStep: (phaseId, stepId) => set((s) => ({
      phases: s.phases.map((p) =>
        p.id === phaseId ? { ...p, steps: p.steps.filter((st) => st.id !== stepId) } : p
      ),
      // cascade-delete connectors referencing this step
      connectors: (s.connectors || []).filter((c) => c.sourceStepId !== stepId && c.targetStepId !== stepId),
    })),

    updateStep: (phaseId, stepId, updates) => set((s) => ({
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? { ...p, steps: p.steps.map((st) => st.id === stepId ? { ...st, ...updates } as Step : st) }
          : p
      ),
    })),

    changeStepType: (phaseId, stepId, newType) => set((s) => ({
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? {
            ...p,
            steps: p.steps.map((st) => {
              if (st.id !== stepId) return st;
              const newStep = createStep(newType, {
                id: st.id,
                title: st.title,
                description: st.description,
                roleIds: st.roleIds,
              });
              return newStep;
            }),
          }
          : p
      ),
    })),

    reorderSteps: (fromPhaseId, fromIndex, toPhaseId, toIndex) => set((s) => {
      const phases = s.phases.map((p) => ({ ...p, steps: [...p.steps] }));
      const fromPhase = phases.find((p) => p.id === fromPhaseId);
      const toPhase = phases.find((p) => p.id === toPhaseId);
      if (!fromPhase || !toPhase) return {};
      const [moved] = fromPhase.steps.splice(fromIndex, 1);
      toPhase.steps.splice(toIndex, 0, moved);
      return { phases };
    }),

    addRole: (name, color) => set((s) => ({
      roles: [...s.roles, createRole(name, color)],
    })),

    removeRole: (roleId) => set((s) => ({
      roles: s.roles.filter((r) => r.id !== roleId),
      phases: s.phases.map((p) => ({
        ...p,
        steps: p.steps.map((st) => ({
          ...st,
          roleIds: st.roleIds.filter((rid) => rid !== roleId),
        })),
      })),
    })),

    updateRole: (roleId, updates) => set((s) => ({
      roles: s.roles.map((r) => r.id === roleId ? { ...r, ...updates } : r),
    })),

    toggleStepRole: (phaseId, stepId, roleId) => set((s) => ({
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? {
            ...p,
            steps: p.steps.map((st) => {
              if (st.id !== stepId) return st;
              const hasRole = st.roleIds.includes(roleId);
              return {
                ...st,
                roleIds: hasRole
                  ? st.roleIds.filter((rid) => rid !== roleId)
                  : [...st.roleIds, roleId],
              };
            }),
          }
          : p
      ),
    })),

    updateLayout: (updates) => set((s) => ({ layout: { ...s.layout, ...updates } })),
    setBackgroundColor: (color) => set({ backgroundColor: color }),

    addConnector: (sourceStepId, sourceHandle, targetStepId, targetHandle, type = 'step') => set((s) => {
      // Don't add if going from/to the exact same handle
      if (sourceStepId === targetStepId && sourceHandle === targetHandle) return s;

      const isNightMode = s.layout.cardShadow === 'neon';
      const defaultColor = isNightMode ? '#818cf8' : '#6366f1';

      const currentConnectors = s.connectors || [];
      const newConnector: Connector = {
        id: createId(),
        sourceStepId,
        sourceHandle,
        targetStepId,
        targetHandle,
        type,
        color: defaultColor,
        lineStyle: 'solid',
        sourceHead: 'none',
        targetHead: 'arrow',
        strokeWidth: 2,
        waypoints: [],
      };
      return { connectors: [...currentConnectors, newConnector] };
    }),

    removeConnector: (connectorId) => set((s) => ({
      connectors: (s.connectors || []).filter((c) => c.id !== connectorId),
    })),

    updateConnector: (connectorId, updates) => set((s) => ({
      connectors: (s.connectors || []).map((c) => c.id === connectorId ? { ...c, ...updates } : c),
    })),

    addConnectorWaypoint: (connectorId, index, point) => set((s) => ({
      connectors: (s.connectors || []).map(c => {
        if (c.id !== connectorId) return c;
        const newWaypoints = [...(c.waypoints || [])];
        newWaypoints.splice(index, 0, point);
        return { ...c, waypoints: newWaypoints };
      })
    })),

    updateConnectorWaypoint: (connectorId, index, point) => set((s) => ({
      connectors: (s.connectors || []).map(c => {
        if (c.id !== connectorId) return c;
        const newWaypoints = [...(c.waypoints || [])];
        newWaypoints[index] = point;
        return { ...c, waypoints: newWaypoints };
      })
    })),

    removeConnectorWaypoint: (connectorId, index) => set((s) => ({
      connectors: (s.connectors || []).map(c => {
        if (c.id !== connectorId) return c;
        const newWaypoints = [...(c.waypoints || [])];
        newWaypoints.splice(index, 1);
        return { ...c, waypoints: newWaypoints };
      })
    })),

    applyTheme: (themeId) => set((s) => {
      const theme = PREDEFINED_THEMES.find(t => t.id === themeId);
      if (!theme) return {};

      // Map through phases and assign colors in order
      const newPhases = s.phases.map((phase, index) => {
        const colorIndex = index % theme.colors.length;
        return {
          ...phase,
          backgroundColor: theme.colors[colorIndex],
          textColor: theme.phaseTextColor || phase.textColor,
        };
      });

      return {
        phases: newPhases,
        backgroundColor: theme.canvasBg,
        titleBar: {
          ...s.titleBar,
          backgroundColor: theme.titleBarBg,
          textColor: theme.titleBarText,
          titleFontFamily: theme.fonts.headingFont,
          subtitleFontFamily: theme.fonts.bodyFont,
        },
        layout: {
          ...s.layout,
          phaseTitleFontFamily: theme.fonts.headingFont,
          phaseSubtitleFontFamily: theme.fonts.bodyFont,
          cardTitleFontFamily: theme.fonts.headingFont,
          cardContentFontFamily: theme.fonts.bodyFont,
          stepLabelFontFamily: theme.fonts.bodyFont,
          // Apply font colors from theme
          phaseTitleColor: theme.phaseTextColor,
          phaseSubtitleColor: theme.phaseTextColor,
          cardTitleColor: theme.cardTitleColor,
          cardContentColor: theme.cardContentColor,
          cardSubtextColor: theme.cardSubtextColor,
        },
      };
    }),

    loadInfographic: (data) => {
      const sanitized = sanitizeInfographicData(data) as InfographicData;
      set({ ...sanitized });
    },
    resetToDefault: () => set({ ...createDefaultInfographic() }),
    getSnapshot: () => extractData(get()),
  })));
