import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, Undo2, Redo2, Download, ChevronDown, FileImage, FileType, FileText, MonitorPlay, FolderOpen, Save, Database, Cable, Plus, Bot, Moon, Sun, Wifi, Palette, CheckCircle, Link2, Presentation, Check } from 'lucide-react';
import { useIntegrationsStore } from '../../store/useIntegrationsStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useExportStore } from '../../store/useExportStore';
import { useBrandStore } from '../../store/useBrandStore';
import { useStore } from 'zustand';
import { exportInfographic, exportToPptx } from '../../utils/export';
import { ProjectExplorerModal } from './ProjectExplorerModal';
import { ShareModal } from './ShareModal';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProjectTabsStore } from '../../store/useProjectTabsStore';
import { ProjectTab } from '../shared/ProjectTab';
import { captureInfographicThumbnail, createPlaceholderThumbnail } from '../../utils/thumbnail';
import { PROJECTS_API_URL } from '../../config/constants';

export const Toolbar: React.FC = () => {
    const navigate = useNavigate();
    const { undo, redo, pastStates, futureStates } = useStore(useInfographicStore.temporal);
    const [exportOpen, setExportOpen] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const [explorerOpen, setExplorerOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const infographicRef = useExportStore((s) => s.infographicRef);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const connectMode = useUiStore((s) => s.connectMode);
    const setConnectMode = useUiStore((s) => s.setConnectMode);
    const setWizardOpen = useUiStore((s) => s.setWizardOpen);
    const setIntegrationsOpen = useUiStore((s) => s.setIntegrationsOpen);
    const setBrandKitOpen = useUiStore((s) => s.setBrandKitOpen);
    const setPresentationOpen = useUiStore((s) => s.setPresentationOpen);
    const zoom = useUiStore((s) => s.zoom);
    const setZoom = useUiStore((s) => s.setZoom);
    const resetView = useUiStore((s) => s.resetView);
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const { isConnected } = useIntegrationsStore();
    const ghConnected = isConnected('github');
    const jiraConnected = isConnected('jira');

    // Project tabs state
    const openProjects = useProjectTabsStore(s => s.openProjects);
    const activeProjectId = useProjectTabsStore(s => s.activeProjectId);
    const openProject = useProjectTabsStore(s => s.openProject);
    const closeProject = useProjectTabsStore(s => s.closeProject);
    const updateThumbnail = useProjectTabsStore(s => s.updateThumbnail);
    const loadInfographic = useInfographicStore(s => s.loadInfographic);
    const getSnapshot = useInfographicStore(s => s.getSnapshot);
    const currentId = useInfographicStore(s => s.id);

    // Initialize first project tab when store loads (only if no tabs exist)
    useEffect(() => {
        if (openProjects.length === 0 && currentId) {
            // Check if this project ID is not already being opened
            const snapshot = getSnapshot();
            const placeholderThumbnail = createPlaceholderThumbnail(snapshot.name || 'Untitled');
            openProject(snapshot, placeholderThumbnail);
        }
    }, [currentId]); // Only run when currentId changes, not on openProjects.length

    // Handle switching between project tabs
    const handleSwitchTab = useCallback(async (projectId: string) => {
        // Get latest state directly from store to avoid stale closures
        const tabsState = useProjectTabsStore.getState();
        const currentActiveId = tabsState.activeProjectId;
        
        if (projectId === currentActiveId) return;

        // Capture current project thumbnail before switching
        const currentThumbnail = await captureInfographicThumbnail();
        const currentData = getSnapshot();

        // Switch in tabs store
        tabsState.switchToProject(projectId, currentData, currentThumbnail);

        // Load the target project into infographic store
        const targetProject = tabsState.openProjects.find(p => p.id === projectId);
        if (targetProject) {
            loadInfographic(targetProject.data);
        }
    }, [getSnapshot, loadInfographic]);

    // Handle closing a project tab
    const handleCloseTab = useCallback(async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();

        const project = openProjects.find(p => p.id === projectId);
        if (project?.isDirty) {
            const confirm = window.confirm(`${project.name} has unsaved changes. Close anyway?`);
            if (!confirm) return;
        }

        // If closing active project, capture thumbnail first
        if (projectId === activeProjectId) {
            const thumbnail = await captureInfographicThumbnail();
            if (thumbnail) {
                updateThumbnail(projectId, thumbnail);
            }
        }

        closeProject(projectId);

        // Load the new active project if there is one
        const newState = useProjectTabsStore.getState();
        if (newState.activeProjectId) {
            const newActive = newState.openProjects.find(p => p.id === newState.activeProjectId);
            if (newActive) {
                loadInfographic(newActive.data);
            }
        }
    }, [openProjects, activeProjectId, closeProject, updateThumbnail, loadInfographic]);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleQuickExport = async (format: 'png' | 'svg' | 'pdf') => {
        setExportOpen(false);
        if (!infographicRef?.current) return;
        setExporting(true);
        try {
            await exportInfographic(infographicRef.current, format);
        } finally {
            setExporting(false);
        }
    };

    const handleExportJson = () => {
        const data = useInfographicStore.getState().getSnapshot();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${data.id || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPptx = async () => {
        setExportOpen(false);
        setExporting(true);
        try {
            const state = useInfographicStore.getState();
            const brand = useBrandStore.getState().brand;
            await exportToPptx({
                title: state.name || 'Untitled Project',
                phases: state.phases,
                companyName: brand.companyName,
                logoBase64: brand.logoBase64,
                primaryColor: brand.colors.primary,
                secondaryColor: brand.colors.secondary,
            });
        } finally {
            setExporting(false);
        }
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_IMPORT_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_IMPORT_SIZE) {
            alert('Import file must be under 10MB.');
            return;
        }
        if (!file.name.endsWith('.json')) {
            alert('Only .json files are supported.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (!data || typeof data !== 'object' || !data.id || !data.phases) {
                    alert('Invalid project file: missing required fields (id, phases).');
                    return;
                }
                useInfographicStore.getState().loadInfographic(data);
            } catch (error) {
                console.error('Failed to parse JSON', error);
                alert('Invalid project file.');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input
        }
    };

    // Manual save to DB
    const handleSaveProject = useCallback(async () => {
        setSaveStatus('saving');
        try {
            const data = useInfographicStore.getState().getSnapshot();
            const res = await fetch(PROJECTS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.id,
                    name: data.name || data.titleBar?.text || 'Untitled Project',
                    data,
                }),
            });
            if (!res.ok) throw new Error('Save failed');
            setSaveStatus('saved');
            // Mark project as clean in tabs store
            useProjectTabsStore.getState().markDirty(data.id, false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (e) {
            console.error('Manual save failed', e);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    }, []);

    // Ctrl+S keyboard shortcut for save
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveProject();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [handleSaveProject]);

    // Project tabs bar (shown when multiple projects are open)
    const tabsBar = openProjects.length > 0 && (
        <div className={`flex items-center gap-1 px-4 py-1 border-b ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {openProjects.map((project) => (
                    <ProjectTab
                        key={project.id}
                        project={project}
                        isActive={project.id === activeProjectId}
                        onSwitch={() => handleSwitchTab(project.id)}
                        onClose={(e) => handleCloseTab(e, project.id)}
                    />
                ))}
            </div>
            {openProjects.length > 1 && (
                <button
                    onClick={() => {
                        if (window.confirm('Close all open projects?')) {
                            useProjectTabsStore.getState().closeAllProjects();
                        }
                    }}
                    className={`ml-2 text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-500 hover:bg-slate-200'}`}
                    title="Close all projects"
                >
                    Close All
                </button>
            )}
        </div>
    );

    return (
        <>
        <header className={`h-12 border-b flex items-center justify-between px-4 shrink-0 z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2">
                {/* Icon mark: gradient square with 3 stacked bars */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="phasecraft-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    <rect width="24" height="24" rx="6" fill="url(#phasecraft-grad)" />
                    <rect x="5" y="7" width="8" height="2" rx="1" fill="white" />
                    <rect x="5" y="11" width="11" height="2" rx="1" fill="white" />
                    <rect x="5" y="15" width="14" height="2" rx="1" fill="white" />
                </svg>
                <span className={`font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontSize: '15px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>
                    Phasecraft
                </span>
            </div>

            <div className="flex items-center gap-1">
                {/* Project File Actions */}
                <button
                    onClick={() => setWizardOpen(true)}
                    className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-50 border border-blue-200"
                    title="New Project (Wizard)"
                >
                    <Plus size={16} className="text-blue-600" /> New
                </button>

                <button
                    onClick={() => setExplorerOpen(true)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'hover:bg-slate-700 text-slate-300 bg-slate-800 border-slate-700' : 'hover:bg-slate-100 text-slate-600 bg-slate-50 border-slate-200'}`}
                    title="Open Project Explorer"
                >
                    <Database size={16} className="text-blue-500" /> Projects
                </button>

                <button
                    onClick={handleSaveProject}
                    disabled={saveStatus === 'saving'}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${
                        saveStatus === 'saved'
                            ? isDarkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-300 text-green-700'
                            : saveStatus === 'error'
                                ? isDarkMode ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-50 border-red-300 text-red-700'
                                : isDarkMode ? 'hover:bg-slate-700 text-slate-300 bg-slate-800 border-slate-700' : 'hover:bg-slate-100 text-slate-600 bg-slate-50 border-slate-200'
                    }`}
                    title="Save project to database (Ctrl+S)"
                >
                    {saveStatus === 'saved' ? <Check size={16} className="text-green-500" /> : <Save size={16} className={isDarkMode ? 'text-emerald-400' : 'text-emerald-500'} />}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save'}
                </button>

                <div className={`w-px h-4 mx-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* AI mode toggle */}
                <button
                    onClick={() => useUiStore.getState().toggleAiPanel()}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${useUiStore.getState().aiPanelOpen
                        ? isDarkMode ? 'bg-purple-900 border-purple-700 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-700'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    title={useUiStore.getState().aiPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
                >
                    <Bot size={16} className={useUiStore.getState().aiPanelOpen ? (isDarkMode ? 'text-purple-400' : 'text-purple-500') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
                    AI
                </button>

                <div className={`w-px h-4 mx-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* Brand Kit */}
                <button
                    onClick={() => setBrandKitOpen(true)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-pink-900/30 hover:border-pink-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-pink-50 hover:border-pink-200'}`}
                    title="Brand Kit — Apply company branding"
                >
                    <Palette size={16} className={isDarkMode ? 'text-pink-400' : 'text-pink-500'} />
                    Brand
                </button>

                {/* Integrations */}
                <button
                    onClick={() => setIntegrationsOpen(true)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border relative ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-teal-900/30 hover:border-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-200'}`}
                    title="Integrations — Connect GitHub, Jira"
                >
                    <Wifi size={16} className={ghConnected || jiraConnected ? 'text-green-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                    Integrations
                    {(ghConnected || jiraConnected) && (
                        <CheckCircle size={10} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                    )}
                </button>

                {/* Presentation Mode */}
                <button
                    onClick={() => navigate('/presentation/config')}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-indigo-900/30 hover:border-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                    title="Presentation Mode — Present as slide deck"
                >
                    <MonitorPlay size={16} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-500'} />
                    Present
                </button>

                <div className={`w-px h-4 mx-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* Connect mode toggle */}
                <button
                    onClick={() => setConnectMode(!connectMode)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${connectMode
                        ? isDarkMode ? 'bg-indigo-900 border-indigo-700 text-indigo-300' : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    title={connectMode ? 'Exit Connect Mode' : 'Enter Connect Mode'}
                >
                    <Cable size={16} className={connectMode ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-500') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
                    Connect
                </button>

                {/* Share */}
                <button
                    onClick={() => setShareOpen(true)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-cyan-900/30 hover:border-cyan-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-200'}`}
                    title="Share Workflow — Generate a view-only link"
                >
                    <Link2 size={16} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-500'} />
                    Share
                </button>

                <div className={`w-px h-4 mx-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className={`p-1.5 rounded transition-colors flex items-center justify-center ${isDarkMode
                            ? 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className={`w-px h-4 mx-2 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImportJson}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Import Project (JSON)"
                >
                    <FolderOpen size={18} />
                </button>

                <div className={`w-px h-4 mx-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <button
                    onClick={() => undo()}
                    disabled={pastStates.length === 0}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300 disabled:text-slate-600' : 'hover:bg-slate-100 text-slate-600 disabled:text-slate-300'} disabled:hover:bg-transparent`}
                    title="Undo">
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={() => redo()}
                    disabled={futureStates.length === 0}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300 disabled:text-slate-600' : 'hover:bg-slate-100 text-slate-600 disabled:text-slate-300'} disabled:hover:bg-transparent`}
                    title="Redo">
                    <Redo2 size={18} />
                </button>

                <div className={`w-px h-4 mx-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <button 
                    onClick={() => setZoom(zoom - 0.1)}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`} 
                    title="Zoom Out">
                    <ZoomOut size={18} />
                </button>
                <input
                    type="text"
                    value={`${Math.round(zoom * 100)}%`}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value !== '') {
                            const numValue = parseInt(value, 10);
                            if (numValue >= 20 && numValue <= 200) {
                                setZoom(numValue / 100);
                            }
                        }
                    }}
                    onBlur={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value !== '') {
                            const numValue = parseInt(value, 10);
                            // Clamp to limits on blur
                            const clampedValue = Math.min(200, Math.max(20, numValue));
                            setZoom(clampedValue / 100);
                        }
                    }}
                    className={`w-12 text-center text-xs font-medium border rounded px-1 py-0.5 outline-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'}`}
                    title="Zoom percentage (20-200%)"
                />
                <button 
                    onClick={() => setZoom(zoom + 0.1)}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`} 
                    title="Zoom In">
                    <ZoomIn size={18} />
                </button>
                <button 
                    onClick={() => resetView()}
                    className={`p-1.5 rounded transition-colors text-xs ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} 
                    title="Reset Zoom">
                    Reset
                </button>

                <div className={`w-px h-4 mx-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setExportOpen((o) => !o)}
                        disabled={exporting}
                        className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-green-900/30 hover:border-green-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-200'}`}
                        title="Export Options"
                    >
                        <Download size={16} className={isDarkMode ? 'text-green-400' : 'text-green-500'} />
                        Export
                        <ChevronDown size={12} className={`transition-transform duration-200 ${exportOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {exportOpen && (
                        <div className={`absolute right-0 top-full mt-2 border rounded-xl shadow-xl overflow-hidden z-50 min-w-[220px] flex flex-col p-1 animate-in fade-in slide-in-from-top-2 duration-150 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>

                            <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Export Current Layout
                            </div>

                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => handleQuickExport('png')}
                            >
                                <FileImage size={15} className="text-blue-500" />
                                Save as PNG
                            </button>
                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => handleQuickExport('svg')}
                            >
                                <FileType size={15} className="text-purple-500" />
                                Save as SVG
                            </button>
                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => handleQuickExport('pdf')}
                            >
                                <FileText size={15} className="text-red-500" />
                                Save as PDF
                            </button>
                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={handleExportPptx}
                            >
                                <Presentation size={15} className="text-orange-500" />
                                Export to PowerPoint
                            </button>

                            <div className={`h-px my-1 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />

                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-semibold ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-700 hover:bg-blue-50'}`}
                                onClick={() => {
                                    setExportOpen(false);
                                    navigate('/preview');
                                }}
                            >
                                <MonitorPlay size={15} className="text-blue-600" />
                                Export with Preview
                            </button>

                            <div className={`h-px my-1 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />

                            <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Project File
                            </div>

                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => {
                                    handleExportJson();
                                    setExportOpen(false);
                                }}
                            >
                                <Save size={15} className="text-green-500" />
                                Save to JSON
                            </button>

                        </div>
                    )}
                </div>
            </div>

            {explorerOpen && <ProjectExplorerModal onClose={() => setExplorerOpen(false)} />}
            {shareOpen && <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} isDarkMode={isDarkMode} />}
        </header>
        {tabsBar}
        </>
    );
};
