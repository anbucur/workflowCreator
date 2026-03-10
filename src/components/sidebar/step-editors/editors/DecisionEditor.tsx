import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Dropdown } from '../../../shared/Dropdown';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import type { Step } from '../../../../types';

interface DecisionData {
    criteria: string[];
    outcome: 'pending' | 'approved' | 'rejected';
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<DecisionData>) => void;
}

export const DecisionEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as DecisionData;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Criteria</label>
                {(data.criteria || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-2">
                        <AutoResizeTextarea
                            value={item}
                            onChange={(e) => {
                                const newItems = [...data.criteria];
                                newItems[i] = e.target.value;
                                updateData({ criteria: newItems });
                            }}
                            className="flex-1"
                        />
                        <button
                            onClick={() => {
                                const newItems = [...data.criteria];
                                newItems.splice(i, 1);
                                updateData({ criteria: newItems });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ criteria: [...(data.criteria || []), 'New Criteria'] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Criteria
                </button>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Outcome</label>
                <Dropdown
                    options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                    ]}
                    value={data.outcome || 'pending'}
                    onChange={(val) => updateData({ outcome: val as 'pending' | 'approved' | 'rejected' })}
                    placeholder="Select Outcome…"
                />
            </div>
        </div>
    );
};
