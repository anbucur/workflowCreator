import React, { useRef, useState } from 'react';
import { Route, ZoomIn, ZoomOut, Undo2, Redo2, Download, ChevronDown, FileImage, FileType, FileText, MonitorPlay, FolderOpen, Save, Database } from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useExportStore } from '../../store/useExportStore';
import { useStore } from 'zustand';
import { exportInfographic } from '../../utils/export';
import { ProjectExplorerModal } from './ProjectExplorerModal';

export const Toolbar: React.FC = () => {
    const { undo, redo, pastStates, futureStates } = useStore(useInfographicStore.temporal);
    const [exportOpen, setExportOpen] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const [explorerOpen, setExplorerOpen] = useState(false);
    const setPreviewOpen = useExportStore((s) => s.setPreviewOpen);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const infographicRef = useExportStore((s) => s.infographicRef);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
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
        <header className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[var(--color-primary)] rounded flex items-center justify-center text-white">
                    <Route size={14} />
                </div>
                <h1 className="text-slate-900 font-bold text-sm tracking-tight">Workflow Studio</h1>
            </div>

            <div className="flex items-center gap-1">
                {/* Project File Actions */}
                <button
                    onClick={() => setExplorerOpen(true)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-200"
                    title="Open Project Explorer"
                >
                    <Database size={16} className="text-blue-500" /> Projects
                </button>

                <div className="w-px h-4 bg-slate-200 mx-2" />

                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImportJson}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                    title="Import Project (JSON)"
                >
                    <FolderOpen size={18} />
                </button>
                <button
                    onClick={handleExportJson}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                    title="Export Project (JSON)"
                >
                    <Save size={18} />
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                <button
                    onClick={() => undo()}
                    disabled={pastStates.length === 0}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                    title="Undo">
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={() => redo()}
                    disabled={futureStates.length === 0}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                    title="Redo">
                    <Redo2 size={18} />
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out">
                    <ZoomOut size={18} />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
                    <ZoomIn size={18} />
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1" />

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
                        <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[220px] flex flex-col p-1 animate-in fade-in slide-in-from-top-2 duration-150">

                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Export Current Layout
                            </div>

                            <button
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg w-full text-left transition-colors font-medium"
                                onClick={() => handleQuickExport('png')}
                            >
                                <FileImage size={15} className="text-blue-500" />
                                Save as PNG
                            </button>
                            <button
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg w-full text-left transition-colors font-medium"
                                onClick={() => handleQuickExport('svg')}
                            >
                                <FileType size={15} className="text-purple-500" />
                                Save as SVG
                            </button>
                            <button
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg w-full text-left transition-colors font-medium"
                                onClick={() => handleQuickExport('pdf')}
                            >
                                <FileText size={15} className="text-red-500" />
                                Save as PDF
                            </button>

                            <div className="h-px bg-slate-100 my-1 mx-1" />

                            <button
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg w-full text-left transition-colors font-semibold"
                                onClick={() => {
                                    setExportOpen(false);
                                    setPreviewOpen(true);
                                }}
                            >
                                <MonitorPlay size={15} className="text-blue-600" />
                                Export with Preview
                            </button>

                        </div>
                    )}
                </div>
            </div>

            {explorerOpen && <ProjectExplorerModal onClose={() => setExplorerOpen(false)} />}
        </header>
    );
};
