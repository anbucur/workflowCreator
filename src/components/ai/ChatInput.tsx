import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
    const [text, setText] = React.useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [text]);

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text.trim());
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`relative flex items-end gap-2 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-300'}`}>
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to update the workflow..."
                className={`w-full resize-none bg-transparent outline-none max-h-[150px] min-h-[24px] overflow-y-auto text-sm py-1 px-1 transition-colors ${isDarkMode ? 'text-slate-100 placeholder:text-slate-500' : 'placeholder:text-slate-400'}`}
                rows={1}
                disabled={disabled}
            />
            <button
                onClick={handleSend}
                disabled={!text.trim() || disabled}
                className="shrink-0 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
            >
                <Send size={16} />
            </button>
        </div>
    );
};
