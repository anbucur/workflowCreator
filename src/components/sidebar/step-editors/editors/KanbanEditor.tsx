import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface KanbanColumn {
    id: string;
    title: string;
    cards: string[];
}

interface KanbanData {
    columns: KanbanColumn[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<KanbanData>) => void;
}

export const KanbanEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as KanbanData;

    const updateColumn = (colIndex: number, updates: Partial<KanbanColumn>) => {
        const newColumns = [...data.columns];
        newColumns[colIndex] = { ...newColumns[colIndex], ...updates };
        updateData({ columns: newColumns });
    };

    return (
        <div className="flex flex-col gap-4">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Kanban Columns</label>
            {(data.columns || []).map((col: KanbanColumn, colIdx: number) => (
                <div key={col.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            value={col.title}
                            onChange={(e) => updateColumn(colIdx, { title: e.target.value })}
                            className={`flex-1 px-2 py-1 text-sm font-semibold border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                        />
                        <button
                            onClick={() => {
                                const newColumns = [...data.columns];
                                newColumns.splice(colIdx, 1);
                                updateData({ columns: newColumns });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            aria-label="Remove column"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    {(col.cards || []).map((card: string, cardIdx: number) => (
                        <div key={cardIdx} className="flex gap-2 items-center ml-2">
                            <AutoResizeTextarea
                                value={card}
                                onChange={(e) => {
                                    const newCards = [...col.cards];
                                    newCards[cardIdx] = e.target.value;
                                    updateColumn(colIdx, { cards: newCards });
                                }}
                                className="flex-1 text-sm"
                            />
                            <button
                                onClick={() => {
                                    const newCards = [...col.cards];
                                    newCards.splice(cardIdx, 1);
                                    updateColumn(colIdx, { cards: newCards });
                                }}
                                className="p-1 text-red-400 hover:text-red-600 rounded"
                                aria-label="Remove card"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => updateColumn(colIdx, { cards: [...(col.cards || []), 'New Card'] })}
                        className={`flex items-center gap-1 ml-2 py-1 text-xs ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Plus size={12} /> Add Card
                    </button>
                </div>
            ))}
            <button
                onClick={() => updateData({ columns: [...(data.columns || []), { id: createId(), title: 'New Column', cards: [] }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Column
            </button>
        </div>
    );
};
