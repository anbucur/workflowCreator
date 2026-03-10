import React from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Dropdown } from '../../../shared/Dropdown';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import type { Step } from '../../../../types';

interface MeetingData {
    agendaItems: string[];
    facilitator: string;
    duration: string;
    hasDecision: boolean;
    decision?: {
        criteria: string[];
        outcome: 'pending' | 'approved' | 'rejected';
    };
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<MeetingData>) => void;
}

export const MeetingEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const data = (step as any).data as MeetingData;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Agenda Items</label>
                {(data.agendaItems || []).map((item: string, i: number) => (
                    <div
                        key={i}
                        draggable
                        onDragStart={(e) => {
                            setDraggedIndex(i);
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex === null || draggedIndex === i) return;
                            const newItems = [...data.agendaItems];
                            const draggedItem = newItems.splice(draggedIndex, 1)[0];
                            newItems.splice(i, 0, draggedItem);
                            updateData({ agendaItems: newItems });
                            setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`flex gap-2 items-center mix-blend-normal transition-opacity duration-200 ${draggedIndex === i ? 'opacity-50' : ''}`}
                    >
                        <div className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing p-1">
                            <GripVertical size={14} />
                        </div>
                        <AutoResizeTextarea
                            value={item}
                            onChange={(e) => {
                                const newItems = [...data.agendaItems];
                                newItems[i] = e.target.value;
                                updateData({ agendaItems: newItems });
                            }}
                            className="flex-1"
                        />
                        <button
                            onClick={() => {
                                const newItems = [...data.agendaItems];
                                newItems.splice(i, 1);
                                updateData({ agendaItems: newItems });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ agendaItems: [...(data.agendaItems || []), 'New Item'] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Agenda Item
                </button>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Facilitator</label>
                <AutoResizeTextarea
                    value={data.facilitator || ''}
                    onChange={(e) => updateData({ facilitator: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Duration</label>
                <AutoResizeTextarea
                    value={data.duration || ''}
                    onChange={(e) => updateData({ duration: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-2 pb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!data.hasDecision}
                        onChange={(e) => {
                            updateData({
                                hasDecision: e.target.checked,
                                decision: e.target.checked && !data.decision ? { criteria: [], outcome: 'pending' } : data.decision
                            });
                        }}
                        className="rounded border-slate-300 focus:ring-blue-500"
                    />
                    Requires Decision Gate?
                </label>

                {data.hasDecision && data.decision && (
                    <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-slate-200">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Decision Criteria</label>
                        {(data.decision.criteria || []).map((item: string, i: number) => (
                            <div key={i} className="flex gap-2">
                                <AutoResizeTextarea
                                    value={item}
                                    onChange={(e) => {
                                        const newCriteria = [...data.decision!.criteria];
                                        newCriteria[i] = e.target.value;
                                        updateData({ decision: { ...data.decision!, criteria: newCriteria } });
                                    }}
                                    className="flex-1"
                                />
                                <button
                                    onClick={() => {
                                        const newCriteria = [...data.decision!.criteria];
                                        newCriteria.splice(i, 1);
                                        updateData({ decision: { ...data.decision!, criteria: newCriteria } });
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ decision: { ...data.decision!, criteria: [...(data.decision!.criteria || []), 'New Criteria'] } })}
                            className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Plus size={14} /> Add Criteria
                        </button>

                        <label className="text-xs font-medium text-slate-700 mt-2">Outcome</label>
                        <Dropdown
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                            ]}
                            value={data.decision.outcome || 'pending'}
                            onChange={(val) => updateData({ decision: { ...data.decision!, outcome: val as 'pending' | 'approved' | 'rejected' } })}
                            placeholder="Select Outcome…"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
