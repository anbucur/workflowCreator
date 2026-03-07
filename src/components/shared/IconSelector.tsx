import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ICON_SET } from '../../utils/icons';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

function getIcon(name: string): React.ComponentType<LucideProps> | null {
    const pascalName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    return (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascalName] || null;
}

interface IconSelectorProps {
    value: string;
    onChange: (iconName: string) => void;
    label?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const CurrentIcon = useMemo(() => getIcon(value), [value]);

    const filteredIcons = useMemo(() => {
        const q = search.toLowerCase();
        return ICON_SET.filter(
            (icon) => icon.name.toLowerCase().includes(q) || icon.label.toLowerCase().includes(q)
        );
    }, [search]);

    return (
        <div className="flex flex-col gap-1.5 relative">
            {label && <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded focus:outline-none focus:border-blue-500 transition-colors ${isDarkMode
                        ? 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                title="Select Icon"
            >
                <span className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {CurrentIcon ? React.createElement(CurrentIcon as any, { size: 16 }) : <span className="w-4 h-4" />}
                    <span className="truncate">{ICON_SET.find(i => i.name === value)?.label || value}</span>
                </span>
            </button>

            {isOpen && (
                <div className={`absolute z-30 top-full mt-2 left-0 w-64 rounded shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`} ref={popoverRef}>
                    <div className={`p-2 relative ${isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} size={14} />
                        <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search icons..."
                            className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:border-blue-500 ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                        />
                    </div>

                    <div className="p-2 max-h-60 overflow-y-auto">
                        {filteredIcons.length === 0 ? (
                            <div className={`py-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No icons found</div>
                        ) : (
                            <div className="grid grid-cols-5 gap-1">
                                {filteredIcons.map((icon) => {
                                    const IconCmp = getIcon(icon.name);
                                    if (!IconCmp) return null;

                                    return (
                                        <button
                                            key={icon.name}
                                            onClick={() => {
                                                onChange(icon.name);
                                                setIsOpen(false);
                                            }}
                                            className={`p-2 flex items-center justify-center rounded transition-colors ${value === icon.name
                                                    ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600')
                                                    : (isDarkMode
                                                        ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                                        : 'text-slate-600 hover:bg-slate-100')
                                                }`}
                                            title={icon.label}
                                        >
                                            {React.createElement(IconCmp as any, { size: 18 })}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
