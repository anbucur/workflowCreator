import React from 'react';
import { Dropdown, type DropdownOption } from '../../shared/Dropdown';
import { useThemeStore } from '../../../store/useThemeStore';

export const FONT_OPTIONS: DropdownOption[] = [
    { label: 'Outfit', value: `'Outfit', sans-serif` },
    { label: 'Inter', value: `'Inter', sans-serif` },
    { label: 'Roboto', value: `'Roboto', sans-serif` },
    { label: 'Open Sans', value: `'Open Sans', sans-serif` },
    { label: 'Lato', value: `'Lato', sans-serif` },
    { label: 'Montserrat', value: `'Montserrat', sans-serif` },
    { label: 'Poppins', value: `'Poppins', sans-serif` },
    { label: 'Playfair Display', value: `'Playfair Display', serif` },
    { label: 'Merriweather', value: `'Merriweather', serif` },
    { label: 'Space Grotesk', value: `'Space Grotesk', sans-serif` },
    { label: 'Inconsolata', value: `'Inconsolata', monospace` },
];

interface FontSelectorProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ label, value, onChange }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    return (
        <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
            <Dropdown
                options={FONT_OPTIONS}
                value={value || FONT_OPTIONS[0].value}
                onChange={(val) => onChange(val || FONT_OPTIONS[0].value)}
                placeholder="Select Font…"
            />
        </div>
    );
};
