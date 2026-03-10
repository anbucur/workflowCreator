import React from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { useInfographicStore } from '../../../../store/useInfographicStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface Track {
    id: string;
    label: string;
    description: string;
    roleIds: string[];
    items: string[];
}

interface ParallelData {
    tracks: Track[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<ParallelData>) => void;
}

export const ParallelEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const roles = useInfographicStore((s) => s.roles);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const data = (step as any).data as ParallelData;

    return (
        <div className="flex flex-col gap-4">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tracks</label>
            {(data.tracks || []).map((track: Track, i: number) => (
                <div key={track.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Track {i + 1}</span>
                        <button
                            onClick={() => {
                                const newTracks = [...data.tracks];
                                newTracks.splice(i, 1);
                                updateData({ tracks: newTracks });
                            }}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                    <AutoResizeTextarea
                        placeholder="Label"
                        value={track.label}
                        onChange={(e) => {
                            const newTracks = [...data.tracks];
                            newTracks[i] = { ...track, label: e.target.value };
                            updateData({ tracks: newTracks });
                        }}
                    />
                    <AutoResizeTextarea
                        placeholder="Description"
                        value={track.description}
                        onChange={(e) => {
                            const newTracks = [...data.tracks];
                            newTracks[i] = { ...track, description: e.target.value };
                            updateData({ tracks: newTracks });
                        }}
                        minRows={2}
                    />
                    <label className={`text-xs font-medium mt-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Items</label>
                    {(track.items || []).map((item: string, j: number) => (
                        <div
                            key={j}
                            draggable
                            onDragStart={(e) => {
                                setDraggedIndex(j);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedIndex === null || draggedIndex === j) return;
                                const newItems = [...track.items];
                                const dragged = newItems.splice(draggedIndex, 1)[0];
                                newItems.splice(j, 0, dragged);
                                const newTracks = [...data.tracks];
                                newTracks[i] = { ...track, items: newItems };
                                updateData({ tracks: newTracks });
                                setDraggedIndex(null);
                            }}
                            onDragEnd={() => setDraggedIndex(null)}
                            className={`flex gap-2 items-center transition-opacity duration-200 ${draggedIndex === j ? 'opacity-50' : ''}`}
                        >
                            <div className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing p-1">
                                <GripVertical size={14} />
                            </div>
                            <AutoResizeTextarea
                                value={item}
                                onChange={(e) => {
                                    const newItems = [...track.items];
                                    newItems[j] = e.target.value;
                                    const newTracks = [...data.tracks];
                                    newTracks[i] = { ...track, items: newItems };
                                    updateData({ tracks: newTracks });
                                }}
                                className="flex-1"
                            />
                            <button
                                onClick={() => {
                                    const newItems = [...track.items];
                                    newItems.splice(j, 1);
                                    const newTracks = [...data.tracks];
                                    newTracks[i] = { ...track, items: newItems };
                                    updateData({ tracks: newTracks });
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newItems = [...(track.items || []), 'New Item'];
                            const newTracks = [...data.tracks];
                            newTracks[i] = { ...track, items: newItems };
                            updateData({ tracks: newTracks });
                        }}
                        className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                        <Plus size={14} /> Add Item
                    </button>

                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Assigned Roles</label>
                        <div className="flex flex-col gap-1.5">
                            {roles.map((role) => (
                                <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(track.roleIds || []).includes(role.id)}
                                        onChange={() => {
                                            const currentRoleIds = track.roleIds || [];
                                            const newRoleIds = currentRoleIds.includes(role.id)
                                                ? currentRoleIds.filter((id: string) => id !== role.id)
                                                : [...currentRoleIds, role.id];
                                            const newTracks = [...data.tracks];
                                            newTracks[i] = { ...track, roleIds: newRoleIds };
                                            updateData({ tracks: newTracks });
                                        }}
                                        className={`rounded text-blue-500 focus:ring-blue-500 transition-colors duration-300 ${isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300'}`}
                                    />
                                    <span className={`text-sm flex items-center gap-1.5 transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <span
                                            className="w-3 h-3 rounded-full inline-block"
                                            style={{ backgroundColor: role.color }}
                                        />
                                        {role.name}
                                    </span>
                                </label>
                            ))}
                            {roles.length === 0 && (
                                <span className={`text-sm italic transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No roles defined.</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <button
                onClick={() => updateData({ tracks: [...(data.tracks || []), { id: createId(), label: 'New Track', description: '', roleIds: [], items: [] }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Track
            </button>
        </div>
    );
};
