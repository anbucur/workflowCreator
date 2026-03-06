import React from 'react';
import { getToolLabel } from '../../ai/toolExecutor';
import type { ChatMessage } from '../../ai/types';
import { Bot, User, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                {message.content && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                        }`}>
                        {message.content}
                    </div>
                )}

                {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full">
                        {message.toolCalls.map((tc) => (
                            <div key={tc.id} className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-lg p-2 text-xs">
                                <Wrench size={12} className="text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-700 truncate">{getToolLabel(tc.name, tc.input)}</span>
                                <span className="ml-auto flex-shrink-0">
                                    {tc.isError
                                        ? <XCircle size={14} className="text-red-500" />
                                        : <CheckCircle2 size={14} className="text-green-500" />
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
