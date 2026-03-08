// ─── Integration connection configs ───────────────────────────────────────────

export type IntegrationProvider = 'github' | 'gitlab' | 'jira' | 'confluence';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface GitLabConfig {
  token: string;
  baseUrl: string; // e.g. https://gitlab.com
  projectId: string;
}

export interface JiraConfig {
  domain: string; // e.g. mycompany.atlassian.net
  email: string;
  token: string;
  projectKey: string;
}

export interface ConfluenceConfig {
  domain: string; // e.g. mycompany.atlassian.net
  email: string;
  token: string;
  spaceKey: string;
}

export interface ConfluencePage {
  id: string;
  title: string;
  status: string;
  lastModified: string;
}

// ─── Live data shapes returned from integrations ──────────────────────────────

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  assignee: string | null;
  created_at: string;
  html_url: string;
  pull_request?: { merged_at: string | null };
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  created_at: string;
  html_url: string;
  head_branch: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string | null;
  storyPoints?: number;
  issueType: string;
  url: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string;
  endDate: string;
  issues: JiraIssue[];
}

export interface DeploymentStatus {
  provider: IntegrationProvider;
  environment: string;
  version: string;
  deployedAt: string;
  status: 'success' | 'failure' | 'in_progress' | 'unknown';
  commitSha?: string;
  commitMessage?: string;
}

export interface FeatureVerification {
  feature: string;
  foundInVersion: string | null;
  mentionedInRelease: string | null;
  confidence: 'confirmed' | 'likely' | 'not_found';
  evidence: string;
}

// ─── Integration store state ──────────────────────────────────────────────────

export interface IntegrationConnection {
  provider: IntegrationProvider;
  connected: boolean;
  error?: string;
  lastSync?: string;
  config: GitHubConfig | GitLabConfig | JiraConfig | ConfluenceConfig;
}

export interface IntegrationLiveData {
  github?: {
    releases: GitHubRelease[];
    openIssues: GitHubIssue[];
    recentPRs: GitHubIssue[];
    workflowRuns: GitHubWorkflowRun[];
    deployment?: DeploymentStatus;
  };
  jira?: {
    activeSprint?: JiraSprint;
    openIssues: JiraIssue[];
    recentlyDone: JiraIssue[];
  };
  gitlab?: {
    releases: GitHubRelease[];
    openIssues: GitHubIssue[];
    pipelines: GitHubWorkflowRun[];
    deployment?: DeploymentStatus;
  };
}

// ─── Brand Kit ────────────────────────────────────────────────────────────────

export interface BrandKit {
  companyName: string;
  tagline: string;
  logoBase64?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  presentationTheme: 'corporate' | 'modern' | 'minimal' | 'bold' | 'dark';
}
