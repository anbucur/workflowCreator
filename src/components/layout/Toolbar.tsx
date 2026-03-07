import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Undo2, Redo2, Download, ChevronDown, FileImage, FileType, FileText, MonitorPlay, FolderOpen, Save, Database, Cable, Plus, Bot, Moon, Sun } from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useExportStore } from '../../store/useExportStore';
import { useStore } from 'zustand';
import { exportInfographic } from '../../utils/export';
import { ProjectExplorerModal } from './ProjectExplorerModal';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';

export const Toolbar: React.FC = () => {
    const { undo, redo, pastStates, futureStates } = useStore(useInfographicStore.temporal);
    const [exportOpen, setExportOpen] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const [explorerOpen, setExplorerOpen] = useState(false);
    const setPreviewOpen = useExportStore((s) => s.setPreviewOpen);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const infographicRef = useExportStore((s) => s.infographicRef);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const connectMode = useUiStore((s) => s.connectMode);
    const setConnectMode = useUiStore((s) => s.setConnectMode);
    const setWizardOpen = useUiStore((s) => s.setWizardOpen);
    const projectName = useInfographicStore((s) => s.name) || '';
    const setProjectName = useInfographicStore((s) => s.setProjectName);
    const { isDarkMode, toggleDarkMode } = useThemeStore();

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

    return (
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

            <div className="flex items-center gap-1 mx-4 flex-1">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Untitled Project"
                    title="Rename Project"
                    className={`text-sm font-semibold bg-transparent border rounded px-2 py-1 outline-none transition-colors w-64 max-w-full ${isDarkMode ? 'text-slate-200 border-transparent hover:border-slate-600 focus:border-blue-400 focus:bg-slate-800' : 'text-slate-700 border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white'}`}
                />
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

                <button className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`} title="Zoom Out">
                    <ZoomOut size={18} />
                </button>
                <button className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`} title="Zoom In">
                    <ZoomIn size={18} />
                </button>

                <div className={`w-px h-4 mx-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <div className="relative" ref={dropdownRef}>
                    <button
                        className="ml-1 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 shadow-sm"
                        onClick={() => setExportOpen((o) => !o)}
                        disabled={exporting}
                        title="Export Options"
                    >
                        <Download size={14} />
                        {exporting ? 'Exporting…' : 'Export'}
                        <ChevronDown size={14} className={`transition-transform duration-200 opacity-80 ${exportOpen ? 'rotate-180' : ''}`} />
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

                            <div className={`h-px my-1 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />

                            <button
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors font-semibold ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-700 hover:bg-blue-50'}`}
                                onClick={() => {
                                    setExportOpen(false);
                                    setPreviewOpen(true);
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
        </header>
    );
};
