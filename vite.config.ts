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
    server.middlewares.use(express.json({ limit: '50mb' }));

    server.middlewares.use('/api/workflow', (req: any, res: any) => {
      if (req.method === 'GET') {
        db.get('SELECT data FROM workflows WHERE id = ?', ['main'], (err, row: any) => {
          res.setHeader('Content-Type', 'application/json');
          if (err) return res.end(JSON.stringify({ error: err.message }));
          res.end(row && row.data ? row.data : 'null');
        });
      } else if (req.method === 'POST') {
        const { data } = req.body;
        if (!data) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'No data' }));
        }
        const query = `INSERT INTO workflows (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`;
        db.run(query, ['main', JSON.stringify(data)], function (err) {
          res.setHeader('Content-Type', 'application/json');
          if (err) return res.end(JSON.stringify({ error: err.message }));
          res.end(JSON.stringify({ success: true }));
        });
      } else {
        res.statusCode = 405;
        res.end();
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    port: 5173,
  },
})
