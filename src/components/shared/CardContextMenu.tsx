import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface CardContextMenuProps {
  x: number;
  y: number;
  stepId: string;
  phaseId: string;
  stepTitle: string;
  onEditWithAi: (stepId: string, phaseId: string, stepTitle: string) => void;
  onClose: () => void;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  x,
  y,
  stepId,
  phaseId,
  stepTitle,
  onEditWithAi,
  onClose,
}) => {
  const { isDarkMode } = useThemeStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 100);

  return (
    <div
      ref={menuRef}
      className={`fixed z-[9999] rounded-lg shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      }`}
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        minWidth: '180px',
      }}
    >
      <button
        onClick={() => {
          onEditWithAi(stepId, phaseId, stepTitle);
          onClose();
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
          isDarkMode
            ? 'text-slate-200 hover:bg-purple-900/30'
            : 'text-slate-700 hover:bg-purple-50'
        }`}
      >
        <Sparkles size={16} className="text-purple-500" />
        <span>Edit with AI</span>
      </button>
    </div>
  );
};