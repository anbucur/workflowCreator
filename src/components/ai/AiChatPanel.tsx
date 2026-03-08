import React, { useEffect, useRef } from 'react';
import { useAiChatStore } from '../../store/useAiChatStore';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Bot, ChevronRight, Eraser, Sparkles, AlertCircle } from 'lucide-react';

export const AiChatPanel: React.FC = () => {
    const { messages, isStreaming, error, sendMessage, clearHistory, selectedModel, setSelectedModel } = useAiChatStore();
    const aiPanelOpen = useUiStore((s) => s.aiPanelOpen);
    const setAiPanelOpen = useUiStore((s) => s.setAiPanelOpen);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    if (!aiPanelOpen) return null;

    const examplePrompts = [
        "Create a software development workflow with 4 phases",
        "Build an executive dashboard with KPIs and deployment status",
        "Create a product roadmap with Q1-Q4 items for 2025",
        "Add a sprint board for the current development cycle",
        "Create an OKR tracker for Q1 company goals",
    ];

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
                        <option value="zai">z.ai (Default)</option>
                        <option value="claude-sonnet-4-6">Claude 3.5 Sonnet</option>
                        <option value="k2p5">Kimi (k2p5)</option>
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
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-[320px] mx-auto opacity-80 mt-12">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-6 shrink-0">
                            <Bot size={32} />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>How can I help you build?</h3>
                        <p className={`text-sm mb-8 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            I can create workflows, add steps, change themes, or modify any aspect of your infographic.
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                            {examplePrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className={`text-left text-sm p-3 rounded-xl border transition-colors flex items-start gap-2 group ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-purple-900/20 hover:border-purple-700 text-slate-300 hover:text-purple-400' : 'bg-white border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-600 hover:text-purple-700'}`}
                                >
                                    <Sparkles size={14} className="mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span className="leading-snug">{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
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

            <div className={`p-4 border-t shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <ChatInput onSend={sendMessage} disabled={isStreaming} />
                <div className={`mt-2 text-[11px] text-center font-medium tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    AI uses {selectedModel === 'zai' ? 'z.ai' : selectedModel === 'k2p5' ? 'Kimi' : 'Claude Sonnet 3.5'}. Press Ctrl+Z to undo changes.
                </div>
            </div>
        </div>
    );
};
