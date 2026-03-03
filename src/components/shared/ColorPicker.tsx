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
                <input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-mono"
                />
            </div>

            {isOpen && (
                <div className="absolute z-20 top-full mt-2" ref={popoverRef}>
                    <div className="p-2 bg-white rounded shadow-lg border border-slate-200">
                        <HexColorPicker color={color} onChange={onChange} />
                    </div>
                </div>
            )}
        </div>
    );
};
