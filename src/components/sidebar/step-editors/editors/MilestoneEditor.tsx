import React, { useState } from 'react';
import { useThemeStore } from '../../../../store/useThemeStore';
import type { Step, MilestoneData } from '../../../../types';

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<MilestoneData>) => void;
}

export const MilestoneEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as MilestoneData;
    const [newDeliverable, setNewDeliverable] = useState('');

    const statusOptions: { value: MilestoneData['status']; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'not-started', label: 'Not Started' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
    ];

    const handleAddDeliverable = () => {
        if (newDeliverable.trim()) {
            updateData({ deliverables: [...(data.deliverables || []), newDeliverable.trim()] });
            setNewDeliverable('');
        }
    };

    const handleRemoveDeliverable = (index: number) => {
        const updated = (data.deliverables || []).filter((_, i) => i !== index);
        updateData({ deliverables: updated });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddDeliverable();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target Date</label>
                <input
                    type="date"
                    value={data.targetDate || ''}
                    onChange={(e) => updateData({ targetDate: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                <div className="flex gap-1 flex-wrap">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ status: option.value })}
                            className={`px-2 py-1 text-xs rounded capitalize transition-colors ${data.status === option.value
                                ? option.value === 'completed' ? 'bg-green-500 text-white'
                                    : option.value === 'in-progress' ? 'bg-blue-500 text-white'
                                        : option.value === 'not-started' ? 'bg-slate-500 text-white'
                                            : 'bg-slate-400 text-white'
                                : isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Deliverables
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDeliverable}
                        onChange={(e) => setNewDeliverable(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a deliverable..."
                        className={`flex-1 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                    />
                    <button
                        onClick={handleAddDeliverable}
                        disabled={!newDeliverable.trim()}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${newDeliverable.trim()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                            }`}
                    >
                        Add
                    </button>
                </div>
                {(data.deliverables || []).length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {(data.deliverables || []).map((deliverable, index) => (
                            <li
                                key={index}
                                className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                            >
                                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                                    <span className="text-green-500 mr-2">✓</span>
                                    {deliverable}
                                </span>
                                <button
                                    onClick={() => handleRemoveDeliverable(index)}
                                    className="text-red-500 hover:text-red-600 text-xs"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};