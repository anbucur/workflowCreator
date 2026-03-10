import React from 'react';
import { useThemeStore } from '../../../../store/useThemeStore';
import type { Step, MilestoneData } from '../../../../types';
import { Plus, X } from 'lucide-react';

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<MilestoneData>) => void;
}

export const MilestoneEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as MilestoneData;

    const statusOptions = [
        { value: 'none', label: 'None' },
        { value: 'not-started', label: 'Not Started' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
    ];

    const addDeliverable = () => {
        const newDeliverables = [...(data.deliverables || []), ''];
        updateData({ deliverables: newDeliverables });
    };

    const updateDeliverable = (index: number, value: string) => {
        const newDeliverables = [...(data.deliverables || [])];
        newDeliverables[index] = value;
        updateData({ deliverables: newDeliverables });
    };

    const removeDeliverable = (index: number) => {
        const newDeliverables = (data.deliverables || []).filter((_, i) => i !== index);
        updateData({ deliverables: newDeliverables });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target Date</label>
                <input
                    type="text"
                    value={data.targetDate || ''}
                    onChange={(e) => updateData({ targetDate: e.target.value })}
                    placeholder="e.g., Q1 2025, March 2025"
                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                <div className="flex gap-1 flex-wrap">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ status: option.value as MilestoneData['status'] })}
                            className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                                data.status === option.value
                                    ? option.value === 'completed' ? 'bg-green-500 text-white'
                                    : option.value === 'in-progress' ? 'bg-blue-500 text-white'
                                    : option.value === 'not-started' ? 'bg-slate-500 text-white'
                                    : 'bg-slate-400 text-white'
                                    : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Deliverables</label>
                    <button
                        onClick={addDeliverable}
                        className={`p-1 rounded transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        title="Add deliverable"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <div className="flex flex-col gap-1.5">
                    {(data.deliverables || []).map((deliverable, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <input
                                type="text"
                                value={deliverable}
                                onChange={(e) => updateDeliverable(index, e.target.value)}
                                placeholder="Deliverable description"
                                className={`flex-1 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                            <button
                                onClick={() => removeDeliverable(index)}
                                className={`p-1 rounded transition-colors ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {(data.deliverables || []).length === 0 && (
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            No deliverables added yet. Click + to add one.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};