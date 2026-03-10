import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

// ─── AI Tool Definitions & Constants ─────────────────────────────────

const STEP_TYPES = ['standard', 'meeting', 'decision', 'parallel', 'checklist', 'handoff', 'milestone', 'document', 'estimation', 'collaboration', 'timeline', 'risk', 'metrics', 'kanban', 'okr', 'sprint', 'roadmap', 'executive'];
const THEME_IDS = ['ocean-depth', 'sunset-glow', 'forest-canopy', 'corporate-clean', 'monochrome-slate', 'midnight-neon', 'warm-earth', 'berry-blast'];

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
  { name: 'add_connector', description: 'Add a visual connector (arrow/line) between two steps. IMPORTANT: Choose handles based on relative positions - source goes TO target, so the arrow points from source toward target. For horizontal workflows (phases left-to-right): if source phase index < target phase index, use sourceHandle="right" and targetHandle="left". If same phase but source step index < target step index, use sourceHandle="bottom" and targetHandle="top". Reverse these if going backwards.', input_schema: { type: 'object' as const, properties: { sourceStepId: { type: 'string', description: 'The step where the connector starts' }, sourceHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the source card to connect from' }, targetStepId: { type: 'string', description: 'The step where the connector ends (arrow points here)' }, targetHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the target card to connect to' }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'], description: 'Defaults to step' } }, required: ['sourceStepId', 'sourceHandle', 'targetStepId', 'targetHandle'] } },
  { name: 'remove_connector', description: 'Remove a connector.', input_schema: { type: 'object' as const, properties: { connectorId: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'update_connector', description: 'Update connector properties.', input_schema: { type: 'object' as const, properties: { connectorId: { type: 'string' }, color: { type: 'string' }, lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'] }, sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] }, strokeWidth: { type: 'number' }, label: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'apply_theme', description: 'Apply a predefined theme.', input_schema: { type: 'object' as const, properties: { themeId: { type: 'string', enum: THEME_IDS } }, required: ['themeId'] } },
  { name: 'reset_to_default', description: 'Reset the workflow to empty default state.', input_schema: { type: 'object' as const, properties: {} } },
  { name: 'fetch_integration_data', description: 'Fetch live data from connected integrations (Jira, GitHub). Returns sprint info, issues, releases, etc.', input_schema: { type: 'object' as const, properties: { provider: { type: 'string', enum: ['jira', 'github'] }, dataType: { type: 'string', enum: ['sprint', 'issues', 'releases', 'workflow_runs', 'all'] } }, required: ['provider'] } },
];

const WEB_SEARCH_TOOL_DEFINITIONS = [
  { name: 'web_search', description: 'Search the web using DuckDuckGo or Brave Search. Returns a list of results with titles, URLs, and snippets. Use this to find current information, research topics, or gather data for creating workflows.', input_schema: { type: 'object' as const, properties: { query: { type: 'string', description: 'Search query' }, maxResults: { type: 'number', description: 'Max results to return (default: 8, max: 15)' } }, required: ['query'] } },
  { name: 'fetch_url_content', description: 'Fetch and extract text content from a URL. Use this to read the full content of a web page found via web_search. Returns plain text with HTML stripped.', input_schema: { type: 'object' as const, properties: { url: { type: 'string', description: 'URL to fetch content from (must be http/https)' } }, required: ['url'] } },
];

// ─── System Prompt Builder ──────────────────────────────────────────

interface DocumentContext {
  content: string;
  fileName: string;
  fileType: string;
  charCount: number;
  source: string;
}

interface IntegrationStatus {
  jira?: { connected: boolean; projectKey?: string };
  github?: { connected: boolean; owner?: string; repo?: string };
  confluence?: { connected: boolean; spaceKey?: string };
}

function buildAISystemPrompt(snapshot: unknown, documentContext?: DocumentContext, integrations?: IntegrationStatus, webSearchEnabled?: boolean): string {
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
- Search the web for current information, research topics, and gather data (when web search is enabled)
- Fetch and read web page content to extract detailed information

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

  // Inject document context if present
  if (documentContext && documentContext.content) {
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

  // Inject integration status
  if (integrations) {
    const parts: string[] = [];
    if (integrations.jira) {
      parts.push(`- Jira: ${integrations.jira.connected ? `Connected (project: ${integrations.jira.projectKey})` : 'Not connected'}`);
    }
    if (integrations.github) {
      parts.push(`- GitHub: ${integrations.github.connected ? `Connected (repo: ${integrations.github.owner}/${integrations.github.repo})` : 'Not connected'}`);
    }
    if (integrations.confluence) {
      parts.push(`- Confluence: ${integrations.confluence.connected ? `Connected (space: ${integrations.confluence.spaceKey})` : 'Not connected'}`);
    }
    if (parts.length > 0) {
      prompt += `

CONNECTED INTEGRATIONS:
${parts.join('\n')}

When integrations are connected, you can use the fetch_integration_data tool to pull live data and populate steps with real project information.`;
    }
  }

  // Inject web search capability
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

// ─── AI Chat Route ──────────────────────────────────────────────────

const router = Router();

router.post('/chat', async (req, res) => {
  const { messages, snapshot, model = 'zai', documentContext, integrations, webSearchEnabled } = req.body;

  let apiKey: string | undefined;
  let baseURL: string | undefined;
  let defaultHeaders: Record<string, string> | undefined;

  if (model === 'zai') {
    apiKey = process.env.ZAI_API_KEY;
    baseURL = 'https://api.z.ai/api/coding/paas/v4';
    if (!apiKey) {
      return res.status(500).json({ error: 'ZAI_API_KEY not configured. Set it in your .env file and restart the server.' });
    }
  } else if (model === 'k2p5') {
    apiKey = process.env.KIMI_API_KEY;
    baseURL = 'https://api.kimi.com/coding';
    if (!apiKey) {
      return res.status(500).json({ error: 'KIMI_API_KEY not configured. Set it in your .env file and restart the server.' });
    }
  } else {
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Set it in your .env file and restart the server.' });
    }
    if (apiKey.startsWith('sk-ant-oat')) {
      baseURL = undefined;
      defaultHeaders = { 'anthropic-beta': 'oauth-2025-04-20' };
    }
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  const anthropicOpts: Record<string, unknown> = { apiKey };
  if (baseURL) anthropicOpts.baseURL = baseURL;

  if (model !== 'k2p5' && apiKey!.startsWith('sk-ant-oat')) {
    anthropicOpts.authToken = apiKey;
    anthropicOpts.apiKey = null;
    anthropicOpts.defaultHeaders = defaultHeaders;
  }

  const anthropic = new Anthropic(anthropicOpts as any);

  try {
    const systemPrompt = buildAISystemPrompt(snapshot, documentContext, integrations, webSearchEnabled);
    const allTools = webSearchEnabled
      ? [...AI_TOOL_DEFINITIONS, ...WEB_SEARCH_TOOL_DEFINITIONS]
      : AI_TOOL_DEFINITIONS;

    if (model === 'zai') {
      // z.ai uses OpenAI-compatible API
      const zaiModel = 'glm-5';

      const openAITools = allTools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        }
      }));

      const openAIMessages: any[] = [{ role: 'system', content: systemPrompt }];

      for (const msg of messages) {
        if (typeof msg.content === 'string') {
          openAIMessages.push({ role: msg.role, content: msg.content });
        } else if (Array.isArray(msg.content)) {
          const textBlocks = msg.content.filter((block: any) => block.type === 'text');
          const toolUseBlocks = msg.content.filter((block: any) => block.type === 'tool_use');
          const toolResultBlocks = msg.content.filter((block: any) => block.type === 'tool_result');

          if (msg.role === 'assistant' && toolUseBlocks.length > 0) {
            const textContent = textBlocks.map((block: any) => block.text).join('\n');
            const toolCalls = toolUseBlocks.map((block: any) => ({
              id: block.id,
              type: 'function',
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            }));
            openAIMessages.push({
              role: 'assistant',
              content: textContent || null,
              tool_calls: toolCalls,
            });
          } else if (msg.role === 'user' && toolResultBlocks.length > 0) {
            for (const block of toolResultBlocks) {
              openAIMessages.push({
                role: 'tool',
                tool_call_id: block.tool_use_id,
                content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
              });
            }
            if (textBlocks.length > 0) {
              const textContent = textBlocks.map((block: any) => block.text).join('\n');
              if (textContent.trim()) {
                openAIMessages.push({ role: 'user', content: textContent });
              }
            }
          } else {
            const textContent = textBlocks.map((block: any) => block.text).join('\n');
            openAIMessages.push({ role: msg.role, content: textContent });
          }
        }
      }

      try {
        const response = await fetch(`${baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: zaiModel,
            max_tokens: 8192,
            messages: openAIMessages,
            tools: openAITools,
          }),
        });

        const data = await response.json() as any;

        if (!response.ok) {
          console.log('ZAI ERROR:', JSON.stringify(data, null, 2));
          res.write(`event: error\ndata: ${JSON.stringify({ message: data.error?.message || `HTTP ${response.status}` })}\n\n`);
          res.end();
          return;
        }

        console.log('ZAI RAW RESPONSE:', JSON.stringify(data, null, 2));

        const message = data.choices?.[0]?.message;
        const content = message?.content || '';
        const toolCalls = message?.tool_calls || [];

        if (content) {
          const textData = JSON.stringify({ text: content });
          res.write(`event: text_delta\ndata: ${textData}\n\n`);
        }

        for (const tc of toolCalls) {
          const toolData = JSON.stringify({
            id: tc.id,
            name: tc.function?.name,
            input: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
          });
          res.write(`event: tool_use\ndata: ${toolData}\n\n`);
        }

        const stopReason = toolCalls.length > 0 ? 'tool_use' : 'end_turn';
        const doneData = JSON.stringify({ stop_reason: stopReason });
        res.write(`event: done\ndata: ${doneData}\n\n`);
        res.end();
        return;
      } catch (fetchError: unknown) {
        const msg = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        console.log('ZAI FETCH ERROR:', msg);
        res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);
        res.end();
        return;
      }
    }

    if (model === 'k2p5') {
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 8192,
        system: systemPrompt,
        messages,
        tools: allTools as any,
      });

      console.log('KIMI RAW RESPONSE:', JSON.stringify(response, null, 2));

      for (const block of response.content) {
        if (block.type === 'text') {
          const data = JSON.stringify({ text: block.text });
          res.write(`event: text_delta\ndata: ${data}\n\n`);
        } else if (block.type === 'tool_use') {
          const data = JSON.stringify({ id: block.id, name: block.name, input: block.input });
          res.write(`event: tool_use\ndata: ${data}\n\n`);
        }
      }
      const data = JSON.stringify({ stop_reason: response.stop_reason });
      res.write(`event: done\ndata: ${data}\n\n`);
      res.end();
      return;
    }

    // Default: Anthropic streaming
    console.log(`[AI] Streaming with model=${model}, baseURL=${anthropicOpts.baseURL || 'default'}, hasAuthToken=${!!anthropicOpts.authToken}`);
    const stream = anthropic.messages.stream({
      model: model,
      max_tokens: 8192,
      system: systemPrompt,
      messages,
      tools: allTools as any,
    });

    (stream as any).on('text', (text: string) => {
      const data = JSON.stringify({ text });
      res.write(`event: text_delta\ndata: ${data}\n\n`);
    });

    (stream as any).on('contentBlock', (block: any) => {
      if (block?.type === 'tool_use') {
        const data = JSON.stringify({ id: block.id, name: block.name, input: block.input });
        res.write(`event: tool_use\ndata: ${data}\n\n`);
      }
    });

    const finalMessage = await stream.finalMessage();
    const data = JSON.stringify({ stop_reason: finalMessage.stop_reason });
    res.write(`event: done\ndata: ${data}\n\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    console.error(`[AI] Error for model=${model}:`, (err as any)?.status, message);
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
