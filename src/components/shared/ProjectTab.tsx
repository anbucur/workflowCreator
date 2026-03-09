import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { OpenProject } from '../../store/useProjectTabsStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProjectTabsStore } from '../../store/useProjectTabsStore';
import { useInfographicStore } from '../../store/useInfographicStore';

interface ProjectTabProps {
  project: OpenProject;
  isActive: boolean;
  onSwitch: () => void;
  onClose: (e: React.MouseEvent) => void;
}

export const ProjectTab: React.FC<ProjectTabProps> = ({
  project,
  isActive,
  onSwitch,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name || 'Untitled');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  const renameProject = useProjectTabsStore(s => s.renameProject);
  const setProjectName = useInfographicStore(s => s.setProjectName);

  // Sync editName with project name when it changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditName(project.name || 'Untitled');
    }
  }, [project.name, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = (e: React.MouseEvent) => {
    // Only stop propagation and start editing if this is the active tab
    // For non-active tabs, let the click pass through to the parent div for tab switching
    if (isActive) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleNameSubmit = () => {
    const trimmedName = editName.trim() || 'Untitled';
    renameProject(project.id, trimmedName);
    if (isActive) {
      setProjectName(trimmedName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(project.name || 'Untitled');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleNameSubmit();
  };

  return (
    <div
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all min-w-[180px] max-w-[240px] ${
        isActive
          ? isDarkMode
            ? 'bg-slate-700 text-white border-t border-l border-r border-slate-600'
            : 'bg-white text-slate-800 border-t border-l border-r border-slate-200 shadow-sm'
          : isDarkMode
            ? 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-300'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700'
      }`}
      onClick={onSwitch}
    >
      {/* Project Name - Click to edit when active */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          className={`text-base font-medium flex-1 bg-transparent border-none outline-none ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}
          style={{ fontSize: '16px' }}
        />
      ) : (
        <span
          className={`text-base font-medium truncate flex-1 ${isActive ? 'cursor-text' : ''}`}
          style={{ fontSize: '16px' }}
          onClick={handleNameClick}
          title={isActive ? 'Click to rename' : project.name || 'Untitled'}
        >
          {project.name || 'Untitled'}
        </span>
      )}

      {/* Dirty indicator */}
      {project.isDirty && (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500'}`} />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity flex-shrink-0 ${
          isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
        }`}
        title="Close project"
      >
        <X size={14} />
      </button>
    </div>
  );
};