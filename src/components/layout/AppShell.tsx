import React from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { ExportPreviewModal } from '../export/ExportPreviewModal';
import { ProjectWizard } from '../wizard/ProjectWizard';
import { AiChatPanel } from '../ai/AiChatPanel';
import { IntegrationsModal } from '../integrations/IntegrationsModal';
import { BrandKitModal } from '../branding/BrandKitModal';
import { PresentationMode } from '../presentation/PresentationMode';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAiChatStore } from '../../store/useAiChatStore';
import { Trash2 } from 'lucide-react';

export const AppShell: React.FC = () => {
    const sidebarOpen = useUiStore((state) => state.sidebarOpen);
    const isDraggingCard = useUiStore((state) => state.isDraggingCard);
    const wizardOpen = useUiStore((state) => state.wizardOpen);
    const setWizardOpen = useUiStore((state) => state.setWizardOpen);
    const integrationsOpen = useUiStore((state) => state.integrationsOpen);
    const setIntegrationsOpen = useUiStore((state) => state.setIntegrationsOpen);
    const brandKitOpen = useUiStore((state) => state.brandKitOpen);
    const setBrandKitOpen = useUiStore((state) => state.setBrandKitOpen);
    const presentationOpen = useUiStore((state) => state.presentationOpen);
    const setPresentationOpen = useUiStore((state) => state.setPresentationOpen);
    const loadInfographic = useInfographicStore((s) => s.loadInfographic);
    const [inDeleteZone, setInDeleteZone] = React.useState(false);

    // Sidebar resize state
    const [sidebarWidth, setSidebarWidth] = React.useState(350);
    const [isResizing, setIsResizing] = React.useState(false);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    React.useEffect(() => {
        if (!isDraggingCard) {
            setInDeleteZone(false);
            return;
        }
        const handleMouseMoveCard = (e: MouseEvent) => {
            setInDeleteZone(e.clientY > window.innerHeight * (2 / 3));
        };
        window.addEventListener('mousemove', handleMouseMoveCard);
        return () => window.removeEventListener('mousemove', handleMouseMoveCard);
    }, [isDraggingCard]);

    // Handle sidebar dragging
    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMoveResize = (e: MouseEvent) => {
            // New width is the distance from the right edge of the screen to the mouse cursor
            const newWidth = window.innerWidth - e.clientX;
            // Clamp between 250px and 600px
            setSidebarWidth(Math.max(250, Math.min(600, newWidth)));
        };

        const handleMouseUpResize = () => {
            setIsResizing(false);
            // Re-enable text selection after drag finishes
            document.body.style.userSelect = 'auto';
        };

        window.addEventListener('mousemove', handleMouseMoveResize);
        window.addEventListener('mouseup', handleMouseUpResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveResize);
            window.removeEventListener('mouseup', handleMouseUpResize);
        };
    }, [isResizing]);

    return (
        <div className={`flex flex-col h-screen w-full overflow-hidden font-display transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <Toolbar />
            <main className="flex flex-1 overflow-hidden min-h-0">
                <div className={`flex-1 relative overflow-auto p-4 md:p-8 w-full isolate transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    <Canvas />
                </div>

                {sidebarOpen && (
                    <aside
                        className={`border-l flex flex-col shrink-0 overflow-y-auto relative transition-colors duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                        style={{ width: `${sidebarWidth}px` }}
                    >
                        {/* Resize handler */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-50 transition-colors opacity-50"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                                // Disable text selection while dragging
                                document.body.style.userSelect = 'none';
                            }}
                        />
                        <Sidebar />
                    </aside>
                )}
                <AiChatPanel />
            </main>

            {/* Global Drag to Delete Zone — appears only in bottom third */}
            <div
                className={`fixed bottom-0 left-0 pointer-events-none z-50 transition-all duration-200 px-6 pb-6 ${isDraggingCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ right: sidebarOpen ? `${sidebarWidth}px` : '0' }}
            >
                <div
                    className={`max-w-lg mx-auto w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-dashed transition-all duration-200 shadow-sm ${inDeleteZone
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'bg-white border-slate-300 text-slate-400 hover:border-red-300'
                        }`}
                >
                    <Trash2 size={18} />
                    <span className="text-sm font-bold uppercase tracking-widest">
                        Drag here to delete
                    </span>
                </div>
            </div>

            <ExportPreviewModal />

            {wizardOpen && (
                <ProjectWizard
                    onComplete={(data, _themeId, aiPrompt) => {
                        loadInfographic(data);
                        setWizardOpen(false);

                        // If AI prompt was provided, open AI panel and send the message
                        if (aiPrompt) {
                            const { setAiPanelOpen } = useUiStore.getState();
                            const { sendMessage } = useAiChatStore.getState();
                            setAiPanelOpen(true);
                            // Small delay to ensure panel is open before sending
                            setTimeout(() => {
                                sendMessage(aiPrompt);
                            }, 100);
                        }
                    }}
                    onClose={() => setWizardOpen(false)}
                />
            )}

            {integrationsOpen && (
                <IntegrationsModal onClose={() => setIntegrationsOpen(false)} />
            )}

            {brandKitOpen && (
                <BrandKitModal onClose={() => setBrandKitOpen(false)} />
            )}

            {presentationOpen && (
                <PresentationMode onClose={() => setPresentationOpen(false)} />
            )}
        </div>
    );
};

