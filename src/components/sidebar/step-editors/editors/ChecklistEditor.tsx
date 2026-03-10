import React from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

interface ChecklistData {
    items: ChecklistItem[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<ChecklistData>) => void;
}

export const ChecklistEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const data = (step as any).data as ChecklistData;

    return (
        <div className="flex flex-col gap-2">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Checklist Items</label>
            {(data.items || []).map((item: ChecklistItem, i: number) => (
                <div
                    key={item.id}
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
                        const newItems = [...data.items];
                        const draggedItem = newItems.splice(draggedIndex, 1)[0];
                        newItems.splice(i, 0, draggedItem);
                        updateData({ items: newItems });
                        setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex gap-2 items-center transition-opacity duration-200 ${draggedIndex === i ? 'opacity-50' : ''}`}
                >
                    <div className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing p-1">
                        <GripVertical size={14} />
                    </div>
                    <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                            const newItems = [...data.items];
                            newItems[i] = { ...item, completed: e.target.checked };
                            updateData({ items: newItems });
                        }}
                        className="rounded border-slate-300"
                    />
                    <AutoResizeTextarea
                        value={item.text}
                        onChange={(e) => {
                            const newItems = [...data.items];
                            newItems[i] = { ...item, text: e.target.value };
                            updateData({ items: newItems });
                        }}
                        className="flex-1"
                    />
                    <button
                        onClick={() => {
                            const newItems = [...data.items];
                            newItems.splice(i, 1);
                            updateData({ items: newItems });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button
                onClick={() => updateData({ items: [...(data.items || []), { id: createId(), text: 'New Item', completed: false }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Item
            </button>
        </div>
    );
};
