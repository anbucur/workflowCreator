import React, { useEffect, useRef } from 'react';
import { useAiChatStore } from '../../store/useAiChatStore';
import { useUiStore } from '../../store/useUiStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Bot, ChevronRight, Eraser, Sparkles, AlertCircle } from 'lucide-react';

export const AiChatPanel: React.FC = () => {
    const { messages, isStreaming, error, sendMessage, clearHistory } = useAiChatStore();
    const aiPanelOpen = useUiStore((s) => s.aiPanelOpen);
    const setAiPanelOpen = useUiStore((s) => s.setAiPanelOpen);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    if (!aiPanelOpen) return null;

    const examplePrompts = [
        "Create a software development workflow with 4 phases",
        "Change all step colors to match their phases",
        "Add a QA role and assign it to all testing steps",
        "Apply the monochrome-slate theme",
    ];

    return (
        <div className="w-[400px] border-l border-slate-200 bg-slate-50 flex flex-col h-full shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-40 relative">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <Bot size={18} />
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Clear chat history"
                        >
                            <Eraser size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setAiPanelOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
                        <h3 className="text-lg font-bold text-slate-800 mb-2">How can I help you build?</h3>
                        <p className="text-sm text-slate-500 mb-8">
                            I can create workflows, add steps, change themes, or modify any aspect of your infographic.
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                            {examplePrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="text-left text-sm p-3 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-600 hover:text-purple-700 transition-colors flex items-start gap-2 group"
                                >
                                    <Sparkles size={14} className="mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span className="leading-snug">{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))
                )}

                {isStreaming && (
                    <div className="flex gap-3 max-w-[90%]">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-tl-sm rounded-2xl px-4 py-3 shadow-sm h-10 w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-semibold block mb-0.5">Connection Error</span>
                        {error}
                    </div>
                </div>
            )}

            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <ChatInput onSend={sendMessage} disabled={isStreaming} />
                <div className="mt-2 text-[11px] text-center text-slate-400 font-medium tracking-wide">
                    AI uses Claude Sonnet 3.5. Press Ctrl+Z to undo changes.
                </div>
            </div>
        </div>
    );
};
