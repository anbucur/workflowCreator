/**
 * Export projects from workflow.sqlite to public/data/projects.json
 * so the static GitHub Pages build can load pre-existing project data.
 *
 * Uses the sqlite3 CLI (available on macOS and ubuntu-latest) so that no
 * native Node.js bindings are required.
 *
 * Usage: node scripts/export-db.mjs
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dbPath = join(rootDir, 'workflow.sqlite');
const outDir = join(rootDir, 'public', 'data');
const outFile = join(outDir, 'projects.json');

if (!existsSync(dbPath)) {
  console.warn(`workflow.sqlite not found at ${dbPath} — skipping export.`);
  process.exit(0);
}

// Determine which table to read from
const tables = execSync(`sqlite3 "${dbPath}" ".tables"`, { encoding: 'utf8' })
  .trim()
  .split(/\s+/);

let query;
if (tables.includes('projects')) {
  query = 'SELECT id, name, updated_at, data FROM projects ORDER BY updated_at DESC';
} else if (tables.includes('workflows')) {
  query = `SELECT id, 'Imported Project' AS name, ${Date.now()} AS updated_at, data FROM workflows`;
} else {
  console.warn('No recognized table found in workflow.sqlite — skipping export.');
  process.exit(0);
}

// sqlite3 -json outputs an array of objects with the data field as a JSON string
const raw = execSync(`sqlite3 -json "${dbPath}" "${query}"`, { encoding: 'utf8' });
const rows = JSON.parse(raw);

// Parse the nested JSON data field so the output file is fully self-contained
const projects = rows.map(r => ({
  ...r,
  data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
}));

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(projects, null, 2));

console.log(`Exported ${projects.length} project(s) to ${outFile}`);
