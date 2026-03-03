import React from 'react';
import { Route, ZoomIn, Share, Download } from 'lucide-react';

export const Toolbar: React.FC = () => {
    return (
        <header className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[var(--color-primary)] rounded flex items-center justify-center text-white">
                    <Route size={14} />
                </div>
                <h1 className="text-slate-900 font-bold text-sm tracking-tight">Workflow Studio</h1>
            </div>

            <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
                    <ZoomIn size={18} />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Share/Export">
                    <Share size={18} />
                </button>
                <button className="ml-2 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                    <Download size={14} /> Export
                </button>
            </div>
        </header>
    );
};
