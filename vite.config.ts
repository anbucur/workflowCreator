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
const STEP_TYPES = ['standard', 'meeting', 'decision', 'parallel', 'checklist', 'handoff', 'milestone', 'document', 'estimation', 'collaboration', 'timeline', 'risk', 'metrics'];
const THEME_IDS = ['ocean-depth', 'sunset-glow', 'forest-canopy', 'corporate-clean', 'monochrome-slate', 'midnight-neon', 'warm-earth', 'berry-blast'];

const AI_TOOL_DEFINITIONS = [
  { name: 'update_title_bar', description: 'Update the workflow title bar properties.', input_schema: { type: 'object', properties: { text: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string', description: 'Hex color' }, textColor: { type: 'string', description: 'Hex color' }, fontSize: { type: 'number' }, subtitleFontSize: { type: 'number' }, alignment: { type: 'string', enum: ['left', 'center', 'right'] }, titleFontFamily: { type: 'string' }, subtitleFontFamily: { type: 'string' } } } },
  { name: 'add_phase', description: 'Add a new empty phase. Returns the new phase ID.', input_schema: { type: 'object', properties: {} } },
  { name: 'remove_phase', description: 'Remove a phase and all its steps.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'update_phase', description: 'Update phase title, subtitle, or colors.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, title: { type: 'string' }, subtitle: { type: 'string' }, backgroundColor: { type: 'string' }, textColor: { type: 'string' } }, required: ['phaseId'] } },
  { name: 'reorder_phases', description: 'Move a phase from one position to another (0-based).', input_schema: { type: 'object', properties: { fromIndex: { type: 'number' }, toIndex: { type: 'number' } }, required: ['fromIndex', 'toIndex'] } },
  { name: 'add_step', description: 'Add a new step to a phase. Returns the new step ID.', input_schema: { type: 'object', properties: { phaseId: { type: 'string' }, type: { type: 'string', enum: STEP_TYPES, description: 'Defaults to standard' } }, required: ['phaseId'] } },
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
  { name: 'add_connector', description: 'Add a connector between two steps.', input_schema: { type: 'object', properties: { sourceStepId: { type: 'string' }, sourceHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'] }, targetStepId: { type: 'string' }, targetHandle: { type: 'string', enum: ['top', 'bottom', 'left', 'right'] }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] } }, required: ['sourceStepId', 'sourceHandle', 'targetStepId', 'targetHandle'] } },
  { name: 'remove_connector', description: 'Remove a connector.', input_schema: { type: 'object', properties: { connectorId: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'update_connector', description: 'Update connector properties.', input_schema: { type: 'object', properties: { connectorId: { type: 'string' }, color: { type: 'string' }, lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted'] }, sourceHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, targetHead: { type: 'string', enum: ['none', 'arrow', 'diamond', 'circle', 'square'] }, type: { type: 'string', enum: ['straight', 'curved', 'step', 'loop'] }, strokeWidth: { type: 'number' }, label: { type: 'string' } }, required: ['connectorId'] } },
  { name: 'apply_theme', description: 'Apply a predefined theme.', input_schema: { type: 'object', properties: { themeId: { type: 'string', enum: THEME_IDS } }, required: ['themeId'] } },
  { name: 'reset_to_default', description: 'Reset the workflow to empty default state.', input_schema: { type: 'object', properties: {} } },
];

function buildAISystemPrompt(snapshot: any): string {
  return `You are PhaseCraft AI, an assistant that helps users build and edit workflow infographics. You can create phases, add steps, apply themes, manage roles, add connectors, and customize every aspect of the workflow.

CAPABILITIES:
- Create, update, and delete phases (workflow stages/columns)
- Add, update, and delete steps within phases (13 specialized types)
- Manage roles (people/teams) and assign them to steps
- Apply visual themes (8 predefined themes)
- Customize layout properties (gaps, fonts, shadows, patterns, colors)
- Add connectors (visual arrows/lines) between steps
- Set canvas and title bar properties

RULES:
1. Use realistic, professional names and descriptions relevant to the user's domain.
2. When adding phases and steps, first add the phase, note its returned ID, then add steps to it, then update the steps with meaningful content.
3. For step types with type-specific data, use update_step with the "data" field after creating the step.
4. Always reference existing IDs from the current state when updating or removing elements.
5. Use hex color codes that complement the current theme.
6. You can execute multiple tool calls in a single response for batch changes.
7. After making changes, briefly describe what you did.

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

    // ─── AI Chat Endpoint ───────────────────────────────────────────────
    apiApp.post('/ai/chat', async (req: any, res: any) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Set it in your .env file and restart the server.' });
      }

      const { messages, snapshot } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing messages array' });
      }

      // SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      if (res.flushHeaders) res.flushHeaders();

      const anthropic = new Anthropic({ apiKey });

      try {
        const systemPrompt = buildAISystemPrompt(snapshot);
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
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
