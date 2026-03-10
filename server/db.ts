import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'workflow.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, data TEXT)`);

// Input validation helpers
export const isValidId = (id: unknown): id is string =>
  typeof id === 'string' && id.length > 0 && id.length <= 100 && /^[\w-]+$/.test(id);

export const isValidName = (name: unknown): name is string =>
  typeof name === 'string' && name.length <= 500;

export const MAX_DATA_SIZE = 5 * 1024 * 1024; // 5MB max for project data

// Run migrations
export function initDb() {
  db.exec(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    updated_at INTEGER,
    data TEXT
  )`);

  // Migrate from 'workflows' table if exists and 'projects' is empty
  const countRow = db.prepare('SELECT count(*) as count FROM projects').get() as { count: number };
  if (countRow && countRow.count === 0) {
    db.exec(`INSERT INTO projects (id, name, updated_at, data) SELECT id, 'Imported Project', strftime('%s','now') * 1000, data FROM workflows`);
  }
}

// Prepared statements for performance and safety
export const listProjects = db.prepare('SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC');
export const getProject = db.prepare('SELECT data FROM projects WHERE id = ?');
export const upsertProject = db.prepare(
  `INSERT INTO projects (id, name, updated_at, data) VALUES (?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at, data = excluded.data`
);
export const deleteProject = db.prepare('DELETE FROM projects WHERE id = ?');

export default db;
