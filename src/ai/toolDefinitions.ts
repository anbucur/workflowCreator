import type { InfographicData } from '../types';

// Tool definition type matching Anthropic API format
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const STEP_TYPES_ENUM = [
  'standard', 'meeting', 'decision', 'parallel', 'checklist',
  'handoff', 'milestone', 'document', 'estimation', 'collaboration',
  'timeline', 'risk', 'metrics',
  'kanban', 'okr', 'sprint', 'roadmap', 'executive',
];

const THEME_IDS_ENUM = [
  'ocean-depth', 'sunset-glow', 'forest-canopy', 'corporate-clean',
  'monochrome-slate', 'midnight-neon', 'warm-earth', 'berry-blast',
];

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'update_title_bar',
    description: 'Update the workflow title bar properties.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Main title text' },
        subtitle: { type: 'string', description: 'Subtitle text' },
        backgroundColor: { type: 'string', description: 'Background color (hex, e.g. #1e293b)' },
        textColor: { type: 'string', description: 'Text color (hex)' },
        fontSize: { type: 'number', description: 'Title font size in px' },
        subtitleFontSize: { type: 'number', description: 'Subtitle font size in px' },
        alignment: { type: 'string', enum: ['left', 'center', 'right'] },
        titleFontFamily: { type: 'string', description: 'CSS font family for title' },
        subtitleFontFamily: { type: 'string', description: 'CSS font family for subtitle' },
      },
    },
  },
  {
    name: 'add_phase',
    description: 'Add a new phase to the workflow with all its properties in one call. Returns the new phase ID. Prefer this over add + update for efficiency.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Phase title (e.g. "Discovery", "Development")' },
        subtitle: { type: 'string', description: 'Phase subtitle/description' },
        backgroundColor: { type: 'string', description: 'Phase background color (hex, e.g. "#3b82f6")' },
        textColor: { type: 'string', description: 'Phase text color (hex)' },
      },
    },
  },
  {
    name: 'remove_phase',
    description: 'Remove a phase and all its steps.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string', description: 'Phase ID to remove' },
      },
      required: ['phaseId'],
    },
  },
  {
    name: 'update_phase',
    description: 'Update phase title, subtitle, or colors.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        backgroundColor: { type: 'string', description: 'Hex color' },
        textColor: { type: 'string', description: 'Hex color' },
      },
      required: ['phaseId'],
    },
  },
  {
    name: 'reorder_phases',
    description: 'Move a phase from one position to another (0-based indices).',
    input_schema: {
      type: 'object',
      properties: {
        fromIndex: { type: 'number' },
        toIndex: { type: 'number' },
      },
      required: ['fromIndex', 'toIndex'],
    },
  },
  {
    name: 'add_step',
    description: 'Add a new step to a phase with all its properties in one call. Returns the new step ID. Prefer this over add + update for efficiency.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string', description: 'Phase ID to add the step to' },
        type: { type: 'string', enum: STEP_TYPES_ENUM, description: 'Step type (defaults to standard)' },
        title: { type: 'string', description: 'Step title' },
        description: { type: 'string', description: 'Step description' },
        iconName: { type: 'string', description: 'Lucide icon name in kebab-case (e.g. "check-circle", "users", "zap")' },
        customLabel: { type: 'string', description: 'Custom badge label text' },
        roleIds: { type: 'array', items: { type: 'string' }, description: 'Array of role IDs to assign to this step' },
        data: { type: 'object', description: 'Type-specific data object. Shape depends on step type.' },
      },
      required: ['phaseId'],
    },
  },
  {
    name: 'remove_step',
    description: 'Remove a step from a phase. Also removes any connectors to/from this step.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string' },
        stepId: { type: 'string' },
      },
      required: ['phaseId', 'stepId'],
    },
  },
  {
    name: 'update_step',
    description: 'Update a step\'s title, description, icon, or type-specific data. For type-specific data, pass a "data" object matching the step type schema.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string' },
        stepId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        iconName: { type: 'string', description: 'Lucide icon name in kebab-case (e.g. "check-circle", "users", "zap")' },
        customLabel: { type: 'string', description: 'Custom badge label text' },
        data: { type: 'object', description: 'Type-specific data object. Shape depends on step type.' },
      },
      required: ['phaseId', 'stepId'],
    },
  },
  {
    name: 'change_step_type',
    description: 'Change a step to a different type. Preserves title, description, and roles but resets type-specific data.',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string' },
        stepId: { type: 'string' },
        newType: { type: 'string', enum: STEP_TYPES_ENUM },
      },
      required: ['phaseId', 'stepId', 'newType'],
    },
  },
  {
    name: 'reorder_steps',
    description: 'Move a step from one position/phase to another (0-based indices).',
    input_schema: {
      type: 'object',
      properties: {
        fromPhaseId: { type: 'string' },
        fromIndex: { type: 'number' },
        toPhaseId: { type: 'string' },
        toIndex: { type: 'number' },
      },
      required: ['fromPhaseId', 'fromIndex', 'toPhaseId', 'toIndex'],
    },
  },
  {
    name: 'add_role',
    description: 'Add a new role (team member/actor) with all properties in one call. Returns the new role ID.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Role name (e.g. "Developer", "QA Lead")' },
        color: { type: 'string', description: 'Badge background color (hex)' },
        textColor: { type: 'string', description: 'Badge text color (hex)' },
        tag: { type: 'string', description: 'Short abbreviation for the role (e.g. "DEV", "QA")' },
      },
      required: ['name', 'color'],
    },
  },
  {
    name: 'remove_role',
    description: 'Remove a role. Also unassigns it from all steps.',
    input_schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string' },
      },
      required: ['roleId'],
    },
  },
  {
    name: 'update_role',
    description: 'Update a role\'s name, color, or text color.',
    input_schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        textColor: { type: 'string' },
      },
      required: ['roleId'],
    },
  },
  {
    name: 'toggle_step_role',
    description: 'Assign or unassign a role to/from a step (toggles).',
    input_schema: {
      type: 'object',
      properties: {
        phaseId: { type: 'string' },
        stepId: { type: 'string' },
        roleId: { type: 'string' },
      },
      required: ['phaseId', 'stepId', 'roleId'],
    },
  },
  {
    name: 'update_layout',
    description: 'Update layout and styling properties for the entire workflow.',
    input_schema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['horizontal', 'vertical'] },
        phaseGap: { type: 'number' },
        stepGap: { type: 'number' },
        padding: { type: 'number' },
        phaseMinWidth: { type: 'number' },
        cornerRadius: { type: 'number' },
        phaseTintOpacity: { type: 'number', description: '0-100' },
        cardTintOpacity: { type: 'number', description: '0-100' },
        phaseTransitionSharpness: { type: 'number', description: '0-100' },
        cardBorderStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'none'] },
        cardBorderWidth: { type: 'number' },
        cardShadow: { type: 'string', enum: ['none', 'soft', 'medium', 'hard', 'neon'] },
        showStepIcons: { type: 'boolean' },
        phaseBackgroundPattern: { type: 'string', enum: ['none', 'dots', 'grid', 'diagonal'] },
        cardTextColorMode: { type: 'string', enum: ['default', 'high-contrast', 'custom'] },
        cardTextColor: { type: 'string', description: 'Custom card text color (hex)' },
      },
    },
  },
  {
    name: 'set_background_color',
    description: 'Set the canvas background color.',
    input_schema: {
      type: 'object',
      properties: {
        color: { type: 'string', description: 'Hex color' },
      },
      required: ['color'],
    },
  },
  {
    name: 'add_connector',
    description: 'Add a visual connector (arrow/line) between two steps with all styling properties in one call. Returns the new connector ID. IMPORTANT: Choose handles based on relative positions - source goes TO target, so the arrow points from source toward target. For horizontal workflows (phases left-to-right): if source phase index < target phase index, use sourceHandle="right" and targetHandle="left". If same phase but source step index < target step index, use sourceHandle="bottom" and targetHandle="top". Reverse these if going backwards.',
    input_schema: {
      type: 'object',
      properties: {
        sourceStepId: { type: 'string', description: 'The step where the connector starts' },
        sourceHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the source card to connect from' },
        targetStepId: { type: 'string', description: 'The step where the connector ends (arrow points here)' },
        targetHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the target card to connect to' },
        type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'], description: 'Connector path type (defaults to step)' },
        color: { type: 'string', description: 'Connector color (hex)' },
        label: { type: 'string', description: 'Text label to display on the connector' },
        lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'], description: 'Line style (defaults to solid)' },
        sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'], description: 'Arrow head at source end (defaults to none)' },
        targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'], description: 'Arrow head at target end (defaults to arrow)' },
        strokeWidth: { type: 'number', description: 'Line width in pixels' },
      },
      required: ['sourceStepId', 'sourceHandle', 'targetStepId', 'targetHandle'],
    },
  },
  {
    name: 'remove_connector',
    description: 'Remove a connector.',
    input_schema: {
      type: 'object',
      properties: {
        connectorId: { type: 'string' },
      },
      required: ['connectorId'],
    },
  },
  {
    name: 'update_connector',
    description: 'Update connector properties.',
    input_schema: {
      type: 'object',
      properties: {
        connectorId: { type: 'string' },
        color: { type: 'string' },
        lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'] },
        sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] },
        targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] },
        type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] },
        strokeWidth: { type: 'number' },
        label: { type: 'string' },
      },
      required: ['connectorId'],
    },
  },
  {
    name: 'apply_theme',
    description: 'Apply a predefined color theme to the entire workflow.',
    input_schema: {
      type: 'object',
      properties: {
        themeId: { type: 'string', enum: THEME_IDS_ENUM },
      },
      required: ['themeId'],
    },
  },
  {
    name: 'reset_to_default',
    description: 'Reset the entire workflow to an empty default state. Use with caution — this deletes everything.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'fetch_integration_data',
    description: 'Fetch live data from connected integrations (Jira, GitHub). Returns sprint info, issues, releases, workflow runs, etc. Use this to populate steps with real project data.',
    input_schema: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['jira', 'github'], description: 'Which integration to fetch from' },
        dataType: { type: 'string', enum: ['sprint', 'issues', 'releases', 'workflow_runs', 'all'], description: 'Type of data to fetch. Defaults to all.' },
      },
      required: ['provider'],
    },
  },
];

export const WEB_SEARCH_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'web_search',
    description: 'Search the web for information. Returns a list of results with titles, URLs, and snippets. Use this to research topics, find current data, or answer questions requiring up-to-date information.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Max results (default: 8, max: 15)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_url_content',
    description: 'Fetch and extract text content from a web page URL. Use after web_search to read detailed content from a specific result.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch (must be http/https)' },
      },
      required: ['url'],
    },
  },
];

export function buildSystemPrompt(snapshot: InfographicData): string {
  return `You are PhaseCraft AI, an assistant that helps users build and edit workflow infographics. You can create phases, add steps, apply themes, manage roles, add connectors, and customize every aspect of the workflow.

CAPABILITIES:
- Create, update, and delete phases (workflow stages/columns)
- Add, update, and delete steps within phases (18 specialized types including enterprise boards)
- Manage roles (people/teams) and assign them to steps
- Apply visual themes (8 predefined themes)
- Customize layout properties (gaps, fonts, shadows, patterns, colors)
- Add connectors (visual arrows/lines) between steps
- Set canvas and title bar properties
- Analyze uploaded documents (TXT, MD, CSV) and Confluence pages to create workflows from their content
- Answer questions about attached documents
- Extract processes, checklists, and data from documents to populate workflow steps
- Fetch live data from connected integrations (Jira, GitHub) to populate dashboards

RULES:
1. When creating content, use realistic, professional names and descriptions relevant to the user's domain.
2. **EFFICIENCY: Use add_step with all parameters (title, description, iconName, data) in a single call instead of add_step + update_step.** Only use update_step when modifying an existing step.
3. When adding phases and steps: first add the phase, note its returned ID, then add fully-populated steps to it using add_step with all properties.
4. When the user asks for a "workflow" or "process", think about the logical phases and steps needed.
5. Always reference existing IDs from the current state when updating or removing elements.
6. When applying colors, use hex color codes that complement the current theme.
7. You can execute multiple tool calls in a single response for batch changes.
8. After making changes, briefly describe what you did.

RESPONSE FORMAT:
- Keep confirmations to 1-3 short sentences max.
- Use markdown formatting: **bold** for emphasis, \`code\` for IDs and values.
- When listing what you created, use a compact bulleted list — not numbered paragraphs.
- Never repeat the user's request back to them verbatim.
- Never include raw JSON in your text responses.
- After executing tools, summarize the result concisely, e.g.: "Done! Created **4 phases** with **12 steps** and applied the **ocean-depth** theme."
- When listing available options (themes, step types, etc.), use a comma-separated inline list, not a bulleted list with descriptions.
- Use headings (##, ###) to organize longer responses when explaining multiple options or capabilities.

AVAILABLE THEMES: ocean-depth, sunset-glow, forest-canopy, corporate-clean, monochrome-slate, midnight-neon, warm-earth, berry-blast

STEP TYPES AND THEIR DATA SCHEMAS:
- standard: No extra data field
- meeting: { agendaItems: string[], facilitator?: string, duration?: string, hasDecision?: boolean }
- decision: { criteria: string[], outcome?: 'pending' | 'approved' | 'rejected' }
- parallel: { tracks: [{ id: string, label: string, description: string, roleIds: string[], items: string[] }] }
- checklist: { items: [{ id: string, text: string, checked: boolean }] }
- handoff: { fromTeam: string, toTeam: string, artifacts: string[] }
- milestone: { status: 'none'|'not-started'|'in-progress'|'completed', targetDate?: string, deliverables: string[] }
- document: { documents: [{ id: string, name: string, docType: string }] }
- estimation: { method: 'tshirt'|'points'|'hours', value?: string, breakdown?: [{ label: string, value: string }] }
- collaboration: { participants: [{ roleId: string, action: string }], iterative: boolean, finalActionTitle?: string, finalItems?: string[] }
- timeline: { entries: [{ id: string, label: string, startDate: string, endDate: string, color: string }] }
- risk: { severity: 'low'|'medium'|'high'|'critical', risks: [{ id: string, text: string, mitigation?: string }] }
- metrics: { metrics: [{ id: string, label: string, value: number, target?: number, unit: string, format: 'number'|'progress'|'badge' }] }
- kanban: { columns: [{ id, title, color, cards: [{ id, title, assignee?, labels: string[], priority: 'low'|'medium'|'high'|'critical' }] }], liveSource?: 'github'|'jira'|'none' }
- okr: { objectives: [{ id, title, owner?, quarter?, keyResults: [{ id, text, current: number, target: number, unit }] }] }
- sprint: { sprintName, startDate, endDate, velocityTarget: number, stories: [{ id, title, points: number, status: 'todo'|'in_progress'|'in_review'|'done', assignee?, labels: string[] }], liveSource?: 'jira'|'github'|'none' }
- roadmap: { quarters: string[], items: [{ id, title, quarter, status: 'planned'|'in_progress'|'completed'|'cancelled', type: 'feature'|'epic'|'initiative'|'release'|'milestone', team?, description?, progress?: number }] }
- executive: { kpis: [{ id, label, value: string, change?: string, changeType: 'positive'|'negative'|'neutral', trend: 'up'|'down'|'flat', icon?, color? }], summary?: string, deploymentVersion?, deploymentStatus?: 'healthy'|'degraded'|'down'|'unknown' }

Note: When creating items with "id" fields inside data objects (checklist items, tracks, documents, timeline entries, risk items, metrics, kanban cards/columns, OKR objectives/key results, sprint stories, roadmap items, executive KPIs), use short random strings for IDs (e.g. "a1b2c3").

CURRENT WORKFLOW STATE:
${JSON.stringify(snapshot, null, 2)}

Use the tools provided to make changes. Explain what you're doing briefly. If the user's request is ambiguous, ask for clarification.`;
}
