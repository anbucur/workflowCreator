import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface SprintGoal {
    id: string;
    text: string;
    completed: boolean;
}

interface SprintData {
    sprintNumber: number;
    startDate: string;
    endDate: string;
    goals: SprintGoal[];
    velocity?: number;
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<SprintData>) => void;
}

export const SprintEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as SprintData;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sprint #</label>
                    <input
                        type="number"
                        value={data.sprintNumber || 1}
                        onChange={(e) => updateData({ sprintNumber: Number(e.target.value) })}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                </div>
                <div className="flex-1">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Velocity</label>
                    <input
                        type="number"
                        value={data.velocity || 0}
                        onChange={(e) => updateData({ velocity: Number(e.target.value) })}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Start Date</label>
                    <input
                        type="date"
                        value={data.startDate || ''}
                        onChange={(e) => updateData({ startDate: e.target.value })}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                </div>
                <div className="flex-1">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>End Date</label>
                    <input
                        type="date"
                        value={data.endDate || ''}
                        onChange={(e) => updateData({ endDate: e.target.value })}
                        className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sprint Goals</label>
                {(data.goals || []).map((goal: SprintGoal, i: number) => (
                    <div key={goal.id} className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={(e) => {
                                const newGoals = [...data.goals];
                                newGoals[i] = { ...goal, completed: e.target.checked };
                                updateData({ goals: newGoals });
                            }}
                            className="rounded border-slate-300"
                        />
                        <AutoResizeTextarea
                            value={goal.text}
                            onChange={(e) => {
                                const newGoals = [...data.goals];
                                newGoals[i] = { ...goal, text: e.target.value };
                                updateData({ goals: newGoals });
                            }}
                            className="flex-1"
                        />
                        <button
                            onClick={() => {
                                const newGoals = [...data.goals];
                                newGoals.splice(i, 1);
                                updateData({ goals: newGoals });
                            }}
                            className="p-1.5 text-red-500 rounded"
                            aria-label="Remove goal"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ goals: [...(data.goals || []), { id: createId(), text: 'New Goal', completed: false }] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Goal
                </button>
            </div>
        </div>
    );
};
