export interface ThemeFonts {
    headingFont: string;
    bodyFont: string;
}

export interface PredefinedTheme {
    id: string;
    name: string;
    colors: string[];
    textColor: string;
    fonts: ThemeFonts;
    titleBarBg: string;
    titleBarText: string;
    canvasBg: string;
}

export const PREDEFINED_THEMES: PredefinedTheme[] = [
    {
        id: 'ocean-depth',
        name: 'Ocean Depth',
        colors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'],
        textColor: '#0f172a',
        fonts: { headingFont: `'Inter', sans-serif`, bodyFont: `'Inter', sans-serif` },
        titleBarBg: '#0c4a6e',
        titleBarText: '#ffffff',
        canvasBg: '#f0f9ff',
    },
    {
        id: 'sunset-glow',
        name: 'Sunset Glow',
        colors: ['#fef08a', '#fbbf24', '#f59e0b', '#ea580c', '#e11d48', '#be123c'],
        textColor: '#450a0a',
        fonts: { headingFont: `'Poppins', sans-serif`, bodyFont: `'Open Sans', sans-serif` },
        titleBarBg: '#7f1d1d',
        titleBarText: '#fef2f2',
        canvasBg: '#fffbeb',
    },
    {
        id: 'forest-canopy',
        name: 'Forest Canopy',
        colors: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
        textColor: '#064e3b',
        fonts: { headingFont: `'Merriweather', serif`, bodyFont: `'Lato', sans-serif` },
        titleBarBg: '#14532d',
        titleBarText: '#f0fdf4',
        canvasBg: '#f0fdf4',
    },
    {
        id: 'corporate-clean',
        name: 'Corporate Clean',
        colors: ['#6929c4', '#1192e8', '#005d5d', '#9f1853', '#198038', '#ba4e00'],
        textColor: '#ffffff',
        fonts: { headingFont: `'Montserrat', sans-serif`, bodyFont: `'Roboto', sans-serif` },
        titleBarBg: '#161616',
        titleBarText: '#ffffff',
        canvasBg: '#f4f4f4',
    },
    {
        id: 'monochrome-slate',
        name: 'Monochrome Slate',
        colors: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569'],
        textColor: '#0f172a',
        fonts: { headingFont: `'Space Grotesk', sans-serif`, bodyFont: `'Inter', sans-serif` },
        titleBarBg: '#1e293b',
        titleBarText: '#f1f5f9',
        canvasBg: '#f8fafc',
    },
    {
        id: 'midnight-neon',
        name: 'Midnight Neon',
        colors: ['#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
        textColor: '#ffffff',
        fonts: { headingFont: `'Outfit', sans-serif`, bodyFont: `'Space Grotesk', sans-serif` },
        titleBarBg: '#0f0a2e',
        titleBarText: '#e0e7ff',
        canvasBg: '#1e1b4b',
    },
    {
        id: 'warm-earth',
        name: 'Warm Earth',
        colors: ['#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#d97706', '#b45309'],
        textColor: '#451a03',
        fonts: { headingFont: `'Playfair Display', serif`, bodyFont: `'Lato', sans-serif` },
        titleBarBg: '#451a03',
        titleBarText: '#fef3c7',
        canvasBg: '#fffbeb',
    },
    {
        id: 'berry-blast',
        name: 'Berry Blast',
        colors: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777'],
        textColor: '#500724',
        fonts: { headingFont: `'Poppins', sans-serif`, bodyFont: `'Open Sans', sans-serif` },
        titleBarBg: '#831843',
        titleBarText: '#fdf2f8',
        canvasBg: '#fdf2f8',
    },
];
