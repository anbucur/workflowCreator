import React, { useRef, useState, useEffect } from 'react';
import { X, Download, FileImage, FileType, FileText } from 'lucide-react';
import { InfographicRenderer } from '../canvas/InfographicRenderer';
import { useExportStore } from '../../store/useExportStore';
import { exportInfographic } from '../../utils/export';

export const ExportPreviewModal: React.FC = () => {
    const isPreviewOpen = useExportStore((s) => s.isPreviewOpen);
    const setPreviewOpen = useExportStore((s) => s.setPreviewOpen);
    const internalExportRef = useRef<HTMLDivElement>(null);

    const [exporting, setExporting] = useState(false);
    const [previewWidth, setPreviewWidth] = useState(1000); // Default preview width
    const [isResizing, setIsResizing] = useState(false);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPreviewOpen) {
                setPreviewOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPreviewOpen, setPreviewOpen]);

    // Handle preview container resize
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Assuming modal is centered, calculate width from mouse position to center
            const centerX = window.innerWidth / 2;
            const distanceFromCenter = Math.abs(e.clientX - centerX);
            // Double it since we are pulling from one side but want a symmetric container or just raw width
            // Actually, if we're dragging from the right edge, new width = (e.clientX - modalLeftEdge)
            // Let's make it simpler: base it on an arbitrary starting offset or full absolute container width

            // We will calculate width based on cursor position relative to center
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
            setPreviewOpen(false); // Close after successful export
        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            setExporting(false);
        }
    };

    if (!isPreviewOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Download size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Export Preview</h2>
                        <p className="text-xs text-slate-500 font-medium">Drag the handles on the sides to adjust the export layout width.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1 mr-4">
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md hover:bg-white hover:shadow-sm hover:text-blue-600 transition-all text-slate-600 disabled:opacity-50"
                            onClick={() => handleExport('png')}
                            disabled={exporting}
                        >
                            <FileImage size={16} />
                            PNG
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md hover:bg-white hover:shadow-sm hover:text-purple-600 transition-all text-slate-600 disabled:opacity-50"
                            onClick={() => handleExport('svg')}
                            disabled={exporting}
                        >
                            <FileType size={16} />
                            SVG
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md hover:bg-white hover:shadow-sm hover:text-red-600 transition-all text-slate-600 disabled:opacity-50"
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                        >
                            <FileText size={16} />
                            PDF
                        </button>
                    </div>
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-slate-800/20 p-8 flex items-start justify-center">
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
                        {/* Disable absolute layout features in preview (like select UI overlays) via CSS if needed, 
                 but InfographicRenderer is mainly presentation. */}
                        <InfographicRenderer ref={internalExportRef} />
                    </div>

                    {exporting && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-xl font-semibold text-slate-800 flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Generating layout...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
