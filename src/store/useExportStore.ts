import { create } from 'zustand';

interface ExportStore {
    infographicRef: React.RefObject<HTMLDivElement | null> | null;
    setInfographicRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
    isPreviewOpen: boolean;
    setPreviewOpen: (open: boolean) => void;
}

export const useExportStore = create<ExportStore>((set) => ({
    infographicRef: null,
    setInfographicRef: (ref) => set({ infographicRef: ref }),
    isPreviewOpen: false,
    setPreviewOpen: (open) => set({ isPreviewOpen: open }),
}));
