import React from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { useUiStore } from '../../store/useUiStore';

export const AppShell: React.FC = () => {
    const sidebarOpen = useUiStore((state) => state.sidebarOpen);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-display">
            <Toolbar />
            <main className="flex flex-1 overflow-hidden min-h-0">
                <div className="flex-1 relative overflow-auto flex justify-center items-start p-8 bg-slate-50">
                    <Canvas />
                </div>

                {sidebarOpen && (
                    <aside className="w-[300px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
                        <Sidebar />
                    </aside>
                )}
            </main>
        </div>
    );
};
