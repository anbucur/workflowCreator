export interface PredefinedTheme {
    id: string;
    name: string;
    colors: string[];
    textColor: string;
}

export const PREDEFINED_THEMES: PredefinedTheme[] = [
    {
        id: 'ocean-depth',
        name: 'Ocean Depth',
        colors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'],
        textColor: '#0f172a',
    },
    {
        id: 'sunset-glow',
        name: 'Sunset Glow',
        colors: ['#fef08a', '#fbbf24', '#f59e0b', '#ea580c', '#e11d48', '#be123c'],
        textColor: '#450a0a',
    },
    {
        id: 'forest-canopy',
        name: 'Forest Canopy',
        colors: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
        textColor: '#064e3b',
    },
    {
        id: 'corporate-clean',
        name: 'Corporate Clean',
        colors: ['#6929c4', '#1192e8', '#005d5d', '#9f1853', '#198038', '#ba4e00'],
        textColor: '#ffffff',
    },
    {
        id: 'monochrome-slate',
        name: 'Monochrome Slate',
        colors: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569'],
        textColor: '#0f172a',
    },
];
