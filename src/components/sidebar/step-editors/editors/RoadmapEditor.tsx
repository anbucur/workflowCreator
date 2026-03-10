import React from 'react';
import { Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface RoadmapItem {
    id: string;
    title: string;
    quarter: string;
    status: 'planned' | 'in-progress' | 'completed';
    description: string;
}

interface RoadmapData {
    items: RoadmapItem[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<RoadmapData>) => void;
}

export const RoadmapEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as RoadmapData;

    const statusColors = {
        planned: 'bg-blue-100 text-blue-700',
        'in-progress': 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700'
    };

    return (
        <div className="flex flex-col gap-4">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Roadmap Items</label>
            {(data.items || []).map((item: RoadmapItem, i: number) => (
                <div key={item.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Item {i + 1}</span>
                        <button
                            onClick={() => {
                                const newItems = [...data.items];
                                newItems.splice(i, 1);
                                updateData({ items: newItems });
                            }}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                    <AutoResizeTextarea
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => {
                            const newItems = [...data.items];
                            newItems[i] = { ...item, title: e.target.value };
                            updateData({ items: newItems });
                        }}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Q1 2025"
                            value={item.quarter}
                            onChange={(e) => {
                                const newItems = [...data.items];
                                newItems[i] = { ...item, quarter: e.target.value };
                                updateData({ items: newItems });
                            }}
                            className={`w-24 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                        <div className="flex gap-1">
                            {(['planned', 'in-progress', 'completed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        const newItems = [...data.items];
                                        newItems[i] = { ...item, status };
                                        updateData({ items: newItems });
                                    }}
                                    className={`px-2 py-1 text-xs rounded capitalize ${
                                        item.status === status ? statusColors[status] : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {status.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <AutoResizeTextarea
                        placeholder="Description"
                        value={item.description || ''}
                        onChange={(e) => {
                            const newItems = [...data.items];
                            newItems[i] = { ...item, description: e.target.value };
                            updateData({ items: newItems });
                        }}
                        className="text-sm"
                    />
                </div>
            ))}
            <button
                onClick={() => updateData({ items: [...(data.items || []), { id: createId(), title: 'New Item', quarter: 'Q1 2025', status: 'planned', description: '' }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Roadmap Item
            </button>
        </div>
    );
};
