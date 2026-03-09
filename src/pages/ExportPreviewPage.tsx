import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Download, FileImage, FileType, FileText, ArrowLeft } from 'lucide-react';
import { InfographicRenderer } from '../components/canvas/InfographicRenderer';
import { useThemeStore } from '../store/useThemeStore';
import { exportInfographic } from '../utils/export';

export const ExportPreviewPage: React.FC = () => {
    const navigate = useNavigate();
    const internalExportRef = useRef<HTMLDivElement>(null);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const [exporting, setExporting] = useState(false);
    const [previewWidth, setPreviewWidth] = useState(1000);
    const [isResizing, setIsResizing] = useState(false);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate('/project');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Handle preview container resize
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const distanceFromCenter = Math.abs(e.clientX - centerX);
            const newWidth = distanceFromCenter * 2;
            setPreviewWidth(Math.max(400, Math.min(2400, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.userSelect = 'auto';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
        if (!internalExportRef.current) return;
        setExporting(true);
        try {
            await exportInfographic(internalExportRef.current, format);
            navigate('/project'); // Navigate back after successful export
        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-10 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/project')}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                                <Download size={18} />
                            </div>
                            <div>
                                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Export Preview</h1>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Drag the handles on the sides to adjust the export layout width.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-lg flex gap-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-600 hover:text-blue-400 text-slate-300' : 'hover:bg-white hover:shadow-sm hover:text-blue-600 text-slate-600'} disabled:opacity-50`}
                                onClick={() => handleExport('png')}
                                disabled={exporting}
                            >
                                <FileImage size={16} />
                                PNG
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-600 hover:text-purple-400 text-slate-300' : 'hover:bg-white hover:shadow-sm hover:text-purple-600 text-slate-600'} disabled:opacity-50`}
                                onClick={() => handleExport('svg')}
                                disabled={exporting}
                            >
                                <FileType size={16} />
                                SVG
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-600 hover:text-red-400 text-slate-300' : 'hover:bg-white hover:shadow-sm hover:text-red-600 text-slate-600'} disabled:opacity-50`}
                                onClick={() => handleExport('pdf')}
                                disabled={exporting}
                            >
                                <FileText size={16} />
                                PDF
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/project')}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Preview Area */}
            <div className={`flex-1 overflow-auto p-8 flex items-start justify-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                <div
                    className="relative transition-all duration-75"
                    style={{ width: `${previewWidth}px`, minWidth: '400px', maxWidth: '100%', pointerEvents: exporting ? 'none' : 'auto' }}
                >
                    {/* Resize handles */}
                    <div
                        className="absolute -left-3 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 rounded-l-md transition-colors z-10 flex items-center justify-center opacity-0 hover:opacity-100 group"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setIsResizing(true);
                            document.body.style.userSelect = 'none';
                        }}
                    >
                        <div className="w-1 h-12 bg-white rounded-full shadow-sm" />
                    </div>
                    <div
                        className="absolute -right-3 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 rounded-r-md transition-colors z-10 flex items-center justify-center opacity-0 hover:opacity-100 group"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setIsResizing(true);
                            document.body.style.userSelect = 'none';
                        }}
                    >
                        <div className="w-1 h-12 bg-white rounded-full shadow-sm" />
                    </div>

                    <div
                        className={`w-full overflow-hidden rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-opacity duration-200 ${exporting ? 'opacity-50' : 'opacity-100'}`}
                    >
                        <InfographicRenderer ref={internalExportRef} />
                    </div>

                    {exporting && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className={`px-6 py-4 rounded-xl shadow-xl font-semibold flex items-center gap-3 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white/90 backdrop-blur text-slate-800'}`}>
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Generating layout...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};