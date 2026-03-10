import { Router } from 'express';
import { isValidId, isValidName, MAX_DATA_SIZE, listProjects, getProject, upsertProject, deleteProject } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const rows = listProjects.all();
    res.json(rows || []);
  } catch {
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

router.get('/:id', (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  try {
    const row = getProject.get(req.params.id) as { data: string } | undefined;
    if (!row || !row.data) return res.status(404).json({ error: 'Not found' });
    res.json(JSON.parse(row.data));
  } catch {
    res.status(500).json({ error: 'Failed to load project' });
  }
});

router.post('/', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

export default router;
