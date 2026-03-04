import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const DEFAULT_COLORS = [
        // Grayscale
        '#020617', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b',
        // Reds & Oranges
        '#7f1d1d', '#b91c1c', '#ef4444', '#c2410c', '#ea580c', '#f97316',
        // Yellows & Greens
        '#b45309', '#f59e0b', '#84cc16', '#14532d', '#15803d', '#22c55e',
        // Teals & Blues
        '#0f766e', '#14b8a6', '#06b6d4', '#1e3a8a', '#1d4ed8', '#3b82f6',
        // Purples & Pinks
        '#4c1d95', '#6d28d9', '#8b5cf6', '#831843', '#be185d', '#ec4899',
    ];

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

    return (
        <div className="flex flex-col gap-1.5 relative">
            {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
            <div className="flex items-center gap-2">
                <button
                    className="w-8 h-8 rounded border border-slate-300 shadow-sm overflow-hidden"
                    style={{ backgroundColor: color }}
                    onClick={() => setIsOpen(!isOpen)}
                    title="Choose color"
                />
            </div>

            {isOpen && (
                <div className="absolute z-20 top-full mt-2" ref={popoverRef}>
                    <div className="p-3 bg-white rounded shadow-lg border border-slate-200 w-64 flex flex-col gap-3">
                        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', height: '150px' }} />

                        <div className="grid grid-cols-6 gap-1.5">
                            {DEFAULT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => onChange(c)}
                                    className={`w-8 h-8 rounded-md shadow-sm border border-slate-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 ${color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
