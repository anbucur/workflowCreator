import { create } from 'zustand';
import type {
  IntegrationConnection, IntegrationLiveData, GitHubConfig, JiraConfig, ConfluenceConfig, ConfluencePage,
  GitHubRelease, GitHubIssue, GitHubWorkflowRun, FeatureVerification, DeploymentStatus
} from '../types/integrations';

interface IntegrationsStore {
  connections: Record<string, IntegrationConnection>;
  liveData: IntegrationLiveData;
  syncing: boolean;
  lastError: string | null;
  featureChecks: FeatureVerification[];
  confluencePages: ConfluencePage[];
  confluenceSpaceId: string | null;

  // Connect / disconnect
  connectGitHub: (config: GitHubConfig) => Promise<void>;
  connectJira: (config: JiraConfig) => Promise<void>;
  connectConfluence: (config: ConfluenceConfig) => Promise<void>;
  disconnect: (provider: string) => void;

  // Sync live data
  syncGitHub: () => Promise<void>;
  syncJira: () => Promise<void>;
  syncAll: () => Promise<void>;

  // Confluence
  fetchConfluencePages: () => Promise<void>;
  fetchConfluencePageContent: (pageId: string) => Promise<{ title: string; content: string } | null>;

  // AI feature verification
  verifyFeature: (feature: string) => Promise<FeatureVerification>;

  // Helpers
  isConnected: (provider: string) => boolean;
  getGitHubConfig: () => GitHubConfig | null;
  getJiraConfig: () => JiraConfig | null;
  getConfluenceConfig: () => ConfluenceConfig | null;
  clearError: () => void;
}

// ─── GitHub API helpers (runs via backend proxy to avoid CORS/token exposure) ─

async function ghFetch(config: GitHubConfig, path: string) {
  const res = await fetch(`/api/integrations/github?owner=${config.owner}&repo=${config.repo}&path=${encodeURIComponent(path)}`, {
    headers: { 'x-github-token': config.token },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  return res.json();
}

async function jiraFetch(config: JiraConfig, path: string) {
  const res = await fetch(`/api/integrations/jira?domain=${config.domain}&project=${config.projectKey}&path=${encodeURIComponent(path)}`, {
    headers: {
      'x-jira-email': config.email,
      'x-jira-token': config.token,
    },
  });
  if (!res.ok) throw new Error(`Jira API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  connections: {},
  liveData: {},
  syncing: false,
  lastError: null,
  featureChecks: [],
  confluencePages: [],
  confluenceSpaceId: null,

  isConnected: (provider) => !!get().connections[provider]?.connected,

  getGitHubConfig: () => {
    const conn = get().connections['github'];
    if (!conn || !conn.connected) return null;
    return conn.config as GitHubConfig;
  },

  getJiraConfig: () => {
    const conn = get().connections['jira'];
    if (!conn || !conn.connected) return null;
    return conn.config as JiraConfig;
  },

  getConfluenceConfig: () => {
    const conn = get().connections['confluence'];
    if (!conn || !conn.connected) return null;
    return conn.config as ConfluenceConfig;
  },

  clearError: () => set({ lastError: null }),

  connectGitHub: async (config) => {
    set({ syncing: true, lastError: null });
    try {
      // Verify connection by fetching repo info
      const res = await fetch(`/api/integrations/github/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Could not verify GitHub connection');
      set((s) => ({
        connections: {
          ...s.connections,
          github: { provider: 'github', connected: true, config, lastSync: new Date().toISOString() },
        },
      }));
      await get().syncGitHub();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'GitHub connection failed';
      set((s) => ({
        connections: { ...s.connections, github: { provider: 'github', connected: false, config, error: msg } },
        lastError: msg,
      }));
    } finally {
      set({ syncing: false });
    }
  },

  connectJira: async (config) => {
    set({ syncing: true, lastError: null });
    try {
      const res = await fetch(`/api/integrations/jira/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Could not verify Jira connection');
      set((s) => ({
        connections: {
          ...s.connections,
          jira: { provider: 'jira', connected: true, config, lastSync: new Date().toISOString() },
        },
      }));
      await get().syncJira();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Jira connection failed';
      set((s) => ({
        connections: { ...s.connections, jira: { provider: 'jira', connected: false, config, error: msg } },
        lastError: msg,
      }));
    } finally {
      set({ syncing: false });
    }
  },

  connectConfluence: async (config) => {
    set({ syncing: true, lastError: null });
    try {
      const res = await fetch('/api/integrations/confluence/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Could not verify Confluence connection');
      const data = await res.json() as any;
      set((s) => ({
        connections: {
          ...s.connections,
          confluence: { provider: 'confluence', connected: true, config, lastSync: new Date().toISOString() },
        },
        confluenceSpaceId: data.id,
      }));
      await get().fetchConfluencePages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Confluence connection failed';
      set((s) => ({
        connections: { ...s.connections, confluence: { provider: 'confluence', connected: false, config, error: msg } },
        lastError: msg,
      }));
    } finally {
      set({ syncing: false });
    }
  },

  fetchConfluencePages: async () => {
    const config = get().getConfluenceConfig();
    const spaceId = get().confluenceSpaceId;
    if (!config || !spaceId) return;
    try {
      const res = await fetch(`/api/integrations/confluence/pages?domain=${config.domain}&spaceId=${spaceId}`, {
        headers: {
          'x-confluence-email': config.email,
          'x-confluence-token': config.token,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pages');
      const pages = await res.json();
      set({ confluencePages: pages });
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : 'Failed to fetch Confluence pages' });
    }
  },

  fetchConfluencePageContent: async (pageId: string) => {
    const config = get().getConfluenceConfig();
    if (!config) return null;
    try {
      const res = await fetch(`/api/integrations/confluence/page/${pageId}?domain=${config.domain}`, {
        headers: {
          'x-confluence-email': config.email,
          'x-confluence-token': config.token,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch page content');
      return await res.json();
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : 'Failed to fetch page content' });
      return null;
    }
  },

  disconnect: (provider) => {
    set((s) => {
      const conns = { ...s.connections };
      delete conns[provider];
      return { connections: conns };
    });
  },

  syncGitHub: async () => {
    const config = get().getGitHubConfig();
    if (!config) return;
    set({ syncing: true });
    try {
      const [releases, issues, runs] = await Promise.all([
        ghFetch(config, 'releases'),
        ghFetch(config, 'issues'),
        ghFetch(config, 'actions/runs'),
      ]);

      const openIssues: GitHubIssue[] = (issues || []).filter((i: GitHubIssue) => !i.pull_request);
      const recentPRs: GitHubIssue[] = (issues || []).filter((i: GitHubIssue) => !!i.pull_request);
      const workflowRuns: GitHubWorkflowRun[] = (runs?.workflow_runs || []).slice(0, 10);

      // Build deployment status from latest release + latest run
      const latestRelease: GitHubRelease | undefined = releases?.[0];
      const latestRun: GitHubWorkflowRun | undefined = workflowRuns[0];
      const deployment: DeploymentStatus | undefined = latestRelease ? {
        provider: 'github',
        environment: 'production',
        version: latestRelease.tag_name,
        deployedAt: latestRelease.published_at,
        status: latestRun?.conclusion === 'success' ? 'success' : latestRun?.conclusion === 'failure' ? 'failure' : 'unknown',
      } : undefined;

      set((s) => ({
        liveData: {
          ...s.liveData,
          github: { releases: releases || [], openIssues, recentPRs, workflowRuns, deployment },
        },
        connections: {
          ...s.connections,
          github: { ...s.connections['github'], lastSync: new Date().toISOString() },
        },
      }));
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : 'GitHub sync failed' });
    } finally {
      set({ syncing: false });
    }
  },

  syncJira: async () => {
    const config = get().getJiraConfig();
    if (!config) return;
    set({ syncing: true });
    try {
      const [sprintData, issueData] = await Promise.all([
        jiraFetch(config, 'sprint/active'),
        jiraFetch(config, 'issues/open'),
      ]);
      set((s) => ({
        liveData: {
          ...s.liveData,
          jira: {
            activeSprint: sprintData,
            openIssues: issueData?.issues || [],
            recentlyDone: issueData?.done || [],
          },
        },
        connections: {
          ...s.connections,
          jira: { ...s.connections['jira'], lastSync: new Date().toISOString() },
        },
      }));
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : 'Jira sync failed' });
    } finally {
      set({ syncing: false });
    }
  },

  syncAll: async () => {
    await Promise.all([get().syncGitHub(), get().syncJira()]);
  },

  verifyFeature: async (feature: string): Promise<FeatureVerification> => {
    const { liveData } = get();
    const releases = liveData.github?.releases || [];

    // Search release notes for feature mention
    const featureLower = feature.toLowerCase();
    let foundRelease: GitHubRelease | null = null;
    let evidence = '';

    for (const release of releases) {
      const body = (release.body || '').toLowerCase();
      const name = (release.name || '').toLowerCase();
      if (body.includes(featureLower) || name.includes(featureLower)) {
        foundRelease = release;
        // Extract relevant snippet
        const idx = body.indexOf(featureLower);
        evidence = release.body.substring(Math.max(0, idx - 50), idx + 100);
        break;
      }
    }

    if (foundRelease) {
      const result: FeatureVerification = {
        feature,
        foundInVersion: foundRelease.tag_name,
        mentionedInRelease: foundRelease.name,
        confidence: 'confirmed',
        evidence: `Found in ${foundRelease.tag_name}: "...${evidence}..."`,
      };
      set((s) => ({ featureChecks: [result, ...s.featureChecks.slice(0, 9)] }));
      return result;
    }

    const result: FeatureVerification = {
      feature,
      foundInVersion: null,
      mentionedInRelease: null,
      confidence: 'not_found',
      evidence: `"${feature}" was not found in the last ${releases.length} releases.`,
    };
    set((s) => ({ featureChecks: [result, ...s.featureChecks.slice(0, 9)] }));
    return result;
  },
}));
