import { Router } from 'express';
import { isSafeJiraDomain } from '../middleware/security.js';

const router = Router();

// ─── GitHub Integration Proxy ───────────────────────────────────────

router.post('/github/verify', async (req, res) => {
  const { token, owner, repo } = req.body;
  if (!token || !owner || !repo) return res.status(400).json({ error: 'Missing token, owner, or repo' });
  try {
    const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!r.ok) throw new Error(`GitHub: ${r.status} ${r.statusText}`);
    const data = await r.json() as Record<string, unknown>;
    res.json({ ok: true, fullName: data.full_name, private: data.private, defaultBranch: data.default_branch });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.get('/github', async (req, res) => {
  const { owner, repo, path } = req.query;
  const token = req.headers['x-github-token'] as string | undefined;
  if (!token || !owner || !repo || !path) return res.status(400).json({ error: 'Missing params' });
  const pathStr = String(path);
  if (pathStr.startsWith('/') || pathStr.includes('..') || pathStr.includes('\\') || !/^[A-Za-z0-9._\-\/]+$/.test(pathStr)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner as string)}/${encodeURIComponent(repo as string)}/${pathStr}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    res.json(await r.json());
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// ─── Jira Integration Proxy ─────────────────────────────────────────

router.post('/jira/verify', async (req, res) => {
  const { domain, email, token, projectKey } = req.body;
  if (!domain || !email || !token || !projectKey) return res.status(400).json({ error: 'Missing fields' });
  if (!isSafeJiraDomain(domain)) {
    return res.status(400).json({ error: 'Invalid Jira domain' });
  }
  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const r = await fetch(`https://${domain}/rest/api/3/project/${encodeURIComponent(projectKey)}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`Jira: ${r.status} ${r.statusText}`);
    const data = await r.json() as Record<string, unknown>;
    res.json({ ok: true, name: data.name, key: data.key });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.get('/jira', async (req, res) => {
  const { domain, project, path } = req.query;
  const email = req.headers['x-jira-email'] as string | undefined;
  const token = req.headers['x-jira-token'] as string | undefined;
  if (!email || !token || !domain || !path) return res.status(400).json({ error: 'Missing params' });
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  try {
    if (path === 'sprint/active') {
      const boardsRes = await fetch(`https://${domain}/rest/agile/1.0/board?projectKeyOrId=${project}`, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      });
      if (!boardsRes.ok) throw new Error(`Jira boards: ${boardsRes.status}`);
      const boards = await boardsRes.json() as Record<string, unknown>;
      const boardId = (boards as any)?.values?.[0]?.id;
      if (!boardId) { res.json(null); return; }
      const sprintRes = await fetch(`https://${domain}/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      });
      if (!sprintRes.ok) throw new Error(`Jira sprint: ${sprintRes.status}`);
      const sprintData = await sprintRes.json() as Record<string, unknown>;
      res.json((sprintData as any)?.values?.[0] || null);
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
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// ─── Confluence Integration Proxy ──────────────────────────────────

router.post('/confluence/verify', async (req, res) => {
  const { domain, email, token, spaceKey } = req.body;
  if (!domain || !email || !token || !spaceKey) return res.status(400).json({ error: 'Missing fields' });
  if (!isSafeJiraDomain(domain)) {
    return res.status(400).json({ error: 'Invalid Confluence domain' });
  }
  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const r = await fetch(`https://${domain}/wiki/api/v2/spaces?keys=${encodeURIComponent(spaceKey)}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`Confluence: ${r.status} ${r.statusText}`);
    const data = await r.json() as any;
    const space = data.results?.[0];
    if (!space) throw new Error('Space not found');
    res.json({ ok: true, name: space.name, key: space.key, id: space.id });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.get('/confluence/pages', async (req, res) => {
  const { domain, spaceId } = req.query;
  const email = req.headers['x-confluence-email'] as string | undefined;
  const token = req.headers['x-confluence-token'] as string | undefined;
  if (!email || !token || !domain || !spaceId) return res.status(400).json({ error: 'Missing params' });
  if (!isSafeJiraDomain(domain as string)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  try {
    const r = await fetch(`https://${domain}/wiki/api/v2/spaces/${spaceId}/pages?limit=25&sort=-modified-date`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`Confluence pages: ${r.status}`);
    const data = await r.json() as any;
    const pages = (data.results || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      lastModified: p.version?.createdAt || '',
    }));
    res.json(pages);
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

router.get('/confluence/page/:pageId', async (req, res) => {
  const { domain } = req.query;
  const email = req.headers['x-confluence-email'] as string | undefined;
  const token = req.headers['x-confluence-token'] as string | undefined;
  const { pageId } = req.params;
  if (!email || !token || !domain || !pageId) return res.status(400).json({ error: 'Missing params' });
  if (!isSafeJiraDomain(domain as string)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  try {
    const r = await fetch(`https://${domain}/wiki/api/v2/pages/${pageId}?body-format=storage`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`Confluence page: ${r.status}`);
    const data = await r.json() as any;
    const htmlContent = data.body?.storage?.value || '';
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    res.json({
      id: data.id,
      title: data.title,
      content: plainText,
      lastModified: data.version?.createdAt || '',
    });
  } catch (e: unknown) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

export default router;
