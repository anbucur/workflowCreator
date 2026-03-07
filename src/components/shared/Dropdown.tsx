import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export interface DropdownOption {
    value: string;
    label: string;
    color?: string; // Optional dot color
    icon?: React.ReactNode; // Optional icon
}

interface Props {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const Dropdown: React.FC<Props> = ({ options, value, onChange, placeholder = 'Select...', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const selectedOption = options.find((o) => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderOptionContent = (option: DropdownOption) => (
        <span className="flex items-center gap-2 truncate">
            {option.icon && <span className={`flex-shrink-0 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{option.icon}</span>}
            {option.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />}
            <span className="truncate">{option.label}</span>
        </span>
    );

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-1.5 text-sm border rounded focus:outline-none focus:border-blue-500 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? (
                    renderOptionContent(selectedOption)
                ) : (
                    <span className={`truncate transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{placeholder}</span>
                )}
                <ChevronDown size={14} className={`flex-shrink-0 ml-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>
            {isOpen && (
                <div className={`absolute z-10 w-full mt-1 border rounded shadow-sm max-h-48 overflow-auto py-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <button
                        type="button"
                        className={`w-full flex items-center px-3 py-1.5 text-sm text-left italic transition-colors duration-300 ${isDarkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-50 text-slate-500'}`}
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                    >
                        {placeholder}
                    </button>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors duration-300 ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {renderOptionContent(option)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
