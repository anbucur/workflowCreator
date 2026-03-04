import React from 'react';

export const FONT_OPTIONS = [
    { label: 'Inter', value: `'Inter', sans-serif` },
    { label: 'Roboto', value: `'Roboto', sans-serif` },
    { label: 'Open Sans', value: `'Open Sans', sans-serif` },
    { label: 'Lato', value: `'Lato', sans-serif` },
    { label: 'Montserrat', value: `'Montserrat', sans-serif` },
    { label: 'Poppins', value: `'Poppins', sans-serif` },
    { label: 'Playfair Display', value: `'Playfair Display', serif` },
    { label: 'Merriweather', value: `'Merriweather', serif` },
    { label: 'Space Grotesk', value: `'Space Grotesk', sans-serif` },
    { label: 'Outfit', value: `'Outfit', sans-serif` },
    { label: 'Inconsolata', value: `'Inconsolata', monospace` },
];

interface FontSelectorProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ label, value, onChange }) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">{label}</label>
            <select
                value={value || FONT_OPTIONS[0].value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                style={{ fontFamily: value || FONT_OPTIONS[0].value }}
            >
                {FONT_OPTIONS.map((font) => (
                    <option key={font.label} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
