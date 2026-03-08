import { useInfographicStore } from '../store/useInfographicStore';
import type { ToolResult } from './types';
import type { StepType, ConnectorHandlePosition, ConnectorType } from '../types';

/**
 * Executes a tool call by mapping it to the corresponding Zustand store action.
 * Returns a ToolResult with success/error info for the agentic loop.
 */
export function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  toolUseId: string,
): ToolResult {
  const store = useInfographicStore.getState();

  try {
    let result: Record<string, unknown> = { success: true };

    switch (toolName) {
      case 'update_title_bar': {
        const updates: Record<string, unknown> = {};
        for (const key of ['text', 'subtitle', 'backgroundColor', 'textColor', 'fontSize', 'subtitleFontSize', 'alignment', 'titleFontFamily', 'subtitleFontFamily']) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updateTitleBar(updates);
        break;
      }

      case 'add_phase': {
        const beforeIds = store.phases.map(p => p.id);
        store.addPhase();
        const afterPhases = useInfographicStore.getState().phases;
        const newPhase = afterPhases.find(p => !beforeIds.includes(p.id));

        // If additional properties are provided, update the phase in the same call
        if (newPhase && (toolInput.title || toolInput.subtitle || toolInput.backgroundColor || toolInput.textColor)) {
          const updates: Record<string, unknown> = {};
          for (const key of ['title', 'subtitle', 'backgroundColor', 'textColor']) {
            if (toolInput[key] !== undefined) updates[key] = toolInput[key];
          }
          useInfographicStore.getState().updatePhase(newPhase.id, updates);
        }

        result = { success: true, phaseId: newPhase?.id, message: `Phase created with ID ${newPhase?.id}` };
        break;
      }

      case 'remove_phase': {
        store.removePhase(toolInput.phaseId as string);
        break;
      }

      case 'update_phase': {
        const phaseId = toolInput.phaseId as string;
        const updates: Record<string, unknown> = {};
        for (const key of ['title', 'subtitle', 'backgroundColor', 'textColor']) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updatePhase(phaseId, updates);
        break;
      }

      case 'reorder_phases': {
        store.reorderPhases(toolInput.fromIndex as number, toolInput.toIndex as number);
        break;
      }

      case 'add_step': {
        const phaseId = toolInput.phaseId as string;
        const stepType = (toolInput.type as StepType) || 'standard';
        const phase = store.phases.find(p => p.id === phaseId);
        if (!phase) {
          return { tool_use_id: toolUseId, content: JSON.stringify({ error: `Phase ${phaseId} not found` }), is_error: true };
        }
        const beforeStepIds = phase.steps.map(s => s.id);
        store.addStep(phaseId, stepType);
        const afterPhase = useInfographicStore.getState().phases.find(p => p.id === phaseId);
        const newStep = afterPhase?.steps.find(s => !beforeStepIds.includes(s.id));

        // If additional properties are provided, update the step in the same call
        if (newStep && (toolInput.title || toolInput.description || toolInput.iconName || toolInput.customLabel || toolInput.roleIds || toolInput.data)) {
          const updates: Record<string, unknown> = {};
          for (const key of ['title', 'description', 'iconName', 'customLabel', 'roleIds', 'data']) {
            if (toolInput[key] !== undefined) updates[key] = toolInput[key];
          }
          useInfographicStore.getState().updateStep(phaseId, newStep.id, updates as any);
        }

        result = { success: true, stepId: newStep?.id, message: `Step created with ID ${newStep?.id}` };
        break;
      }

      case 'remove_step': {
        store.removeStep(toolInput.phaseId as string, toolInput.stepId as string);
        break;
      }

      case 'update_step': {
        const updates: Record<string, unknown> = {};
        for (const key of ['title', 'description', 'iconName', 'customLabel', 'data']) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updateStep(toolInput.phaseId as string, toolInput.stepId as string, updates as any);
        break;
      }

      case 'change_step_type': {
        store.changeStepType(
          toolInput.phaseId as string,
          toolInput.stepId as string,
          toolInput.newType as StepType,
        );
        break;
      }

      case 'reorder_steps': {
        store.reorderSteps(
          toolInput.fromPhaseId as string,
          toolInput.fromIndex as number,
          toolInput.toPhaseId as string,
          toolInput.toIndex as number,
        );
        break;
      }

      case 'add_role': {
        const beforeRoleIds = store.roles.map(r => r.id);
        store.addRole(toolInput.name as string, toolInput.color as string);
        const afterRoles = useInfographicStore.getState().roles;
        const newRole = afterRoles.find(r => !beforeRoleIds.includes(r.id));

        // If additional properties are provided, update the role in the same call
        if (newRole && (toolInput.textColor || toolInput.tag)) {
          const updates: Record<string, unknown> = {};
          for (const key of ['textColor', 'tag']) {
            if (toolInput[key] !== undefined) updates[key] = toolInput[key];
          }
          useInfographicStore.getState().updateRole(newRole.id, updates);
        }

        result = { success: true, roleId: newRole?.id, message: `Role created with ID ${newRole?.id}` };
        break;
      }

      case 'remove_role': {
        store.removeRole(toolInput.roleId as string);
        break;
      }

      case 'update_role': {
        const roleId = toolInput.roleId as string;
        const updates: Record<string, unknown> = {};
        for (const key of ['name', 'color', 'textColor']) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updateRole(roleId, updates);
        break;
      }

      case 'toggle_step_role': {
        store.toggleStepRole(
          toolInput.phaseId as string,
          toolInput.stepId as string,
          toolInput.roleId as string,
        );
        break;
      }

      case 'update_layout': {
        const updates: Record<string, unknown> = {};
        for (const key of [
          'direction', 'phaseGap', 'stepGap', 'padding', 'phaseMinWidth',
          'cornerRadius', 'phaseTintOpacity', 'cardTintOpacity', 'phaseTransitionSharpness',
          'cardBorderStyle', 'cardBorderWidth', 'cardShadow', 'showStepIcons',
          'phaseBackgroundPattern', 'cardTextColorMode', 'cardTextColor',
        ]) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updateLayout(updates as any);
        break;
      }

      case 'set_background_color': {
        store.setBackgroundColor(toolInput.color as string);
        break;
      }

      case 'add_connector': {
        store.addConnector(
          toolInput.sourceStepId as string,
          toolInput.sourceHandle as ConnectorHandlePosition,
          toolInput.targetStepId as string,
          toolInput.targetHandle as ConnectorHandlePosition,
          (toolInput.type as ConnectorType) || undefined,
        );
        // Find the new connector
        const connectors = useInfographicStore.getState().connectors;
        const newConn = connectors[connectors.length - 1];

        // If additional styling properties are provided, update the connector in the same call
        if (newConn && (toolInput.color || toolInput.label || toolInput.lineStyle || toolInput.sourceHead || toolInput.targetHead || toolInput.strokeWidth)) {
          const updates: Record<string, unknown> = {};
          for (const key of ['color', 'label', 'lineStyle', 'sourceHead', 'targetHead', 'strokeWidth']) {
            if (toolInput[key] !== undefined) updates[key] = toolInput[key];
          }
          useInfographicStore.getState().updateConnector(newConn.id, updates as any);
        }

        result = { success: true, connectorId: newConn?.id };
        break;
      }

      case 'remove_connector': {
        store.removeConnector(toolInput.connectorId as string);
        break;
      }

      case 'update_connector': {
        const connId = toolInput.connectorId as string;
        const updates: Record<string, unknown> = {};
        for (const key of ['color', 'lineStyle', 'sourceHead', 'targetHead', 'type', 'strokeWidth', 'label']) {
          if (toolInput[key] !== undefined) updates[key] = toolInput[key];
        }
        store.updateConnector(connId, updates as any);
        break;
      }

      case 'apply_theme': {
        store.applyTheme(toolInput.themeId as string);
        break;
      }

      case 'reset_to_default': {
        store.resetToDefault();
        result = { success: true, message: 'Workflow reset to default' };
        break;
      }

      default:
        return {
          tool_use_id: toolUseId,
          content: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
          is_error: true,
        };
    }

    return { tool_use_id: toolUseId, content: JSON.stringify(result), is_error: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { tool_use_id: toolUseId, content: JSON.stringify({ error: message }), is_error: true };
  }
}

/** Human-readable label for tool calls (used in the UI) */
export function getToolLabel(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'update_title_bar': return `Updated title bar${input.text ? `: "${input.text}"` : ''}`;
    case 'add_phase': return 'Added new phase';
    case 'remove_phase': return 'Removed phase';
    case 'update_phase': return `Updated phase${input.title ? `: "${input.title}"` : ''}`;
    case 'reorder_phases': return 'Reordered phases';
    case 'add_step': return `Added ${input.type || 'standard'} step`;
    case 'remove_step': return 'Removed step';
    case 'update_step': return `Updated step${input.title ? `: "${input.title}"` : ''}`;
    case 'change_step_type': return `Changed step type to ${input.newType}`;
    case 'reorder_steps': return 'Reordered steps';
    case 'add_role': return `Added role: "${input.name}"`;
    case 'remove_role': return 'Removed role';
    case 'update_role': return `Updated role${input.name ? `: "${input.name}"` : ''}`;
    case 'toggle_step_role': return 'Toggled step role';
    case 'update_layout': return 'Updated layout settings';
    case 'set_background_color': return `Set background: ${input.color}`;
    case 'add_connector': return 'Added connector';
    case 'remove_connector': return 'Removed connector';
    case 'update_connector': return 'Updated connector';
    case 'apply_theme': return `Applied theme: ${input.themeId}`;
    case 'reset_to_default': return 'Reset to default';
    default: return toolName;
  }
}
