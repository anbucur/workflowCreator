/**
 * Browser-side AI client for GitHub Pages deployment.
 *
 * When the app is deployed as a static site (e.g. GitHub Pages) there is no
 * Express backend available. If the VITE_* API-key environment variables are
 * set at build time (via GitHub Actions secrets), this module calls the AI
 * providers directly from the browser instead of going through the backend.
 *
 * Use `hasBrowserApiKey(model)` to check whether a direct call is possible,
 * and `callAIDirectly(params)` to stream the response.
 */

import type { SSEEvent, DocumentContext } from './types';

// ─── Tool & Theme Constants ───────────────────────────────────────────────────

const STEP_TYPES = [
  'standard', 'meeting', 'decision', 'parallel', 'checklist', 'handoff',
  'milestone', 'document', 'estimation', 'collaboration', 'timeline', 'risk',
  'metrics', 'kanban', 'okr', 'sprint', 'roadmap', 'executive',
];

const THEME_IDS = [
  'ocean-depth', 'sunset-glow', 'forest-canopy', 'corporate-clean',
  'monochrome-slate', 'midnight-neon', 'warm-earth', 'berry-blast',
];

const AI_TOOL_DEFINITIONS = [
  { name: 'update_title_bar', description: 'Update the workflow title bar properties.', input_schema: { type: 'object' as const, properties: { text: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string', description: 'Hex color' }, textColor: { type: 'string', description: 'Hex color' }, fontSize: { type: 'number' }, subtitleFontSize: { type: 'number' }, alignment: { type: 'string', enum: ['left', 'center', 'right'] }, titleFontFamily: { type: 'string' }, subtitleFontFamily: { type: 'string' } } } },
  { name: 'add_phase', description: 'Add a new empty phase. Returns the new phase ID.', input_schema: { type: 'object' as const, properties: {} } },
  { name: 'remove_phase', description: 'Remove a phase and all its steps.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'update_phase', description: 'Update phase title, subtitle, or colors.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, title: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string' }, textColor: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'reorder_phases', description: 'Move a phase from one position to another (0-based).', input_schema: { type: 'object' as const, properties: { fromIndex: { type: 'number' }, toIndex: { type: 'number' } }, required: ['fromIndex', 'toIndex'] } },
  { name: 'add_step', description: 'Add a new step to a phase with ALL properties in ONE call. Returns the new step ID. IMPORTANT: Always include title, description, iconName, and data (if applicable) in this single call - NEVER follow with update_step.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, type: { type: 'string', enum: STEP_TYPES, description: 'Defaults to standard' }, title: { type: 'string', description: 'Step title' }, description: { type: 'string', description: 'Step description' }, iconName: { type: 'string', description: 'Lucide icon name in kebab-case (e.g. "check-circle", "users", "zap")' }, customLabel: { type: 'string', description: 'Custom badge label' }, data: { type: 'object', description: 'Type-specific data object' } }, required: ['phaseId'] } },
  { name: 'remove_step', description: 'Remove a step from a phase.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, stepId: { type: 'string' } }, required: ['phaseId', 'stepId'] } },
  { name: 'update_step', description: 'Update step title, description, icon, or type-specific data.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, iconName: { type: 'string', description: 'Lucide icon name in kebab-case' }, customLabel: { type: 'string' }, data: { type: 'object', description: 'Type-specific data object' } }, required: ['phaseId', 'stepId'] } },
  { name: 'change_step_type', description: 'Change a step to a different type. Resets type-specific data.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, newType: { type: 'string', enum: STEP_TYPES } }, required: ['phaseId', 'stepId', 'newType'] } },
  { name: 'reorder_steps', description: 'Move a step between positions/phases (0-based).', input_schema: { type: 'object' as const, properties: { fromPhaseId: { type: 'string' }, fromIndex: { type: 'number' }, toPhaseId: { type: 'string' }, toIndex: { type: 'number' } }, required: ['fromPhaseId', 'fromIndex', 'toPhaseId', 'toIndex'] } },
  { name: 'add_role', description: 'Add a new role. Returns the new role ID.', input_schema: { type: 'object' as const, properties: { name: { type: 'string' }, color: { type: 'string', description: 'Hex color' } }, required: ['name', 'color'] } },
  { name: 'remove_role', description: 'Remove a role and unassign from all steps.', input_schema: { type: 'object' as const, properties: { roleId: { type: 'string' } }, required: ['roleId'] } },
  { name: 'update_role', description: 'Update a role name, color, or text color.', input_schema: { type: 'object' as const, properties: { roleId: { type: 'string' }, name: { type: 'string' }, color: { type: 'string' }, textColor: { type: 'string' } }, required: ['roleId'] } },
  { name: 'toggle_step_role', description: 'Assign or unassign a role to/from a step.', input_schema: { type: 'object' as const, properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, roleId: { type: 'string' } }, required: ['phaseId', 'stepId', 'roleId'] } },
  { name: 'update_layout', description: 'Update layout/styling properties.', input_schema: { type: 'object' as const, properties: { direction: { type: 'string', enum: ['horizontal', 'vertical'] }, phaseGap: { type: 'number' }, stepGap: { type: 'number' }, padding: { type: 'number' }, phaseMinWidth: { type: 'number' }, cornerRadius: { type: 'number' }, phaseTintOpacity: { type: 'number' }, cardTintOpacity: { type: 'number' }, phaseTransitionSharpness: { type: 'number' }, cardBorderStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'none'] }, cardBorderWidth: { type: 'number' }, cardShadow: { type: 'string', enum: ['none', 'soft', 'medium', 'hard', 'neon'] }, showStepIcons: { type: 'boolean' }, phaseBackgroundPattern: { type: 'string', enum: ['none', 'dots', 'grid', 'diagonal'] }, cardTextColorMode: { type: 'string', enum: ['default', 'high-contrast', 'custom'] }, cardTextColor: { type: 'string' } } } },
  { name: 'set_background_color', description: 'Set the canvas background color.', input_schema: { type: 'object' as const, properties: { color: { type: 'string' } }, required: ['color'] } },
  { name: 'add_connector', description: 'Add a visual connector (arrow/line) between two steps.', input_schema: { type: 'object' as const, properties: { sourceStepId: { type: 'string', description: 'The step where the connector starts' }, sourceHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the source card to connect from' }, targetStepId: { type: 'string', description: 'The step where the connector ends (arrow points here)' }, targetHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the target card to connect to' }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'], description: 'Defaults to step' } }, required: ['sourceStepId', 'sourceHandle', 'targetStepId', 'targetHandle'] } },
  { name: 'remove_connector', description: 'Remove a connector.', input_schema: { type: 'object' as const, properties: { connectorId: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'update_connector', description: 'Update connector properties.', input_schema: { type: 'object' as const, properties: { connectorId: { type: 'string' }, color: { type: 'string' }, lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'] }, sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] }, strokeWidth: { type: 'number' }, label: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'apply_theme', description: 'Apply a predefined theme.', input_schema: { type: 'object' as const, properties: { themeId: { type: 'string', enum: THEME_IDS } }, required: ['themeId'] } },
  { name: 'reset_to_default', description: 'Reset the workflow to empty default state.', input_schema: { type: 'object' as const, properties: {} } },
  { name: 'fetch_integration_data', description: 'Fetch live data from connected integrations (Jira, GitHub).', input_schema: { type: 'object' as const, properties: { provider: { type: 'string', enum: ['jira', 'github'] }, dataType: { type: 'string', enum: ['sprint', 'issues', 'releases', 'workflow_runs', 'all'] } }, required: ['provider'] } },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntegrationStatus {
  jira?: { connected: boolean; projectKey?: string };
  github?: { connected: boolean; owner?: string; repo?: string };
  confluence?: { connected: boolean; spaceKey?: string };
}

// Wide message type — compatible with both useAiChatStore's local ApiMessage
// and the stricter variant in src/ai/types.ts.
type AiMessage = {
  role: 'user' | 'assistant';
  content: string | Record<string, unknown>[];
};

export interface BrowserAiParams {
  messages: AiMessage[];
  snapshot: unknown;
  model: string;
  documentContext?: DocumentContext | null;
  integrations?: Record<string, unknown> | undefined;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(
  snapshot: unknown,
  documentContext?: DocumentContext | null,
  integrations?: IntegrationStatus,
  webSearchEnabled?: boolean,
): string {
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  let prompt = `You are an AI assistant built directly into PhaseCraft, a workflow infographic editor.

CURRENT DATE AND TIME:
Today is ${currentDate}. The current time is ${currentTime}.
Your job is to help the user build, modify, and style their workflow infographic.

CRITICAL INSTRUCTIONS:
1. When replying to the user, be VERY CONCISE and friendly.
2. DO NOT output long paragraphs. Just clearly state what you did or what you can do.
3. You have access to the current state of the infographic.
4. If a user asks to change colors, themes, layout, or content, use the tools.
5. If the request is complex, break it down into multiple tool calls (which you can do in parallel in one turn).
6. Provide helpful suggestions if the user is stuck (e.g., "Would you like me to make these steps parallel?").

RESPONSE FORMAT:
- Keep confirmations to 1-3 short sentences max.
- Use markdown formatting: **bold** for emphasis, \`code\` for IDs and values.
- When listing what you created, use a compact bulleted list — not numbered paragraphs.
- Never repeat the user's request back to them verbatim.
- Never include raw JSON in your text responses.
- After executing tools, summarize the result concisely, e.g.: "Done! Created **4 phases** with **12 steps** and applied the **ocean-depth** theme."
- When listing available options (themes, step types, etc.), use a comma-separated inline list, not a bulleted list with descriptions.
- Use headings (##, ###) to organize longer responses when explaining multiple options or capabilities.

CAPABILITIES:
- Create, update, and delete phases (workflow stages/columns)
- Add, update, and delete steps within phases (18 specialized types including enterprise boards)
- Manage roles (people/teams) and assign them to steps
- Apply visual themes (8 predefined themes)
- Customize layout properties (gaps, fonts, shadows, patterns, colors)
- Add connectors (visual arrows/lines) between steps
- Set canvas and title bar properties
- Create enterprise boards: Kanban, OKR trackers, Sprint boards, Product Roadmaps, Executive Dashboards
- Analyze uploaded documents (TXT, MD, CSV) and Confluence pages to create workflows from their content
- Answer questions about attached documents
- Extract processes, checklists, and data from documents to populate workflow steps
- Fetch live data from connected integrations (Jira, GitHub) to populate dashboards

RULES:
1. Use realistic, professional names and descriptions relevant to the user's domain.
2. **EFFICIENCY: ALWAYS use add_step with ALL parameters (title, description, iconName, data) in a SINGLE call. NEVER use add_step followed by update_step - this is inefficient and creates extra API calls.**
3. When adding phases and steps: first add the phase, note its returned ID, then add FULLY-POPULATED steps using add_step with all properties set.
4. Always reference existing IDs from the current state when updating or removing elements.
5. Use hex color codes that complement the current theme.
6. You can execute multiple tool calls in a single response for batch changes.
7. After making changes, briefly describe what you did.
8. **CONNECTOR HANDLES**: When adding connectors, choose handles based on the relative positions of the cards:
   - For horizontal workflows (phases go left-to-right):
     - If connecting from a step in an earlier phase to a step in a later phase: sourceHandle="right", targetHandle="left"
     - If connecting from a step in a later phase to a step in an earlier phase (backward): sourceHandle="left", targetHandle="right"
   - For steps in the SAME phase (stacked vertically):
     - If source step is above target step: sourceHandle="bottom", targetHandle="top"
     - If source step is below target step: sourceHandle="top", targetHandle="bottom"
   - The arrow always points FROM source TO target, so the source handle faces toward the target and the target handle faces toward the source.

SMART GENERATION GUIDELINES:
When creating comprehensive workflows or dashboards:
- For project management: include phases for planning, execution, review, and retrospective
- For executive dashboards: always include KPIs, deployment status, and a roadmap
- For sprint workflows: include backlog, sprint planning, daily standup, review, and retro
- For data analysis: interpret CSV columns as metrics and create appropriate KPI dashboards
- For Confluence pages: extract processes, decisions, and action items into workflow steps
- Match step types to content: use metrics for numbers, kanban for task lists, timeline for dates, checklist for action items, risk for concerns
- Always add appropriate roles based on the domain
- Always add connectors between sequential steps across phases

AVAILABLE THEMES: ocean-depth, sunset-glow, forest-canopy, corporate-clean, monochrome-slate, midnight-neon, warm-earth, berry-blast

STEP TYPES AND DATA SCHEMAS:
- standard: No extra data
- meeting: { agendaItems: string[], facilitator?: string, duration?: string, hasDecision?: boolean }
- decision: { criteria: string[], outcome?: 'pending' | 'approved' | 'rejected' }
- parallel: { tracks: [{ id, label, description, roleIds: string[], items: string[] }] }
- checklist: { items: [{ id, text, checked: boolean }] }
- handoff: { fromTeam, toTeam, artifacts: string[] }
- milestone: { status: 'none'|'not-started'|'in-progress'|'completed', targetDate?, deliverables: string[] }
- document: { documents: [{ id, name, docType }] }
- estimation: { method: 'tshirt'|'points'|'hours', value?, breakdown?: [{ label, value }] }
- collaboration: { participants: [{ roleId, action }], iterative: boolean, finalActionTitle?, finalItems?: string[] }
- timeline: { entries: [{ id, label, startDate, endDate, color }] }
- risk: { severity: 'low'|'medium'|'high'|'critical', risks: [{ id, text, mitigation? }] }
- metrics: { metrics: [{ id, label, value: number, target?: number, unit, format: 'number'|'progress'|'badge' }] }
- kanban: { columns: [{ id, title, color, cards: [{ id, title, assignee?, labels: string[], priority: 'low'|'medium'|'high'|'critical' }] }], liveSource?: 'github'|'jira'|'none' }
- okr: { objectives: [{ id, title, owner?, quarter?, keyResults: [{ id, text, current: number, target: number, unit }] }] }
- sprint: { sprintName, startDate, endDate, velocityTarget: number, stories: [{ id, title, points: number, status: 'todo'|'in_progress'|'in_review'|'done', assignee?, labels: string[] }] }
- roadmap: { quarters: string[], items: [{ id, title, quarter, status: 'planned'|'in_progress'|'completed'|'cancelled', type: 'feature'|'epic'|'initiative'|'release'|'milestone', team?, progress?: number }] }
- executive: { kpis: [{ id, label, value: string, change?: string, changeType: 'positive'|'negative'|'neutral', trend: 'up'|'down'|'flat', icon?, color? }], summary?, deploymentVersion?, deploymentStatus?: 'healthy'|'degraded'|'down'|'unknown' }

Note: Use short random strings for IDs inside data objects (e.g. "a1b2c3").`;

  if (documentContext?.content) {
    const maxDocChars = 50000;
    const truncatedContent = documentContext.content.length > maxDocChars
      ? documentContext.content.substring(0, maxDocChars) + '\n\n[...document truncated...]'
      : documentContext.content;

    prompt += `

ATTACHED DOCUMENT: "${documentContext.fileName}" (${documentContext.fileType}, ${documentContext.charCount} characters, source: ${documentContext.source})
${'─'.repeat(60)}
${truncatedContent}
${'─'.repeat(60)}

You can reference this document to:
- Analyze its content and extract key information
- Create workflows, dashboards, or infographics based on its data
- Answer questions about what's in the document
- Generate step-by-step processes from the document's instructions

For CSV data, interpret columns and rows to create appropriate visualizations (kanban boards, metrics dashboards, roadmaps, etc.).`;
  }

  if (integrations) {
    const parts: string[] = [];
    if (integrations.jira) {
      const j = integrations.jira as IntegrationStatus['jira'];
      parts.push(`- Jira: ${j?.connected ? `Connected (project: ${j.projectKey})` : 'Not connected'}`);
    }
    if (integrations.github) {
      const g = integrations.github as IntegrationStatus['github'];
      parts.push(`- GitHub: ${g?.connected ? `Connected (repo: ${g.owner}/${g.repo})` : 'Not connected'}`);
    }
    if (integrations.confluence) {
      const c = integrations.confluence as IntegrationStatus['confluence'];
      parts.push(`- Confluence: ${c?.connected ? `Connected (space: ${c.spaceKey})` : 'Not connected'}`);
    }
    if (parts.length > 0) {
      prompt += `

CONNECTED INTEGRATIONS:
${parts.join('\n')}

When integrations are connected, you can use the fetch_integration_data tool to pull live data and populate steps with real project information.`;
    }
  }

  if (webSearchEnabled) {
    prompt += `

WEB SEARCH:
You have web search enabled. You can use:
- **web_search**: Search the internet for information. Use this to research topics, find current data, or gather information to create better workflows.
- **fetch_url_content**: Read the full text content of a web page. Use this after web_search to get detailed information from a specific result.

When the user asks you to research something or you need up-to-date information:
1. Use web_search to find relevant results
2. Use fetch_url_content on the most relevant URLs to get detailed information
3. Synthesize the information into your response or use it to create better workflows
4. Always cite your sources by mentioning the websites you referenced`;
  }

  prompt += `

CURRENT WORKFLOW STATE:
${JSON.stringify(snapshot, null, 2)}

Use the tools to make changes. Be concise. If the request is ambiguous, ask for clarification.`;

  return prompt;
}

// ─── OpenAI Message Converter (for Z.AI) ─────────────────────────────────────

function toOpenAIMessages(messages: AiMessage[], systemPrompt: string): unknown[] {
  const result: unknown[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      result.push({ role: msg.role, content: msg.content });
    } else if (Array.isArray(msg.content)) {
      const textBlocks = msg.content.filter((b) => b.type === 'text');
      const toolUseBlocks = msg.content.filter((b) => b.type === 'tool_use');
      const toolResultBlocks = msg.content.filter((b) => b.type === 'tool_result');

      if (msg.role === 'assistant' && toolUseBlocks.length > 0) {
        const textContent = textBlocks.map((b) => (b as { type: 'text'; text: string }).text).join('\n');
        const toolCalls = toolUseBlocks.map((b) => {
          const tu = b as { type: 'tool_use'; id: string; name: string; input: unknown };
          return { id: tu.id, type: 'function', function: { name: tu.name, arguments: JSON.stringify(tu.input) } };
        });
        result.push({ role: 'assistant', content: textContent || null, tool_calls: toolCalls });
      } else if (msg.role === 'user' && toolResultBlocks.length > 0) {
        for (const b of toolResultBlocks) {
          const tr = b as { type: 'tool_result'; tool_use_id: string; content: string };
          result.push({ role: 'tool', tool_call_id: tr.tool_use_id, content: tr.content });
        }
        const textContent = textBlocks.map((b) => (b as { type: 'text'; text: string }).text).join('\n');
        if (textContent.trim()) result.push({ role: 'user', content: textContent });
      } else {
        const textContent = textBlocks.map((b) => (b as { type: 'text'; text: string }).text).join('\n');
        result.push({ role: msg.role, content: textContent });
      }
    }
  }

  return result;
}

// ─── Anthropic Streaming Parser ───────────────────────────────────────────────

async function* parseAnthropicStream(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: 'error', message: 'No response body from Anthropic' };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let stopReason = 'end_turn';
  // pending tool-use blocks keyed by content-block index
  const pending = new Map<number, { id: string; name: string; inputStr: string }>();

  try {
    while (true) {
      if (signal?.aborted) return;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        let eventType = '';
        let eventData = '';
        for (const line of part.split('\n')) {
          if (line.startsWith('event: ')) eventType = line.slice(7).trim();
          else if (line.startsWith('data: ')) eventData = line.slice(6);
        }

        if (!eventType || !eventData || eventData === '[DONE]') continue;

        try {
          const parsed = JSON.parse(eventData);

          if (eventType === 'content_block_start' && parsed.content_block?.type === 'tool_use') {
            pending.set(parsed.index, { id: parsed.content_block.id, name: parsed.content_block.name, inputStr: '' });
          } else if (eventType === 'content_block_delta') {
            if (parsed.delta?.type === 'text_delta') {
              yield { type: 'text_delta', text: parsed.delta.text as string };
            } else if (parsed.delta?.type === 'input_json_delta') {
              const tool = pending.get(parsed.index as number);
              if (tool) tool.inputStr += parsed.delta.partial_json as string;
            }
          } else if (eventType === 'content_block_stop') {
            const tool = pending.get(parsed.index as number);
            if (tool) {
              yield {
                type: 'tool_use',
                id: tool.id,
                name: tool.name,
                input: JSON.parse(tool.inputStr || '{}') as Record<string, unknown>,
              };
              pending.delete(parsed.index as number);
            }
          } else if (eventType === 'message_delta' && parsed.delta?.stop_reason) {
            stopReason = parsed.delta.stop_reason as string;
          }
        } catch {
          // ignore individual SSE parse errors
        }
      }
    }

    yield { type: 'done', stop_reason: stopReason as 'end_turn' | 'tool_use' };
  } finally {
    reader.releaseLock();
  }
}

// ─── Per-Provider Implementations ────────────────────────────────────────────

async function* callZaiDirectly(
  messages: AiMessage[],
  systemPrompt: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const apiKey = import.meta.env.VITE_ZAI_API_KEY as string;
  const baseURL = 'https://api.z.ai/api/coding/paas/v4';

  const openAITools = AI_TOOL_DEFINITIONS.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: tool.input_schema },
  }));

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'glm-5',
        max_tokens: 8192,
        messages: toOpenAIMessages(messages, systemPrompt),
        tools: openAITools,
      }),
      signal,
    });

    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      const err = data.error as { message?: string } | undefined;
      yield { type: 'error', message: err?.message ?? `HTTP ${response.status}` };
      return;
    }

    const msg = (data.choices as { message: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[])?.[0]?.message;
    if (msg?.content) yield { type: 'text_delta', text: msg.content };

    for (const tc of msg?.tool_calls ?? []) {
      yield {
        type: 'tool_use',
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>,
      };
    }

    yield { type: 'done', stop_reason: (msg?.tool_calls?.length ?? 0) > 0 ? 'tool_use' : 'end_turn' };
  } catch (err) {
    if (signal?.aborted) return;
    yield { type: 'error', message: err instanceof Error ? err.message : 'Z.AI request failed' };
  }
}

async function* callKimiDirectly(
  messages: AiMessage[],
  systemPrompt: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const apiKey = import.meta.env.VITE_KIMI_API_KEY as string;
  const baseURL = 'https://api.kimi.com/coding';

  try {
    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'k2p5',
        max_tokens: 8192,
        system: systemPrompt,
        messages,
        tools: AI_TOOL_DEFINITIONS,
      }),
      signal,
    });

    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      const err = data.error as { message?: string } | undefined;
      yield { type: 'error', message: err?.message ?? `HTTP ${response.status}` };
      return;
    }

    for (const block of (data.content as { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[] | undefined) ?? []) {
      if (block.type === 'text' && block.text) {
        yield { type: 'text_delta', text: block.text };
      } else if (block.type === 'tool_use' && block.id && block.name) {
        yield { type: 'tool_use', id: block.id, name: block.name, input: block.input ?? {} };
      }
    }

    yield { type: 'done', stop_reason: (data.stop_reason as 'end_turn' | 'tool_use') ?? 'end_turn' };
  } catch (err) {
    if (signal?.aborted) return;
    yield { type: 'error', message: err instanceof Error ? err.message : 'Kimi request failed' };
  }
}

async function* callAnthropicDirectly(
  messages: AiMessage[],
  systemPrompt: string,
  model: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  };

  // OAuth tokens (sk-ant-oat…) support the browser-facing OAuth beta
  if (apiKey.startsWith('sk-ant-oat')) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['anthropic-beta'] = 'oauth-2025-04-20';
  } else {
    headers['x-api-key'] = apiKey;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        system: systemPrompt,
        messages,
        tools: AI_TOOL_DEFINITIONS,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as Record<string, unknown>;
      const err = data.error as { message?: string } | undefined;
      yield { type: 'error', message: err?.message ?? `HTTP ${response.status}` };
      return;
    }

    yield* parseAnthropicStream(response, signal);
  } catch (err) {
    if (signal?.aborted) return;
    // Give a helpful message if CORS blocks the request
    const message = err instanceof Error ? err.message : 'Anthropic request failed';
    if (message.toLowerCase().includes('cors') || message.toLowerCase().includes('network')) {
      yield {
        type: 'error',
        message:
          'Anthropic cannot be called directly from the browser (CORS). ' +
          'Switch to the z.ai or Kimi model, or use a standard API key with a backend server. ' +
          'OAuth tokens (sk-ant-oat…) are supported directly in browsers.',
      };
    } else {
      yield { type: 'error', message };
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns `true` when a browser-usable API key is available for the given
 * model, meaning the app can call the AI provider directly without a backend.
 */
export function hasBrowserApiKey(model: string): boolean {
  if (model === 'zai') return !!import.meta.env.VITE_ZAI_API_KEY;
  if (model === 'k2p5') return !!import.meta.env.VITE_KIMI_API_KEY;
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

/**
 * Call an AI provider directly from the browser using the VITE_* env vars.
 * Yields `SSEEvent` objects — the same interface as the backend SSE stream —
 * so the caller (useAiChatStore) can process both sources identically.
 */
export async function* callAIDirectly(params: BrowserAiParams): AsyncGenerator<SSEEvent> {
  const { messages, snapshot, model, documentContext, integrations, webSearchEnabled, signal } = params;
  const systemPrompt = buildSystemPrompt(snapshot, documentContext, integrations as IntegrationStatus | undefined, webSearchEnabled);

  if (model === 'zai') {
    yield* callZaiDirectly(messages as AiMessage[], systemPrompt, signal);
  } else if (model === 'k2p5') {
    yield* callKimiDirectly(messages as AiMessage[], systemPrompt, signal);
  } else {
    yield* callAnthropicDirectly(messages as AiMessage[], systemPrompt, model, signal);
  }
}
