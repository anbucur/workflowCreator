import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
            {option.icon && <span className="flex-shrink-0 text-slate-500">{option.icon}</span>}
            {option.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />}
            <span className="truncate">{option.label}</span>
        </span>
    );

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? (
                    renderOptionContent(selectedOption)
                ) : (
                    <span className="text-slate-500 truncate">{placeholder}</span>
                )}
                <ChevronDown size={14} className="text-slate-500 flex-shrink-0 ml-1" />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-sm max-h-48 overflow-auto py-1">
                    <button
                        type="button"
                        className="w-full flex items-center px-3 py-1.5 text-sm text-left hover:bg-slate-50 text-slate-500 italic"
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
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-slate-50 text-slate-700"
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
