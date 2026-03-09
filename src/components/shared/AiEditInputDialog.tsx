import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface AiEditInputDialogProps {
  isOpen: boolean;
  stepTitle: string;
  stepId: string;
  phaseId: string;
  onSubmit: (stepId: string, phaseId: string, prompt: string) => void;
  onClose: () => void;
}

export const AiEditInputDialog: React.FC<AiEditInputDialogProps> = ({
  isOpen,
  stepTitle,
  stepId,
  phaseId,
  onSubmit,
  onClose,
}) => {
  const { isDarkMode } = useThemeStore();
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset prompt when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(stepId, phaseId, prompt.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              <Sparkles size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Edit with AI
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {stepTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-slate-700 text-slate-400' 
                : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            What would you like to change or add?
          </label>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Add more details about the testing phase, update the timeline to 2 weeks..."
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-purple-500' 
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-500'
            }`}
          />
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Press Enter to send or Shift+Enter for new line
          </p>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-5 py-4 border-t ${
          isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              prompt.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
            }`}
          >
            <Send size={16} />
            Send to AI
          </button>
        </div>
      </div>
    </div>
  );
};