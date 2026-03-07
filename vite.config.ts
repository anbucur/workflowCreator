import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import express from 'express';
import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'workflow.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, data TEXT)`);

// Input validation helpers
const isValidId = (id: unknown): id is string =>
  typeof id === 'string' && id.length > 0 && id.length <= 100 && /^[\w-]+$/.test(id);

const isValidName = (name: unknown): name is string =>
  typeof name === 'string' && name.length <= 500;

const MAX_DATA_SIZE = 5 * 1024 * 1024; // 5MB max for project data

// ─── AI Tool Definitions & System Prompt ─────────────────────────────
const STEP_TYPES = ['standard', 'meeting', 'decision', 'parallel', 'checklist', 'handoff', 'milestone', 'document', 'estimation', 'collaboration', 'timeline', 'risk', 'metrics', 'kanban', 'okr', 'sprint', 'roadmap', 'executive'];
const THEME_IDS = ['ocean-depth', 'sunset-glow', 'forest-canopy', 'corporate-clean', 'monochrome-slate', 'midnight-neon', 'warm-earth', 'berry-blast'];

const AI_TOOL_DEFINITIONS = [
  { name: 'update_title_bar', description: 'Update the workflow title bar properties.', input_schema: { type: 'object', properties: { text: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string', description: 'Hex color' }, textColor: { type: 'string', description: 'Hex color' }, fontSize: { type: 'number' }, subtitleFontSize: { type: 'number' }, alignment: { type: 'string', enum: ['left', 'center', 'right'] }, titleFontFamily: { type: 'string' }, subtitleFontFamily: { type: 'string' } } } },
  { name: 'add_phase', description: 'Add a new empty phase. Returns the new phase ID.', input_schema: { type: 'object', properties: {} } },
  { name: 'remove_phase', description: 'Remove a phase and all its steps.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'update_phase', description: 'Update phase title, subtitle, or colors.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, title: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string' }, textColor: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'reorder_phases', description: 'Move a phase from one position to another (0-based).', input_schema: { type: 'object', properties: { fromIndex: { type: 'number' }, toIndex: { type: 'number' } }, required: ['fromIndex', 'toIndex'] } },
  { name: 'add_step', description: 'Add a new step to a phase with ALL properties in ONE call. Returns the new step ID. IMPORTANT: Always include title, description, iconName, and data (if applicable) in this single call - NEVER follow with update_step.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, type: { type: 'string', enum: STEP_TYPES, description: 'Defaults to standard' }, title: { type: 'string', description: 'Step title' }, description: { type: 'string', description: 'Step description' }, iconName: { type: 'string', description: 'Lucide icon name in kebab-case (e.g. "check-circle", "users", "zap")' }, customLabel: { type: 'string', description: 'Custom badge label' }, data: { type: 'object', description: 'Type-specific data object' } }, required: ['phaseId'] } },
  { name: 'remove_step', description: 'Remove a step from a phase.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, stepId: { type: 'string' } }, required: ['phaseId', 'stepId'] } },
  { name: 'update_step', description: 'Update step title, description, icon, or type-specific data.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, iconName: { type: 'string', description: 'Lucide icon name in kebab-case' }, customLabel: { type: 'string' }, data: { type: 'object', description: 'Type-specific data object' } }, required: ['phaseId', 'stepId'] } },
  { name: 'change_step_type', description: 'Change a step to a different type. Resets type-specific data.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, newType: { type: 'string', enum: STEP_TYPES } }, required: ['phaseId', 'stepId', 'newType'] } },
  { name: 'reorder_steps', description: 'Move a step between positions/phases (0-based).', input_schema: { type: 'object', properties: { fromPhaseId: { type: 'string' }, fromIndex: { type: 'number' }, toPhaseId: { type: 'string' }, toIndex: { type: 'number' } }, required: ['fromPhaseId', 'fromIndex', 'toPhaseId', 'toIndex'] } },
  { name: 'add_role', description: 'Add a new role. Returns the new role ID.', input_schema: { type: 'object', properties: { name: { type: 'string' }, color: { type: 'string', description: 'Hex color' } }, required: ['name', 'color'] } },
  { name: 'remove_role', description: 'Remove a role and unassign from all steps.', input_schema: { type: 'object', properties: { roleId: { type: 'string' } }, required: ['roleId'] } },
  { name: 'update_role', description: 'Update a role name, color, or text color.', input_schema: { type: 'object', properties: { roleId: { type: 'string' }, name: { type: 'string' }, color: { type: 'string' }, textColor: { type: 'string' } }, required: ['roleId'] } },
  { name: 'toggle_step_role', description: 'Assign or unassign a role to/from a step.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, stepId: { type: 'string' }, roleId: { type: 'string' } }, required: ['phaseId', 'stepId', 'roleId'] } },
  { name: 'update_layout', description: 'Update layout/styling properties.', input_schema: { type: 'object', properties: { direction: { type: 'string', enum: ['horizontal', 'vertical'] }, phaseGap: { type: 'number' }, stepGap: { type: 'number' }, padding: { type: 'number' }, phaseMinWidth: { type: 'number' }, cornerRadius: { type: 'number' }, phaseTintOpacity: { type: 'number' }, cardTintOpacity: { type: 'number' }, phaseTransitionSharpness: { type: 'number' }, cardBorderStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'none'] }, cardBorderWidth: { type: 'number' }, cardShadow: { type: 'string', enum: ['none', 'soft', 'medium', 'hard', 'neon'] }, showStepIcons: { type: 'boolean' }, phaseBackgroundPattern: { type: 'string', enum: ['none', 'dots', 'grid', 'diagonal'] }, cardTextColorMode: { type: 'string', enum: ['default', 'high-contrast', 'custom'] }, cardTextColor: { type: 'string' } } } },
  { name: 'set_background_color', description: 'Set the canvas background color.', input_schema: { type: 'object', properties: { color: { type: 'string' } }, required: ['color'] } },
  { name: 'add_connector', description: 'Add a visual connector (arrow/line) between two steps. IMPORTANT: Choose handles based on relative positions - source goes TO target, so the arrow points from source toward target. For horizontal workflows (phases left-to-right): if source phase index < target phase index, use sourceHandle="right" and targetHandle="left". If same phase but source step index < target step index, use sourceHandle="bottom" and targetHandle="top". Reverse these if going backwards.', input_schema: { type: 'object', properties: { sourceStepId: { type: 'string', description: 'The step where the connector starts' }, sourceHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the source card to connect from' }, targetStepId: { type: 'string', description: 'The step where the connector ends (arrow points here)' }, targetHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], description: 'Which side of the target card to connect to' }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'], description: 'Defaults to step' } }, required: ['sourceStepId', 'sourceHandle', 'targetStepId', 'targetHandle'] } },
  { name: 'remove_connector', description: 'Remove a connector.', input_schema: { type: 'object', properties: { connectorId: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'update_connector', description: 'Update connector properties.', input_schema: { type: 'object', properties: { connectorId: { type: 'string' }, color: { type: 'string' }, lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'] }, sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] }, strokeWidth: { type: 'number' }, label: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'apply_theme', description: 'Apply a predefined theme.', input_schema: { type: 'object', properties: { themeId: { type: 'string', enum: THEME_IDS } }, required: ['themeId'] } },
  { name: 'reset_to_default', description: 'Reset the workflow to empty default state.', input_schema: { type: 'object', properties: {} } },
];

function buildAISystemPrompt(snapshot: any): string {
  return `You are an AI assistant built directly into PhaseCraft, a workflow infographic editor.
Your job is to help the user build, modify, and style their workflow infographic.

CRITICAL INSTRUCTIONS:
1. When replying to the user, be VERY CONCISE and friendly. Feel free to use emojis appropriately.
2. DO NOT output long paragraphs. Just clearly state what you did or what you can do.
3. You have access to the current state of the infographic.
4. If a user asks to change colors, themes, layout, or content, use the tools.
5. If the request is complex, break it down into multiple tool calls (which you can do in parallel in one turn).
6. Provide helpful suggestions if the user is stuck (e.g., "Would you like me to make these steps parallel?").

CAPABILITIES:
- Create, update, and delete phases (workflow stages/columns)
- Add, update, and delete steps within phases (18 specialized types including enterprise boards)
- Manage roles (people/teams) and assign them to steps
- Apply visual themes (8 predefined themes)
- Customize layout properties (gaps, fonts, shadows, patterns, colors)
- Add connectors (visual arrows/lines) between steps
- Set canvas and title bar properties
- Create enterprise boards: Kanban, OKR trackers, Sprint boards, Product Roadmaps, Executive Dashboards

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

Note: Use short random strings for IDs inside data objects (e.g. "a1b2c3").

CURRENT WORKFLOW STATE:
${JSON.stringify(snapshot, null, 2)}

Use the tools to make changes. Be concise. If the request is ambiguous, ask for clarification.`;
}

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    const apiApp = express();
    apiApp.use(express.json({ limit: '5mb' }));

    // Security headers
    apiApp.use((_req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Content Security Policy
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');
      res.setHeader('Content-Security-Policy', csp);

      next();
    });

    // Init DB Migrations
    db.exec(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      updated_at INTEGER,
      data TEXT
    )`);

    // Migrate from 'workflows' table if exists and 'projects' is empty
    const countRow = db.prepare('SELECT count(*) as count FROM projects').get() as any;
    if (countRow && countRow.count === 0) {
      db.exec(`INSERT INTO projects (id, name, updated_at, data) SELECT id, 'Imported Project', strftime('%s','now') * 1000, data FROM workflows`);
    }

    // Prepared statements for performance and safety
    const listProjects = db.prepare('SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC');
    const getProject = db.prepare('SELECT data FROM projects WHERE id = ?');
    const upsertProject = db.prepare(
      `INSERT INTO projects (id, name, updated_at, data) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at, data = excluded.data`
    );
    const deleteProject = db.prepare('DELETE FROM projects WHERE id = ?');

    apiApp.get('/projects', (_req, res) => {
      try {
        const rows = listProjects.all();
        res.json(rows || []);
      } catch {
        res.status(500).json({ error: 'Failed to list projects' });
      }
    });

    apiApp.get('/projects/:id', (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      try {
        const row = getProject.get(req.params.id) as any;
        if (!row || !row.data) return res.status(404).json({ error: 'Not found' });
        res.json(JSON.parse(row.data));
      } catch {
        res.status(500).json({ error: 'Failed to load project' });
      }
    });

    apiApp.post('/projects', (req, res) => {
      const { id, name, data } = req.body;
      if (!isValidId(id)) {
        return res.status(400).json({ error: 'Invalid or missing project ID' });
      }
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid data' });
      }
      if (name !== undefined && !isValidName(name)) {
        return res.status(400).json({ error: 'Invalid project name' });
      }
      const serialized = JSON.stringify(data);
      if (serialized.length > MAX_DATA_SIZE) {
        return res.status(413).json({ error: 'Project data too large' });
      }
      try {
        upsertProject.run(id, name || 'Untitled', Date.now(), serialized);
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: 'Failed to save project' });
      }
    });

    apiApp.delete('/projects/:id', (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      try {
        deleteProject.run(req.params.id);
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: 'Failed to delete project' });
      }
    });

    // ─── GitHub Integration Proxy ───────────────────────────────────────
    apiApp.post('/integrations/github/verify', async (req: any, res: any) => {
      const { token, owner, repo } = req.body;
      if (!token || !owner || !repo) return res.status(400).json({ error: 'Missing token, owner, or repo' });
      try {
        const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
        });
        if (!r.ok) throw new Error(`GitHub: ${r.status} ${r.statusText}`);
        const data = await r.json() as any;
        res.json({ ok: true, fullName: data.full_name, private: data.private, defaultBranch: data.default_branch });
      } catch (e: any) { res.status(400).json({ error: e.message }); }
    });

    apiApp.get('/integrations/github', async (req: any, res: any) => {
      const { owner, repo, path } = req.query;
      const token = req.headers['x-github-token'];
      if (!token || !owner || !repo || !path) return res.status(400).json({ error: 'Missing params' });
      try {
        const url = `https://api.github.com/repos/${encodeURIComponent(owner as string)}/${encodeURIComponent(repo as string)}/${path}`;
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
        });
        if (!r.ok) throw new Error(`GitHub ${r.status}`);
        res.json(await r.json());
      } catch (e: any) { res.status(502).json({ error: e.message }); }
    });

    // ─── Jira Integration Proxy ─────────────────────────────────────────
    apiApp.post('/integrations/jira/verify', async (req: any, res: any) => {
      const { domain, email, token, projectKey } = req.body;
      if (!domain || !email || !token || !projectKey) return res.status(400).json({ error: 'Missing fields' });
      try {
        const auth = Buffer.from(`${email}:${token}`).toString('base64');
        const r = await fetch(`https://${domain}/rest/api/3/project/${encodeURIComponent(projectKey)}`, {
          headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
        });
        if (!r.ok) throw new Error(`Jira: ${r.status} ${r.statusText}`);
        const data = await r.json() as any;
        res.json({ ok: true, name: data.name, key: data.key });
      } catch (e: any) { res.status(400).json({ error: e.message }); }
    });

    apiApp.get('/integrations/jira', async (req: any, res: any) => {
      const { domain, project, path } = req.query;
      const email = req.headers['x-jira-email'];
      const token = req.headers['x-jira-token'];
      if (!email || !token || !domain || !path) return res.status(400).json({ error: 'Missing params' });
      const auth = Buffer.from(`${email as string}:${token as string}`).toString('base64');
      try {
        if (path === 'sprint/active') {
          const boardsRes = await fetch(`https://${domain}/rest/agile/1.0/board?projectKeyOrId=${project}`, {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          });
          if (!boardsRes.ok) throw new Error(`Jira boards: ${boardsRes.status}`);
          const boards = await boardsRes.json() as any;
          const boardId = boards?.values?.[0]?.id;
          if (!boardId) { res.json(null); return; }
          const sprintRes = await fetch(`https://${domain}/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          });
          if (!sprintRes.ok) throw new Error(`Jira sprint: ${sprintRes.status}`);
          const sprintData = await sprintRes.json() as any;
          res.json(sprintData?.values?.[0] || null);
        } else if (path === 'issues/open') {
          const issuesRes = await fetch(`https://${domain}/rest/api/3/search?jql=${encodeURIComponent(`project=${project} AND statusCategory != Done ORDER BY updated DESC`)}&maxResults=50`, {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          });
          if (!issuesRes.ok) throw new Error(`Jira issues: ${issuesRes.status}`);
          const issueData = await issuesRes.json() as any;
          const issues = (issueData.issues || []).map((i: any) => ({
            key: i.key,
            summary: i.fields.summary,
            status: i.fields.status?.name,
            priority: i.fields.priority?.name,
            assignee: i.fields.assignee?.displayName || null,
            issueType: i.fields.issuetype?.name,
            url: `https://${domain}/browse/${i.key}`,
          }));
          res.json({ issues, done: [] });
        } else {
          const r = await fetch(`https://${domain}/rest/api/3/${path}`, {
            headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
          });
          if (!r.ok) throw new Error(`Jira ${r.status}`);
          res.json(await r.json());
        }
      } catch (e: any) { res.status(502).json({ error: e.message }); }
    });

    // ─── AI Chat Endpoint ───────────────────────────────────────────────
    apiApp.post('/ai/chat', async (req: any, res: any) => {
      const { messages, snapshot, model = 'zai' } = req.body;

      let apiKey;
      let baseURL;
      let defaultHeaders;

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
          baseURL = undefined; // use default
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

      const anthropicOpts: any = { apiKey };
      if (baseURL) anthropicOpts.baseURL = baseURL;

      if (model !== 'k2p5' && apiKey.startsWith('sk-ant-oat')) {
        anthropicOpts.authToken = apiKey;
        anthropicOpts.apiKey = null;
        anthropicOpts.defaultHeaders = defaultHeaders;
      }

      const anthropic = new Anthropic(anthropicOpts);

      try {
        const systemPrompt = buildAISystemPrompt(snapshot);

        if (model === 'zai') {
          // z.ai uses OpenAI-compatible API
          const zaiModel = 'glm-5';

          // Convert Anthropic tool definitions to OpenAI format
          const openAITools = AI_TOOL_DEFINITIONS.map(tool => ({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.input_schema,
            }
          }));

          // Convert messages to OpenAI format
          const openAIMessages: any[] = [{ role: 'system', content: systemPrompt }];
          
          for (const msg of messages) {
            if (typeof msg.content === 'string') {
              openAIMessages.push({ role: msg.role, content: msg.content });
            } else if (Array.isArray(msg.content)) {
              // Handle complex content blocks (Anthropic format)
              const textBlocks = msg.content.filter((block: any) => block.type === 'text');
              const toolUseBlocks = msg.content.filter((block: any) => block.type === 'tool_use');
              const toolResultBlocks = msg.content.filter((block: any) => block.type === 'tool_result');
              
              if (msg.role === 'assistant' && toolUseBlocks.length > 0) {
                // Assistant message with tool calls
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
                // User message with tool results - add each as a separate tool message
                for (const block of toolResultBlocks) {
                  openAIMessages.push({
                    role: 'tool',
                    tool_call_id: block.tool_use_id,
                    content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
                  });
                }
                // Also add any text content as a separate user message if present
                if (textBlocks.length > 0) {
                  const textContent = textBlocks.map((block: any) => block.text).join('\n');
                  if (textContent.trim()) {
                    openAIMessages.push({ role: 'user', content: textContent });
                  }
                }
              } else {
                // Regular message with just text blocks
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

            // Simulate text_delta event for content
            if (content) {
              const textData = JSON.stringify({ text: content });
              res.write(`event: text_delta\ndata: ${textData}\n\n`);
            }

            // Simulate tool_use events for each tool call
            for (const tc of toolCalls) {
              const toolData = JSON.stringify({
                id: tc.id,
                name: tc.function?.name,
                input: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
              });
              res.write(`event: tool_use\ndata: ${toolData}\n\n`);
            }

            // Determine stop reason
            const stopReason = toolCalls.length > 0 ? 'tool_use' : 'end_turn';
            const doneData = JSON.stringify({ stop_reason: stopReason });
            res.write(`event: done\ndata: ${doneData}\n\n`);
            res.end();
            return;
          } catch (fetchError: any) {
            console.log('ZAI FETCH ERROR:', fetchError.message);
            res.write(`event: error\ndata: ${JSON.stringify({ message: fetchError.message })}\n\n`);
            res.end();
            return;
          }
        }

        if (model === 'k2p5') {
          // Kimi doesn't support streaming reliably, so we do a standard call
          // and simulate the stream events for the frontend.
          const response = await anthropic.messages.create({
            model: model,
            max_tokens: 8192,
            system: systemPrompt,
            messages,
            tools: AI_TOOL_DEFINITIONS as any,
          });

          console.log('KIMI RAW RESPONSE:', JSON.stringify(response, null, 2));

          for (const block of response.content) {
            if (block.type === 'text') {
              // Simulate text_delta
              const data = JSON.stringify({ text: block.text });
              res.write(`event: text_delta\ndata: ${data}\n\n`);
            } else if (block.type === 'tool_use') {
              // Simulate tool_use
              const data = JSON.stringify({ id: block.id, name: block.name, input: block.input });
              res.write(`event: tool_use\ndata: ${data}\n\n`);
            }
          }
          const data = JSON.stringify({ stop_reason: response.stop_reason });
          res.write(`event: done\ndata: ${data}\n\n`);
          res.end();
          return;
        }

        const stream = anthropic.messages.stream({
          model: model,
          max_tokens: 8192,
          system: systemPrompt,
          messages,
          tools: AI_TOOL_DEFINITIONS as any,
        });

        // Track tool_use content blocks as they stream
        let currentToolUse: { id: string; name: string; inputJson: string } | null = null;

        (stream as any).on('contentBlockStart', (event: any) => {
          if (event.contentBlock?.type === 'tool_use') {
            currentToolUse = { id: event.contentBlock.id, name: event.contentBlock.name, inputJson: '' };
          }
        });

        (stream as any).on('contentBlockDelta', (event: any) => {
          if (event.delta?.type === 'text_delta') {
            const data = JSON.stringify({ text: event.delta.text });
            res.write(`event: text_delta\ndata: ${data}\n\n`);
          } else if (event.delta?.type === 'input_json_delta' && currentToolUse) {
            currentToolUse.inputJson += event.delta.partial_json;
          }
        });

        (stream as any).on('contentBlockStop', () => {
          if (currentToolUse) {
            try {
              const input = currentToolUse.inputJson ? JSON.parse(currentToolUse.inputJson) : {};
              const data = JSON.stringify({ id: currentToolUse.id, name: currentToolUse.name, input });
              res.write(`event: tool_use\ndata: ${data}\n\n`);
            } catch {
              const data = JSON.stringify({ id: currentToolUse.id, name: currentToolUse.name, input: {} });
              res.write(`event: tool_use\ndata: ${data}\n\n`);
            }
            currentToolUse = null;
          }
        });

        const finalMessage = await stream.finalMessage();
        const data = JSON.stringify({ stop_reason: finalMessage.stop_reason });
        res.write(`event: done\ndata: ${data}\n\n`);
      } catch (err: any) {
        const message = err?.message || 'Unknown AI error';
        res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      } finally {
        res.end();
      }
    });

    server.middlewares.use('/api', apiApp);
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    port: 5173,
  },
})
