import { z } from 'zod';

const stepTypes = ['standard', 'meeting', 'decision', 'parallel', 'checklist', 'handoff', 'milestone', 'document', 'estimation', 'collaboration', 'timeline', 'risk', 'metrics', 'kanban', 'okr', 'sprint', 'roadmap', 'executive'] as const;
const handlePositions = ['top', 'bottom', 'left', 'right'] as const;
const connectorTypes = ['straight', 'curved', 'step', 'loop'] as const;

export const toolInputSchemas = {
  update_title_bar: z.object({
    text: z.string().optional(),
    subtitle: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    fontSize: z.number().optional(),
    subtitleFontSize: z.number().optional(),
    alignment: z.enum(['left', 'center', 'right']).optional(),
    titleFontFamily: z.string().optional(),
    subtitleFontFamily: z.string().optional(),
  }),

  add_phase: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }),

  remove_phase: z.object({
    phaseId: z.string(),
  }),

  update_phase: z.object({
    phaseId: z.string(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }),

  reorder_phases: z.object({
    fromIndex: z.number().int().min(0),
    toIndex: z.number().int().min(0),
  }),

  add_step: z.object({
    phaseId: z.string(),
    type: z.enum(stepTypes).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    iconName: z.string().optional(),
    customLabel: z.string().optional(),
    roleIds: z.array(z.string()).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),

  remove_step: z.object({
    phaseId: z.string(),
    stepId: z.string(),
  }),

  update_step: z.object({
    phaseId: z.string(),
    stepId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    iconName: z.string().optional(),
    customLabel: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),

  change_step_type: z.object({
    phaseId: z.string(),
    stepId: z.string(),
    newType: z.enum(stepTypes),
  }),

  reorder_steps: z.object({
    fromPhaseId: z.string(),
    fromIndex: z.number().int().min(0),
    toPhaseId: z.string(),
    toIndex: z.number().int().min(0),
  }),

  add_role: z.object({
    name: z.string(),
    color: z.string(),
    textColor: z.string().optional(),
    tag: z.string().optional(),
  }),

  remove_role: z.object({
    roleId: z.string(),
  }),

  update_role: z.object({
    roleId: z.string(),
    name: z.string().optional(),
    color: z.string().optional(),
    textColor: z.string().optional(),
  }),

  toggle_step_role: z.object({
    phaseId: z.string(),
    stepId: z.string(),
    roleId: z.string(),
  }),

  update_layout: z.object({
    direction: z.enum(['horizontal', 'vertical']).optional(),
    phaseGap: z.number().optional(),
    stepGap: z.number().optional(),
    padding: z.number().optional(),
    phaseMinWidth: z.number().optional(),
    cornerRadius: z.number().optional(),
    phaseTintOpacity: z.number().optional(),
    cardTintOpacity: z.number().optional(),
    phaseTransitionSharpness: z.number().optional(),
    cardBorderStyle: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
    cardBorderWidth: z.number().optional(),
    cardShadow: z.enum(['none', 'soft', 'medium', 'hard', 'neon']).optional(),
    showStepIcons: z.boolean().optional(),
    phaseBackgroundPattern: z.enum(['none', 'dots', 'grid', 'diagonal']).optional(),
    cardTextColorMode: z.enum(['default', 'high-contrast', 'custom']).optional(),
    cardTextColor: z.string().optional(),
  }),

  set_background_color: z.object({
    color: z.string(),
  }),

  add_connector: z.object({
    sourceStepId: z.string(),
    sourceHandle: z.enum(handlePositions),
    targetStepId: z.string(),
    targetHandle: z.enum(handlePositions),
    type: z.enum(connectorTypes).optional(),
    color: z.string().optional(),
    label: z.string().optional(),
    lineStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
    sourceHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']).optional(),
    targetHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']).optional(),
    strokeWidth: z.number().optional(),
  }),

  remove_connector: z.object({
    connectorId: z.string(),
  }),

  update_connector: z.object({
    connectorId: z.string(),
    color: z.string().optional(),
    lineStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
    sourceHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']).optional(),
    targetHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']).optional(),
    type: z.enum(connectorTypes).optional(),
    strokeWidth: z.number().optional(),
    label: z.string().optional(),
  }),

  apply_theme: z.object({
    themeId: z.string(),
  }),

  reset_to_default: z.object({}),

  web_search: z.object({
    query: z.string().min(1),
    maxResults: z.number().int().min(1).max(15).optional(),
  }),

  fetch_url_content: z.object({
    url: z.string().url(),
  }),

  fetch_integration_data: z.object({
    provider: z.enum(['jira', 'github']),
    dataType: z.enum(['sprint', 'issues', 'releases', 'workflow_runs', 'all']).optional(),
  }),
} as const;

export type ToolName = keyof typeof toolInputSchemas;

/**
 * Validate tool input against its schema. Returns parsed data or an error string.
 */
export function validateToolInput(toolName: string, input: Record<string, unknown>): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
  const schema = toolInputSchemas[toolName as ToolName];
  if (!schema) {
    return { success: false, error: `Unknown tool: ${toolName}` };
  }
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }
  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
  return { success: false, error: `Invalid input: ${issues}` };
}
