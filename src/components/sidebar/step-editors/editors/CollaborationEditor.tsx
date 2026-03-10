import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Dropdown } from '../../../shared/Dropdown';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { useInfographicStore } from '../../../../store/useInfographicStore';
import type { Step } from '../../../../types';

interface Participant {
    roleId: string;
    action: string;
}

interface CollaborationData {
    iterative: boolean;
    participants: Participant[];
    finalActionTitle: string;
    finalItems: string[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<CollaborationData>) => void;
}

export const CollaborationEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const roles = useInfographicStore((s) => s.roles);
    const data = (step as any).data as CollaborationData;

    return (
        <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                    type="checkbox"
                    checked={!!data.iterative}
                    onChange={(e) => updateData({ iterative: e.target.checked })}
                    className="rounded border-slate-300 focus:ring-blue-500"
                />
                Iterative Cycle?
            </label>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Loop Participants</label>
                {(data.participants || []).map((p: Participant, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                        <Dropdown
                            options={roles.map(r => ({ value: r.id, label: r.name, color: r.color }))}
                            value={p.roleId}
                            onChange={(roleId: string) => {
                                const newP = [...data.participants];
                                newP[i] = { ...p, roleId };
                                updateData({ participants: newP });
                            }}
                            className="w-[120px] flex-shrink-0"
                            placeholder="Select Role..."
                        />
                        <AutoResizeTextarea
                            placeholder="Action"
                            value={p.action}
                            onChange={(e) => {
                                const newP = [...data.participants];
                                newP[i] = { ...p, action: e.target.value };
                                updateData({ participants: newP });
                            }}
                            className="flex-1 min-w-0"
                        />
                        <button onClick={() => { const n = [...data.participants]; n.splice(i, 1); updateData({ participants: n }); }} className="p-1.5 text-red-500 rounded flex-shrink-0" aria-label="Remove participant"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ participants: [...(data.participants || []), { roleId: roles[0]?.id || '', action: 'New Action' }] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Participant
                </button>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-4 mt-2">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Final Action Title</label>
                <AutoResizeTextarea
                    value={data.finalActionTitle || ''}
                    onChange={(e) => updateData({ finalActionTitle: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Final Items</label>
                {(data.finalItems || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-2">
                        <AutoResizeTextarea
                            value={item}
                            onChange={(e) => {
                                const newItems = [...data.finalItems];
                                newItems[i] = e.target.value;
                                updateData({ finalItems: newItems });
                            }}
                            className="flex-1"
                        />
                        <button onClick={() => { const n = [...data.finalItems]; n.splice(i, 1); updateData({ finalItems: n }); }} className="p-1.5 text-red-500 rounded" aria-label="Remove item"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ finalItems: [...(data.finalItems || []), 'New Item'] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Item
                </button>
            </div>
        </div>
    );
};
