import React, { useState } from 'react';
import { X, Link, Copy, Check, Clock, Globe } from 'lucide-react';
import { useShareStore } from '../../store/useShareStore';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [expiration, setExpiration] = useState<'1day' | '1week' | 'never'>('never');
  const [copied, setCopied] = useState(false);
  const { generateShareLink, currentShareLink } = useShareStore();

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    generateShareLink(expiration);
  };

  const handleCopy = async () => {
    if (currentShareLink) {
      try {
        await navigator.clipboard.writeText(currentShareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Link size={18} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'} />
            <h2 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Share Workflow</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Generate a shareable link to view this workflow. Anyone with the link can view but not edit.
          </p>

          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Link expires
            </label>
            <div className="flex gap-2">
              {[
                { value: '1day', label: '1 Day', icon: Clock },
                { value: '1week', label: '1 Week', icon: Clock },
                { value: 'never', label: 'Never', icon: Globe },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExpiration(option.value as typeof expiration)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    expiration === option.value
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <option.icon size={14} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {!currentShareLink ? (
            <button
              onClick={handleGenerateLink}
              className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Link size={16} />
              Generate Share Link
            </button>
          ) : (
            <div className="space-y-2">
              <label className={`block text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Share link
              </label>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <input
                  type="text"
                  value={currentShareLink}
                  readOnly
                  className={`flex-1 bg-transparent text-xs outline-none truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                />
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            ⚠️ Shared links contain the full workflow data in the URL. Long workflows may result in very long URLs.
          </p>
        </div>
      </div>
    </div>
  );
};