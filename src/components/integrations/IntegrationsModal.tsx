import React, { useState } from 'react';
import { X, Github, Zap, RefreshCw, CheckCircle, AlertCircle, Clock, ExternalLink, Search, Shield, Wifi, WifiOff } from 'lucide-react';
import { useIntegrationsStore } from '../../store/useIntegrationsStore';
import { useThemeStore } from '../../store/useThemeStore';
import type { GitHubConfig, JiraConfig } from '../../types/integrations';

interface Props {
  onClose: () => void;
}

type Tab = 'github' | 'jira' | 'live' | 'verify';

export const IntegrationsModal: React.FC<Props> = ({ onClose }) => {
  const { isDarkMode } = useThemeStore();
  const {
    connections, liveData, syncing, lastError, featureChecks,
    connectGitHub, connectJira, disconnect, syncAll, verifyFeature, isConnected, clearError,
  } = useIntegrationsStore();

  const [tab, setTab] = useState<Tab>('github');
  const [ghForm, setGhForm] = useState<GitHubConfig>({ token: '', owner: '', repo: '' });
  const [jiraForm, setJiraForm] = useState<JiraConfig>({ domain: '', email: '', token: '', projectKey: '' });
  const [verifyInput, setVerifyInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const ghConnected = isConnected('github');
  const jiraConnected = isConnected('jira');
  const ghConn = connections['github'];
  const jiraConn = connections['jira'];

  const handleConnectGitHub = async () => {
    clearError();
    await connectGitHub(ghForm);
  };

  const handleConnectJira = async () => {
    clearError();
    await connectJira(jiraForm);
  };

  const handleVerify = async () => {
    if (!verifyInput.trim()) return;
    setVerifying(true);
    await verifyFeature(verifyInput.trim());
    setVerifying(false);
  };

  const base = isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
  const inputCls = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'}`;
  const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const btnPrimary = 'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2';
  const btnDanger = 'px-3 py-1.5 bg-red-600/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-600/20 transition-colors';

  const TAB_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'github', label: 'GitHub', icon: <Github size={15} /> },
    { id: 'jira', label: 'Jira', icon: <Zap size={15} /> },
    { id: 'live', label: 'Live Data', icon: <RefreshCw size={15} /> },
    { id: 'verify', label: 'Verify Feature', icon: <Search size={15} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${base}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Integrations</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Connect GitHub, Jira & live project data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(ghConnected || jiraConnected) && (
              <button
                onClick={() => syncAll()}
                disabled={syncing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing…' : 'Sync All'}
              </button>
            )}
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className={`flex gap-3 px-6 py-2 border-b text-xs ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-1.5">
            {ghConnected ? <CheckCircle size={12} className="text-green-500" /> : <WifiOff size={12} className="text-slate-400" />}
            <span className={ghConnected ? 'text-green-600 font-semibold' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
              GitHub {ghConnected ? `(${ghConn?.config ? (ghConn.config as GitHubConfig).owner + '/' + (ghConn.config as GitHubConfig).repo : ''})` : 'not connected'}
            </span>
          </div>
          <span className={isDarkMode ? 'text-slate-700' : 'text-slate-200'}>|</span>
          <div className="flex items-center gap-1.5">
            {jiraConnected ? <CheckCircle size={12} className="text-green-500" /> : <WifiOff size={12} className="text-slate-400" />}
            <span className={jiraConnected ? 'text-green-600 font-semibold' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
              Jira {jiraConnected ? `(${(jiraConn?.config as JiraConfig)?.projectKey})` : 'not connected'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 px-6 pt-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          {TAB_ITEMS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                  : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {lastError && (
            <div className="flex gap-2 items-start p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Connection Error</span>
                {lastError}
              </div>
              <button onClick={clearError} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          {/* ── GitHub Tab ── */}
          {tab === 'github' && (
            <div className="space-y-4">
              {ghConnected ? (
                <div className={`rounded-xl p-4 border ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="font-semibold text-green-600">Connected</span>
                    </div>
                    <button onClick={() => disconnect('github')} className={btnDanger}>Disconnect</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className={labelCls}>Repository</div>
                      <code className="text-sm">{(ghConn.config as GitHubConfig).owner}/{(ghConn.config as GitHubConfig).repo}</code>
                    </div>
                    <div>
                      <div className={labelCls}>Last Sync</div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {ghConn.lastSync ? new Date(ghConn.lastSync).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-blue-950/30 border-blue-800' : 'bg-blue-50 border-blue-200'} flex gap-3`}>
                    <Shield size={16} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Your token is only sent to this app's backend proxy — never stored permanently or exposed to the browser. Use a
                      <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline mx-1">fine-grained personal access token</a>
                      with <strong>read-only</strong> access to Contents, Issues, Metadata, and Actions.
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Personal Access Token</label>
                    <input type="password" className={inputCls} placeholder="ghp_xxxxxxxxxxxx"
                      value={ghForm.token} onChange={e => setGhForm(f => ({ ...f, token: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Owner (user or org)</label>
                      <input className={inputCls} placeholder="octocat"
                        value={ghForm.owner} onChange={e => setGhForm(f => ({ ...f, owner: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Repository name</label>
                      <input className={inputCls} placeholder="my-project"
                        value={ghForm.repo} onChange={e => setGhForm(f => ({ ...f, repo: e.target.value }))} />
                    </div>
                  </div>
                  <button
                    className={btnPrimary}
                    disabled={!ghForm.token || !ghForm.owner || !ghForm.repo || syncing}
                    onClick={handleConnectGitHub}
                  >
                    <Github size={15} />
                    {syncing ? 'Connecting…' : 'Connect GitHub'}
                  </button>
                </div>
              )}

              {/* Quick stats from live data */}
              {ghConnected && liveData.github && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Releases', value: liveData.github.releases.length, color: '#8b5cf6' },
                    { label: 'Open Issues', value: liveData.github.openIssues.length, color: '#ef4444' },
                    { label: 'Workflow Runs', value: liveData.github.workflowRuns.length, color: '#3b82f6' },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl p-3 border ${cardBg} text-center`}>
                      <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                      <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Latest release */}
              {ghConnected && liveData.github?.deployment && (
                <div className={`rounded-xl p-4 border ${cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Latest Release</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${liveData.github.deployment.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {liveData.github.deployment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className={`text-sm font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      {liveData.github.deployment.version}
                    </code>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(liveData.github.deployment.deployedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Jira Tab ── */}
          {tab === 'jira' && (
            <div className="space-y-4">
              {jiraConnected ? (
                <div className={`rounded-xl p-4 border ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="font-semibold text-green-600">Connected</span>
                    </div>
                    <button onClick={() => disconnect('jira')} className={btnDanger}>Disconnect</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className={labelCls}>Domain</div>
                      <code className="text-sm">{(jiraConn.config as JiraConfig).domain}</code>
                    </div>
                    <div>
                      <div className={labelCls}>Project Key</div>
                      <code className="text-sm font-bold">{(jiraConn.config as JiraConfig).projectKey}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-blue-950/30 border-blue-800' : 'bg-blue-50 border-blue-200'} flex gap-3`}>
                    <Shield size={16} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Create an API token at <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">Atlassian Account Settings</a>.
                      Tokens are proxied through the backend and never stored.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>Atlassian Domain</label>
                    <input className={inputCls} placeholder="yourcompany.atlassian.net"
                      value={jiraForm.domain} onChange={e => setJiraForm(f => ({ ...f, domain: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Email</label>
                      <input className={inputCls} placeholder="you@company.com" type="email"
                        value={jiraForm.email} onChange={e => setJiraForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Project Key</label>
                      <input className={inputCls} placeholder="MYPROJ"
                        value={jiraForm.projectKey} onChange={e => setJiraForm(f => ({ ...f, projectKey: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>API Token</label>
                    <input type="password" className={inputCls} placeholder="ATATT…"
                      value={jiraForm.token} onChange={e => setJiraForm(f => ({ ...f, token: e.target.value }))} />
                  </div>
                  <button
                    className={btnPrimary}
                    disabled={!jiraForm.domain || !jiraForm.email || !jiraForm.token || !jiraForm.projectKey || syncing}
                    onClick={handleConnectJira}
                  >
                    <Zap size={15} />
                    {syncing ? 'Connecting…' : 'Connect Jira'}
                  </button>
                </div>
              )}

              {jiraConnected && liveData.jira && (
                <div className="space-y-3">
                  {liveData.jira.activeSprint && (
                    <div className={`rounded-xl p-4 border ${cardBg}`}>
                      <div className="font-semibold text-sm mb-1">Active Sprint</div>
                      <div className="font-bold">{liveData.jira.activeSprint.name}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {liveData.jira.activeSprint.startDate} → {liveData.jira.activeSprint.endDate}
                      </div>
                    </div>
                  )}
                  <div className={`rounded-xl p-4 border ${cardBg}`}>
                    <div className="font-semibold text-sm mb-2">Open Issues ({liveData.jira.openIssues.length})</div>
                    <div className="space-y-1">
                      {liveData.jira.openIssues.slice(0, 5).map((issue) => (
                        <div key={issue.key} className="flex items-center gap-2 text-sm">
                          <code className={`text-xs px-1 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{issue.key}</code>
                          <span className="flex-1 truncate">{issue.summary}</span>
                          <a href={issue.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={11} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Live Data Tab ── */}
          {tab === 'live' && (
            <div className="space-y-4">
              {!ghConnected && !jiraConnected ? (
                <div className={`rounded-xl p-6 border-2 border-dashed text-center ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  <WifiOff size={32} className="mx-auto mb-3 opacity-40" />
                  <div className="font-semibold mb-1">No integrations connected</div>
                  <p className="text-sm">Connect GitHub or Jira to see live project data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ghConnected && liveData.github && (
                    <>
                      <h3 className="font-bold text-sm uppercase tracking-wide opacity-60">GitHub — Recent Workflow Runs</h3>
                      <div className="space-y-1.5">
                        {liveData.github.workflowRuns.slice(0, 6).map((run) => (
                          <div key={run.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cardBg}`}>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${run.conclusion === 'success' ? 'bg-green-500' : run.conclusion === 'failure' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{run.name}</div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{run.head_branch}</div>
                            </div>
                            <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                              <ExternalLink size={13} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Verify Feature Tab ── */}
          {tab === 'verify' && (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-purple-950/30 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  <strong>AI Feature Verification</strong> — Enter a feature name and the AI will search your GitHub release notes to determine if it's been shipped in the current deployed version.
                </p>
              </div>

              {!ghConnected && (
                <div className={`rounded-xl p-4 border-2 border-dashed text-center text-sm ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  Connect GitHub first to verify features.
                </div>
              )}

              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="e.g. dark mode, OAuth login, bulk export…"
                  value={verifyInput}
                  onChange={e => setVerifyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  disabled={!ghConnected}
                />
                <button
                  className={btnPrimary}
                  onClick={handleVerify}
                  disabled={!ghConnected || !verifyInput.trim() || verifying}
                >
                  <Search size={14} />
                  {verifying ? 'Checking…' : 'Verify'}
                </button>
              </div>

              {featureChecks.length > 0 && (
                <div className="space-y-2">
                  <h3 className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Results</h3>
                  {featureChecks.map((fc, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-4 border ${cardBg}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {fc.confidence === 'confirmed'
                          ? <CheckCircle size={15} className="text-green-500" />
                          : fc.confidence === 'likely'
                          ? <AlertCircle size={15} className="text-yellow-500" />
                          : <X size={15} className="text-red-500" />
                        }
                        <span className="font-semibold">{fc.feature}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                          fc.confidence === 'confirmed' ? 'bg-green-100 text-green-700' :
                          fc.confidence === 'likely' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {fc.confidence === 'confirmed' ? 'Confirmed' : fc.confidence === 'likely' ? 'Likely' : 'Not Found'}
                        </span>
                      </div>
                      {fc.foundInVersion && (
                        <div className="flex items-center gap-2">
                          <code className={`text-xs px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>{fc.foundInVersion}</code>
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{fc.mentionedInRelease}</span>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{fc.evidence}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
