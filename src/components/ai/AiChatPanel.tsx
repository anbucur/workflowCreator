import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAiChatStore } from '../../store/useAiChatStore';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useIntegrationsStore } from '../../store/useIntegrationsStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { DocumentUpload } from './DocumentUpload';
import { ConfluencePagePicker } from './ConfluencePagePicker';
import { Bot, ChevronRight, Eraser, Sparkles, AlertCircle, Square, PlusCircle, Settings, Palette, BarChart3, Zap, Github, BookOpen, Globe, ChevronDown } from 'lucide-react';

interface PromptCategory {
    label: string;
    icon: React.FC<{ size?: number }>;
    prompts: string[];
}

const baseCategories: PromptCategory[] = [
    {
        label: 'Create',
        icon: PlusCircle,
        prompts: [
            'Create a software development workflow with 4 phases',
            'Build an executive dashboard with KPIs and deployment status',
            'Create a product roadmap with Q1-Q4 items for 2025',
        ],
    },
    {
        label: 'Manage',
        icon: Settings,
        prompts: [
            'Add a sprint board for the current development cycle',
            'Create an OKR tracker for Q1 company goals',
            'Add roles for a dev team (PM, Dev, QA, Design)',
        ],
    },
    {
        label: 'Dashboards',
        icon: BarChart3,
        prompts: [
            'Create a project management dashboard with KPIs and sprint tracking',
            'Build a release management workflow with deployment status',
            'Generate a team performance dashboard with OKRs and metrics',
        ],
    },
    {
        label: 'Style',
        icon: Palette,
        prompts: [
            'Apply the midnight-neon theme',
            'Make it more colorful with the berry-blast theme',
            'Change the layout to vertical',
        ],
    },
];

const quickActions = [
    'Add a phase',
    'Add a step',
    'Apply theme',
    'Add connector',
    'Change layout',
    'Add role',
];

const docPrompts = [
    'Summarize this document into key phases',
    'Create a checklist from the action items',
    'Build a project roadmap from this data',
    'Extract metrics and create a KPI dashboard',
];

export const AiChatPanel: React.FC = () => {
    const { messages, isStreaming, error, sendMessage, stopGeneration, clearHistory, regenerateLastMessage, selectedModel, setSelectedModel, documentContext, webSearchEnabled, toggleWebSearch, webSearchProvider, setWebSearchProvider, braveApiKey, setBraveApiKey, aiEditContext, clearAiEditContext } = useAiChatStore();
    const aiPanelOpen = useUiStore((s) => s.aiPanelOpen);
    const setAiPanelOpen = useUiStore((s) => s.setAiPanelOpen);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const jiraConnected = useIntegrationsStore((s) => s.isConnected('jira'));
    const ghConnected = useIntegrationsStore((s) => s.isConnected('github'));
    const confConnected = useIntegrationsStore((s) => s.isConnected('confluence'));
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showConfPicker, setShowConfPicker] = useState(false);
    const [showSearchSettings, setShowSearchSettings] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    // Handle AI edit context - auto-send the message when edit context is set
    useEffect(() => {
        if (aiEditContext) {
            const prompt = `Edit the step "${aiEditContext.stepTitle}" (ID: ${aiEditContext.stepId}): ${aiEditContext.userPrompt}`;
            clearAiEditContext();
            sendMessage(prompt);
        }
    }, [aiEditContext]);

    // Build dynamic prompt categories based on connected integrations
    const promptCategories = useMemo(() => {
        const cats: PromptCategory[] = [...baseCategories];

        if (webSearchEnabled) {
            cats.push({
                label: 'Research',
                icon: Globe,
                prompts: [
                    'Research best practices for agile sprint planning and create a workflow',
                    'Find the latest CI/CD pipeline trends and build a deployment workflow',
                    'Look up OKR frameworks and create a goal-tracking dashboard',
                ],
            });
        }
        if (jiraConnected) {
            cats.push({
                label: 'From Jira',
                icon: Zap,
                prompts: [
                    'Generate a dashboard from my Jira sprint data',
                    'Create a kanban board with my open Jira issues',
                    'Show the current sprint as a workflow',
                ],
            });
        }
        if (ghConnected) {
            cats.push({
                label: 'From GitHub',
                icon: Github,
                prompts: [
                    'Create a release timeline from GitHub releases',
                    'Build a deployment status dashboard from CI/CD runs',
                    'Show open issues as a kanban board',
                ],
            });
        }
        if (confConnected) {
            cats.push({
                label: 'From Confluence',
                icon: BookOpen,
                prompts: [
                    'Import a Confluence page and create a workflow from it',
                    'Analyze the attached document and extract action items',
                    'Build a process diagram from the Confluence content',
                ],
            });
        }

        return cats;
    }, [jiraConnected, ghConnected, confConnected, webSearchEnabled]);

    if (!aiPanelOpen) return null;

    // Find the last assistant message index for the regenerate button
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            lastAssistantIndex = i;
            break;
        }
    }

    const handleAutoGenerate = () => {
        sendMessage('Analyze the attached document and create a comprehensive workflow infographic based on its content. Identify the key phases, steps, roles, and relationships.');
    };

    return (
        <div className={`w-[400px] border-l flex flex-col h-full shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-40 relative transition-colors duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <header className={`h-14 flex items-center justify-between px-4 shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <Bot size={18} />
                    </div>
                    <span className={`font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`text-xs border rounded px-2 py-1 focus:outline-none focus:border-purple-300 mr-1 transition-colors duration-300 ${isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                        title="Select AI Model"
                    >
                        <option value="k2p5">Kimi (Default)</option>
                        <option value="zai">z.ai</option>
                        <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                    </select>
                    {messages.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                            title="Clear chat history"
                        >
                            <Eraser size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setAiPanelOpen(false)}
                        className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-[340px] mx-auto opacity-80 mt-8">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-5 shrink-0">
                            <Bot size={32} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>How can I help you build?</h3>
                        <p className={`text-sm mb-6 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            I can create workflows, add steps, change themes, analyze documents, or build dashboards from your integrations.
                        </p>

                        {/* Document-aware action buttons when a doc is loaded */}
                        {documentContext && (
                            <div className="w-full mb-4 flex flex-col gap-2">
                                <button
                                    onClick={handleAutoGenerate}
                                    className={`w-full text-sm py-2.5 px-4 rounded-xl font-semibold transition-colors ${isDarkMode
                                        ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700'
                                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                                    }`}
                                >
                                    <Sparkles size={14} className="inline mr-2" />
                                    Analyze & Generate Workflow
                                </button>
                                <div className="flex flex-col gap-1.5">
                                    {docPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => sendMessage(prompt)}
                                            className={`text-left text-xs p-2 rounded-lg border transition-colors ${isDarkMode
                                                ? 'bg-slate-800 border-slate-700 hover:bg-purple-900/20 hover:border-purple-700 text-slate-400 hover:text-purple-400'
                                                : 'bg-white border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-500 hover:text-purple-600'
                                            }`}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* One-click dashboard buttons for connected integrations */}
                        {(jiraConnected || ghConnected) && !documentContext && (
                            <div className="w-full mb-4 flex flex-col gap-2">
                                {jiraConnected && (
                                    <button
                                        onClick={() => sendMessage('Fetch my Jira data and generate a comprehensive project dashboard with sprint board, kanban, KPIs, and roadmap.')}
                                        className={`w-full flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl font-semibold transition-colors ${isDarkMode
                                            ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-700'
                                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                        }`}
                                    >
                                        <Zap size={14} />
                                        Generate Jira Dashboard
                                    </button>
                                )}
                                {ghConnected && (
                                    <button
                                        onClick={() => sendMessage('Fetch my GitHub data and generate a dashboard with release timeline, deployment status, and issue kanban board.')}
                                        className={`w-full flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl font-semibold transition-colors ${isDarkMode
                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                        }`}
                                    >
                                        <Github size={14} />
                                        Generate GitHub Dashboard
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 w-full text-left">
                            {promptCategories.map((category) => (
                                <div key={category.label}>
                                    <div className={`flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <category.icon size={12} />
                                        <span>{category.label}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {category.prompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => sendMessage(prompt)}
                                                className={`text-left text-sm p-2.5 rounded-xl border transition-colors flex items-start gap-2 group ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-purple-900/20 hover:border-purple-700 text-slate-300 hover:text-purple-400' : 'bg-white border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-600 hover:text-purple-700'}`}
                                            >
                                                <Sparkles size={13} className="mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                <span className="leading-snug">{prompt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                            isLastAssistant={index === lastAssistantIndex}
                            onRegenerate={regenerateLastMessage}
                        />
                    ))
                )}

                {isStreaming && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                    <div className="flex gap-3 max-w-[90%]">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className={`flex items-center gap-1.5 border rounded-tl-sm rounded-2xl px-4 py-3 shadow-sm h-10 w-fit transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className={`mx-4 mb-2 p-3 border rounded-lg flex gap-3 text-sm transition-colors duration-300 ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-semibold block mb-0.5">Connection Error</span>
                        {error}
                    </div>
                </div>
            )}

            <div className={`border-t shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {/* Quick action chips — shown after first message exchange */}
                {messages.length > 0 && !isStreaming && (
                    <div className="px-4 pt-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide">
                        {quickActions.map((action) => (
                            <button
                                key={action}
                                onClick={() => sendMessage(action)}
                                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors whitespace-nowrap ${isDarkMode
                                    ? 'border-slate-600 text-slate-400 hover:border-purple-600 hover:text-purple-400 hover:bg-purple-900/20'
                                    : 'border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                {/* Document upload + input area */}
                <div className="p-4 pt-2 flex flex-col gap-2">
                    <DocumentUpload onPickConfluence={() => setShowConfPicker(true)} />

                    {/* Web search toggle + settings */}
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={toggleWebSearch}
                            title={webSearchEnabled ? 'Web search enabled — click to disable' : 'Enable web search'}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                                webSearchEnabled
                                    ? isDarkMode
                                        ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400 hover:border-slate-600'
                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                            }`}
                        >
                            <Globe size={13} />
                            <span>Web Search</span>
                            {webSearchEnabled && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                            )}
                        </button>

                        {webSearchEnabled && (
                            <button
                                onClick={() => setShowSearchSettings(!showSearchSettings)}
                                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-600'
                                }`}
                            >
                                <span>{webSearchProvider === 'brave' ? 'Brave' : 'DuckDuckGo'}</span>
                                <ChevronDown size={11} />
                            </button>
                        )}

                        {/* Search provider settings dropdown */}
                        {showSearchSettings && webSearchEnabled && (
                            <div className={`absolute bottom-full left-0 mb-1 w-72 rounded-xl shadow-xl border p-3 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Search Provider</div>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => setWebSearchProvider('duckduckgo')}
                                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-colors ${webSearchProvider === 'duckduckgo'
                                            ? isDarkMode ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                            : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        DuckDuckGo (Free)
                                    </button>
                                    <button
                                        onClick={() => setWebSearchProvider('brave')}
                                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-colors ${webSearchProvider === 'brave'
                                            ? isDarkMode ? 'bg-orange-900/30 border-orange-700 text-orange-400' : 'bg-orange-50 border-orange-300 text-orange-700'
                                            : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        Brave (API Key)
                                    </button>
                                </div>
                                {webSearchProvider === 'brave' && (
                                    <div>
                                        <label className={`text-xs font-medium block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Brave API Key</label>
                                        <input
                                            type="password"
                                            value={braveApiKey}
                                            onChange={(e) => setBraveApiKey(e.target.value)}
                                            placeholder="BSA..."
                                            className={`w-full text-xs px-3 py-2 rounded-lg border outline-none focus:ring-1 ${isDarkMode
                                                ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600 focus:ring-orange-500'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-orange-400'
                                            }`}
                                        />
                                        <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Free at brave.com/search/api — 2K queries/month
                                        </p>
                                    </div>
                                )}
                                {webSearchProvider === 'duckduckgo' && (
                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No API key required. Results may vary.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {isStreaming ? (
                        <button
                            onClick={stopGeneration}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors ${isDarkMode ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
                        >
                            <Square size={14} className="fill-current" />
                            Stop Generating
                        </button>
                    ) : (
                        <ChatInput onSend={sendMessage} disabled={isStreaming} />
                    )}
                    <div className={`mt-1 text-[11px] text-center font-medium tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        AI uses {selectedModel === 'zai' ? 'z.ai' : selectedModel === 'k2p5' ? 'Kimi' : 'Claude Sonnet 3.5'}{webSearchEnabled ? ` + ${webSearchProvider === 'brave' ? 'Brave' : 'DDG'} Search` : ''}. Ctrl+Z to undo.
                    </div>
                </div>
            </div>

            {/* Confluence page picker modal */}
            {showConfPicker && <ConfluencePagePicker onClose={() => setShowConfPicker(false)} />}
        </div>
    );
};
