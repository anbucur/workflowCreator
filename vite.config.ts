import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import express from 'express';
import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

    server.middlewares.use('/api', apiApp);
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    port: 5173,
  },
})
