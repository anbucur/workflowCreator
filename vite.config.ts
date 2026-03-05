import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import express from 'express';
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'workflow.sqlite');

const db = new sqlite3.Database(dbPath);
db.run(`CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, data TEXT)`);

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    const apiApp = express();
    apiApp.use(express.json({ limit: '50mb' }));

    // Init DB Migrations
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      updated_at INTEGER,
      data TEXT
    )`, () => {
      // Migrate from 'workflows' table if exists and 'projects' is empty
      db.get(`SELECT count(*) as count FROM projects`, (err: any, row: any) => {
        if (!err && row && row.count === 0) {
          db.run(`INSERT INTO projects (id, name, updated_at, data) SELECT id, 'Imported Project', strftime('%s','now') * 1000, data FROM workflows`);
        }
      });
    });

    apiApp.get('/projects', (req, res) => {
      db.all('SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
      });
    });

    apiApp.get('/projects/:id', (req, res) => {
      db.get('SELECT data FROM projects WHERE id = ?', [req.params.id], (err, row: any) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || !row.data) return res.status(404).json({ error: 'Not found' });
        try {
          res.json(JSON.parse(row.data));
        } catch { res.status(500).json({ error: 'Parse Error' }); }
      });
    });

    apiApp.post('/projects', (req, res) => {
      const { id, name, data } = req.body;
      if (!id || !data) return res.status(400).json({ error: 'Missing id or data' });
      const query = `INSERT INTO projects (id, name, updated_at, data) VALUES (?, ?, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at, data = excluded.data`;
      db.run(query, [id, name || 'Untitled', Date.now(), JSON.stringify(data)], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });

    apiApp.delete('/projects/:id', (req, res) => {
      db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
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
