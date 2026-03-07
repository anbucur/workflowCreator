import React from 'react';
import { getToolLabel } from '../../ai/toolExecutor';
import type { ChatMessage, ToolCall } from '../../ai/types';
import { Bot, User, CheckCircle2, XCircle, Wrench, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useThemeStore } from '../../store/useThemeStore';

interface MessageBubbleProps {
    message: ChatMessage;
    isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
    const isUser = message.role === 'user';
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    return (
        <div className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                {(message.content || isStreaming) && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-full ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                        }`}
                    >
                        {isStreaming && !message.content ? (
                            <div className="flex items-center gap-1.5 h-5">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        ) : (
                            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : isDarkMode ? 'prose-invert prose-slate' : ''}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}

                {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        {(message.toolCalls as ToolCall[]).map((tc, index) => (
                            <ToolCallItem key={tc.id} toolCall={tc} index={index} isDarkMode={isDarkMode} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ToolCallItemProps {
    toolCall: ToolCall;
    index: number;
    isDarkMode: boolean;
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall, index, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const isExecuting = !toolCall.result && !toolCall.isError;
    const isSuccess = toolCall.result && !toolCall.isError;
    const isError = toolCall.isError;

    return (
        <div
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 animate-in slide-in-from-left-2 fade-in ${isDarkMode
                    ? isSuccess ? 'bg-green-900/20 border-green-700/50' : isError ? 'bg-red-900/20 border-red-700/50' : 'bg-slate-800 border-slate-700'
                    : isSuccess ? 'bg-green-50 border-green-200' : isError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                }`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Animated progress bar for executing tools */}
            {isExecuting && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s linear infinite'
                    }}
                />
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'}`}
            >
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isExecuting
                        ? 'bg-purple-100 text-purple-600 animate-pulse'
                        : isSuccess
                            ? 'bg-green-100 text-green-600'
                            : isError
                                ? 'bg-red-100 text-red-600'
                                : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`}
                >
                    {isExecuting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : isSuccess ? (
                        <CheckCircle2 size={16} />
                    ) : isError ? (
                        <XCircle size={16} />
                    ) : (
                        <Wrench size={16} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {getToolLabel(toolCall.name, toolCall.input)}
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isExecuting && (
                            <>
                                <Sparkles size={10} className="text-purple-500 animate-pulse" />
                                <span className="text-purple-600">Executing...</span>
                            </>
                        )}
                        {isSuccess && <span className="text-green-600">Completed</span>}
                        {isError && <span className="text-red-600">Failed</span>}
                    </div>
                </div>

                <div className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                    {toolCall.name}
                </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
                <div className={`px-3 pb-3 text-xs border-t ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="pt-2">
                        <div className={`font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Input:</div>
                        <pre className={`p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600'}`}>
                            {JSON.stringify(toolCall.input, null, 2)}
                        </pre>
                    </div>

                    {toolCall.result && (
                        <div className="pt-2 mt-2 border-t border-slate-200/50">
                            <div className={`font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Result:</div>
                            <pre className={`p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600'}`}>
                                {typeof toolCall.result === 'string' ? toolCall.result : JSON.stringify(toolCall.result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
