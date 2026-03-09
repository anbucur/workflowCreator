import React from 'react';
import type { Step } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { createId } from '../../../types/defaults';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Dropdown } from '../../shared/Dropdown';
import { AutoResizeTextarea } from '../../shared/AutoResizeTextarea';

interface Props {
    step: Step;
    phaseId: string;
}

export const StepDataEditor: React.FC<Props> = ({ step, phaseId }) => {
    const updateStep = useInfographicStore((s) => s.updateStep);
    const roles = useInfographicStore((s) => s.roles);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

    const updateData = (newData: any) => {
        updateStep(phaseId, step.id, { data: { ...(step as any).data, ...newData } } as any);
    };

    const renderEditor = () => {
        switch (step.type) {
            case 'meeting': {
                const data = (step as any).data;
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
                                                    const newCriteria = [...data.decision.criteria];
                                                    newCriteria[i] = e.target.value;
                                                    updateData({ decision: { ...data.decision, criteria: newCriteria } });
                                                }}
                                                className="flex-1"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newCriteria = [...data.decision.criteria];
                                                    newCriteria.splice(i, 1);
                                                    updateData({ decision: { ...data.decision, criteria: newCriteria } });
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => updateData({ decision: { ...data.decision, criteria: [...(data.decision.criteria || []), 'New Criteria'] } })}
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
                                        onChange={(val) => updateData({ decision: { ...data.decision, outcome: val } })}
                                        placeholder="Select Outcome…"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'decision': {
                const data = (step as any).data;
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
                                onChange={(val) => updateData({ outcome: val })}
                                placeholder="Select Outcome…"
                            />
                        </div>
                    </div>
                );
            }

            case 'parallel': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tracks</label>
                        {(data.tracks || []).map((track: any, i: number) => (
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

                                {/* Role Assignment for Track */}
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
            }

            case 'checklist': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Checklist Items</label>
                        {(data.items || []).map((item: any, i: number) => (
                            <div key={item.id} className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={(e) => {
                                        const newItems = [...data.items];
                                        newItems[i] = { ...item, checked: e.target.checked };
                                        updateData({ items: newItems });
                                    }}
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
                            onClick={() => updateData({ items: [...(data.items || []), { id: createId(), text: 'New Item', checked: false }] })}
                            className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                        >
                            <Plus size={14} /> Add Checklist Item
                        </button>
                    </div>
                );
            }

            case 'handoff': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>From Team</label>
                            <input
                                type="text"
                                value={data.fromTeam}
                                onChange={(e) => updateData({ fromTeam: e.target.value })}
                                className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>To Team</label>
                            <input
                                type="text"
                                value={data.toTeam}
                                onChange={(e) => updateData({ toTeam: e.target.value })}
                                className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Artifacts</label>
                            {(data.artifacts || []).map((item: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <AutoResizeTextarea
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.artifacts];
                                            newItems[i] = e.target.value;
                                            updateData({ artifacts: newItems });
                                        }}
                                        className="flex-1"
                                    />
                                    <button onClick={() => { const n = [...data.artifacts]; n.splice(i, 1); updateData({ artifacts: n }); }} className="p-1.5 text-red-500 rounded"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ artifacts: [...(data.artifacts || []), 'New Artifact'] })}
                                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Add Artifact
                            </button>
                        </div>
                    </div>
                );
            }

            case 'milestone': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                            <Dropdown
                                options={[
                                    { value: 'none', label: 'None' },
                                    { value: 'not-started', label: 'Not Started' },
                                    { value: 'in-progress', label: 'In Progress' },
                                    { value: 'completed', label: 'Completed' },
                                ]}
                                value={data.status || 'not-started'}
                                onChange={(val) => updateData({ status: val })}
                                placeholder="Select Status…"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target Date</label>
                            <input
                                type="date"
                                value={data.targetDate || ''}
                                onChange={(e) => updateData({ targetDate: e.target.value })}
                                className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Deliverables</label>
                            {(data.deliverables || []).map((item: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <AutoResizeTextarea
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.deliverables];
                                            newItems[i] = e.target.value;
                                            updateData({ deliverables: newItems });
                                        }}
                                        className="flex-1"
                                    />
                                    <button onClick={() => { const n = [...data.deliverables]; n.splice(i, 1); updateData({ deliverables: n }); }} className="p-1.5 text-red-500 rounded"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ deliverables: [...(data.deliverables || []), 'New Deliverable'] })}
                                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Add Deliverable
                            </button>
                        </div>
                    </div>
                );
            }

            // Additional Step types like document, estimation, collaboration, timeline, risk, metrics can follow similarly
            case 'document': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Documents</label>
                        {(data.documents || []).map((doc: any, i: number) => (
                            <div key={doc.id} className="flex flex-col gap-2 pb-2">
                                <AutoResizeTextarea
                                    placeholder="Document Name"
                                    value={doc.name}
                                    onChange={(e) => {
                                        const newDocs = [...data.documents];
                                        newDocs[i] = { ...doc, name: e.target.value };
                                        updateData({ documents: newDocs });
                                    }}
                                />
                                <Dropdown
                                    options={[
                                        { value: 'spec', label: 'Specification' },
                                        { value: 'diagram', label: 'Diagram' },
                                        { value: 'guide', label: 'Guide' },
                                        { value: 'other', label: 'Other' },
                                    ]}
                                    value={doc.docType}
                                    onChange={(val) => {
                                        const newDocs = [...data.documents];
                                        newDocs[i] = { ...doc, docType: val };
                                        updateData({ documents: newDocs });
                                    }}
                                    placeholder="Select Type…"
                                />
                                <button
                                    onClick={() => {
                                        const newDocs = [...data.documents];
                                        newDocs.splice(i, 1);
                                        updateData({ documents: newDocs });
                                    }}
                                    className="self-end text-xs text-red-500 hover:underline"
                                >
                                    Remove Document
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ documents: [...(data.documents || []), { id: createId(), name: 'New Document', docType: 'spec' }] })}
                            className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                        >
                            <Plus size={14} /> Add Document
                        </button>
                    </div>
                )
            }

            case 'collaboration': {
                const data = (step as any).data;
                const roles = useInfographicStore.getState().roles || [];

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
                            {(data.participants || []).map((p: any, i: number) => (
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
                                    <button onClick={() => { const n = [...data.participants]; n.splice(i, 1); updateData({ participants: n }); }} className="p-1.5 text-red-500 rounded flex-shrink-0"><Trash2 size={14} /></button>
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
                                    <button onClick={() => { const n = [...data.finalItems]; n.splice(i, 1); updateData({ finalItems: n }); }} className="p-1.5 text-red-500 rounded"><Trash2 size={14} /></button>
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
            }

            case 'timeline': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Timeline Entries</label>
                        {(data.entries || []).map((entry: any, i: number) => (
                            <div key={entry.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Entry {i + 1}</span>
                                    <button
                                        onClick={() => {
                                            const newEntries = [...data.entries];
                                            newEntries.splice(i, 1);
                                            updateData({ entries: newEntries });
                                        }}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <AutoResizeTextarea
                                    placeholder="Label"
                                    value={entry.label}
                                    onChange={(e) => {
                                        const newEntries = [...data.entries];
                                        newEntries[i] = { ...entry, label: e.target.value };
                                        updateData({ entries: newEntries });
                                    }}
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Start Date</label>
                                        <input
                                            type="date"
                                            value={entry.startDate}
                                            onChange={(e) => {
                                                const newEntries = [...data.entries];
                                                newEntries[i] = { ...entry, startDate: e.target.value };
                                                updateData({ entries: newEntries });
                                            }}
                                            className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>End Date</label>
                                        <input
                                            type="date"
                                            value={entry.endDate}
                                            onChange={(e) => {
                                                const newEntries = [...data.entries];
                                                newEntries[i] = { ...entry, endDate: e.target.value };
                                                updateData({ entries: newEntries });
                                            }}
                                            className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Color</label>
                                    <div className="flex gap-2 mt-1">
                                        {['#3b82f6', '#22c55e', '#f97316', '#ef4444', '#a855f7', '#eab308', '#14b8a6'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const newEntries = [...data.entries];
                                                    newEntries[i] = { ...entry, color };
                                                    updateData({ entries: newEntries });
                                                }}
                                                className={`w-6 h-6 rounded-full border-2 ${entry.color === color ? (isDarkMode ? 'border-white' : 'border-slate-800') : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ entries: [...(data.entries || []), { id: createId(), label: 'New Entry', startDate: '2025-01-01', endDate: '2025-01-15', color: '#3b82f6' }] })}
                            className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Plus size={14} /> Add Entry
                        </button>
                    </div>
                );
            }

            case 'risk': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Severity Level</label>
                            <Dropdown
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                    { value: 'critical', label: 'Critical' },
                                ]}
                                value={data.severity || 'medium'}
                                onChange={(val) => updateData({ severity: val })}
                                placeholder="Select Severity..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Risk Items</label>
                            {(data.risks || []).map((risk: any, i: number) => (
                                <div key={risk.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                                    <div className="flex gap-2 items-start">
                                        <span className="text-xs font-semibold text-red-600 mt-2">{i + 1}.</span>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <AutoResizeTextarea
                                                placeholder="Risk description"
                                                value={risk.text}
                                                onChange={(e) => {
                                                    const newRisks = [...data.risks];
                                                    newRisks[i] = { ...risk, text: e.target.value };
                                                    updateData({ risks: newRisks });
                                                }}
                                            />
                                            <AutoResizeTextarea
                                                placeholder="Mitigation / Review (e.g., Reinsurance review)"
                                                value={risk.mitigation || ''}
                                                onChange={(e) => {
                                                    const newRisks = [...data.risks];
                                                    newRisks[i] = { ...risk, mitigation: e.target.value };
                                                    updateData({ risks: newRisks });
                                                }}
                                                className="text-sm italic"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newRisks = [...data.risks];
                                                newRisks.splice(i, 1);
                                                updateData({ risks: newRisks });
                                            }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ risks: [...(data.risks || []), { id: createId(), text: 'New Risk', mitigation: '' }] })}
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                            >
                                <Plus size={14} /> Add Risk Item
                            </button>
                        </div>
                    </div>
                );
            }

            case 'metrics': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Metrics</label>
                        {(data.metrics || []).map((metric: any, i: number) => (
                            <div key={metric.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Metric {i + 1}</span>
                                    <button
                                        onClick={() => {
                                            const newMetrics = [...data.metrics];
                                            newMetrics.splice(i, 1);
                                            updateData({ metrics: newMetrics });
                                        }}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <AutoResizeTextarea
                                    placeholder="Label"
                                    value={metric.label}
                                    onChange={(e) => {
                                        const newMetrics = [...data.metrics];
                                        newMetrics[i] = { ...metric, label: e.target.value };
                                        updateData({ metrics: newMetrics });
                                    }}
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Value</label>
                                        <input
                                            type="number"
                                            value={metric.value}
                                            onChange={(e) => {
                                                const newMetrics = [...data.metrics];
                                                newMetrics[i] = { ...metric, value: parseFloat(e.target.value) || 0 };
                                                updateData({ metrics: newMetrics });
                                            }}
                                            className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Target (optional)</label>
                                        <input
                                            type="number"
                                            value={metric.target || ''}
                                            onChange={(e) => {
                                                const newMetrics = [...data.metrics];
                                                newMetrics[i] = { ...metric, target: e.target.value ? parseFloat(e.target.value) : undefined };
                                                updateData({ metrics: newMetrics });
                                            }}
                                            className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-24">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Unit</label>
                                        <input
                                            type="text"
                                            value={metric.unit}
                                            onChange={(e) => {
                                                const newMetrics = [...data.metrics];
                                                newMetrics[i] = { ...metric, unit: e.target.value };
                                                updateData({ metrics: newMetrics });
                                            }}
                                            className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Format</label>
                                        <Dropdown
                                            options={[
                                                { value: 'number', label: 'Number' },
                                                { value: 'progress', label: 'Progress Bar' },
                                                { value: 'badge', label: 'Badge' },
                                            ]}
                                            value={metric.format}
                                            onChange={(val) => {
                                                const newMetrics = [...data.metrics];
                                                newMetrics[i] = { ...metric, format: val };
                                                updateData({ metrics: newMetrics });
                                            }}
                                            placeholder="Select Format..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ metrics: [...(data.metrics || []), { id: createId(), label: 'New Metric', value: 50, target: 100, unit: '%', format: 'progress' }] })}
                            className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Plus size={14} /> Add Metric
                        </button>
                    </div>
                );
            }

            case 'estimation': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Estimation Method</label>
                            <Dropdown
                                options={[
                                    { value: 'tshirt', label: 'T-Shirt Sizing (XS-XXL)' },
                                    { value: 'points', label: 'Story Points' },
                                    { value: 'hours', label: 'Hours' },
                                ]}
                                value={data.method}
                                onChange={(val) => updateData({ method: val })}
                                placeholder="Select Method..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                Overall Value
                            </label>
                            {data.method === 'tshirt' ? (
                                <Dropdown
                                    options={[
                                        { value: 'XS', label: 'XS - Extra Small' },
                                        { value: 'S', label: 'S - Small' },
                                        { value: 'M', label: 'M - Medium' },
                                        { value: 'L', label: 'L - Large' },
                                        { value: 'XL', label: 'XL - Extra Large' },
                                        { value: 'XXL', label: 'XXL - Extra Extra Large' },
                                    ]}
                                    value={data.value || 'M'}
                                    onChange={(val) => updateData({ value: val })}
                                    placeholder="Select Size..."
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={data.value || ''}
                                    onChange={(e) => updateData({ value: e.target.value })}
                                    className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                    placeholder={data.method === 'points' ? 'e.g., 8' : 'e.g., 40'}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Breakdown</label>
                            {(data.breakdown || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <AutoResizeTextarea
                                        placeholder="Label (e.g., Dev Effort)"
                                        value={item.label}
                                        onChange={(e) => {
                                            const newBreakdown = [...(data.breakdown || [])];
                                            newBreakdown[i] = { ...item, label: e.target.value };
                                            updateData({ breakdown: newBreakdown });
                                        }}
                                        className="flex-1"
                                    />
                                    {data.method === 'tshirt' ? (
                                        <Dropdown
                                            options={[
                                                { value: 'XS', label: 'XS' },
                                                { value: 'S', label: 'S' },
                                                { value: 'M', label: 'M' },
                                                { value: 'L', label: 'L' },
                                                { value: 'XL', label: 'XL' },
                                                { value: 'XXL', label: 'XXL' },
                                            ]}
                                            value={item.value}
                                            onChange={(val) => {
                                                const newBreakdown = [...(data.breakdown || [])];
                                                newBreakdown[i] = { ...item, value: val };
                                                updateData({ breakdown: newBreakdown });
                                            }}
                                            className="w-20"
                                            placeholder="Size"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => {
                                                const newBreakdown = [...(data.breakdown || [])];
                                                newBreakdown[i] = { ...item, value: e.target.value };
                                                updateData({ breakdown: newBreakdown });
                                            }}
                                            className={`w-20 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            placeholder={data.method === 'points' ? 'pts' : 'hrs'}
                                        />
                                    )}
                                    <button
                                        onClick={() => {
                                            const newBreakdown = [...(data.breakdown || [])];
                                            newBreakdown.splice(i, 1);
                                            updateData({ breakdown: newBreakdown });
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ breakdown: [...(data.breakdown || []), { label: 'New Item', value: data.method === 'tshirt' ? 'M' : '0' }] })}
                                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Add Breakdown Item
                            </button>
                        </div>
                    </div>
                );
            }

            case 'kanban': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        {(data.columns || []).map((col: any, ci: number) => (
                            <div key={col.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${isDarkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={col.color}
                                        onChange={(e) => {
                                            const newCols = [...data.columns];
                                            newCols[ci] = { ...col, color: e.target.value };
                                            updateData({ columns: newCols });
                                        }}
                                        className="w-6 h-6 rounded border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={col.title}
                                        onChange={(e) => {
                                            const newCols = [...data.columns];
                                            newCols[ci] = { ...col, title: e.target.value };
                                            updateData({ columns: newCols });
                                        }}
                                        className={`flex-1 px-2 py-1.5 text-sm font-semibold border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                    />
                                    <button
                                        onClick={() => {
                                            const newCols = data.columns.filter((_: any, i: number) => i !== ci);
                                            updateData({ columns: newCols });
                                        }}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cards</label>
                                {(col.cards || []).map((card: any, cdi: number) => (
                                    <div key={card.id} className="flex items-start gap-2 pl-2">
                                        <div className="flex-1 flex flex-col gap-1">
                                            <input
                                                type="text"
                                                value={card.title}
                                                onChange={(e) => {
                                                    const newCols = [...data.columns];
                                                    const newCards = [...col.cards];
                                                    newCards[cdi] = { ...card, title: e.target.value };
                                                    newCols[ci] = { ...col, cards: newCards };
                                                    updateData({ columns: newCols });
                                                }}
                                                placeholder="Card title"
                                                className={`px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={card.assignee || ''}
                                                    onChange={(e) => {
                                                        const newCols = [...data.columns];
                                                        const newCards = [...col.cards];
                                                        newCards[cdi] = { ...card, assignee: e.target.value || undefined };
                                                        newCols[ci] = { ...col, cards: newCards };
                                                        updateData({ columns: newCols });
                                                    }}
                                                    placeholder="Assignee"
                                                    className={`flex-1 px-2 py-1 text-xs border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                                />
                                                <Dropdown
                                                    options={[
                                                        { value: 'low', label: 'Low' },
                                                        { value: 'medium', label: 'Medium' },
                                                        { value: 'high', label: 'High' },
                                                        { value: 'critical', label: 'Critical' },
                                                    ]}
                                                    value={card.priority}
                                                    onChange={(val) => {
                                                        const newCols = [...data.columns];
                                                        const newCards = [...col.cards];
                                                        newCards[cdi] = { ...card, priority: val };
                                                        newCols[ci] = { ...col, cards: newCards };
                                                        updateData({ columns: newCols });
                                                    }}
                                                    className="w-24"
                                                    placeholder="Priority"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newCols = [...data.columns];
                                                const newCards = col.cards.filter((_: any, i: number) => i !== cdi);
                                                newCols[ci] = { ...col, cards: newCards };
                                                updateData({ columns: newCols });
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded mt-1"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newCols = [...data.columns];
                                        newCols[ci] = { ...col, cards: [...col.cards, { id: createId(), title: 'New Card', labels: [], priority: 'medium' }] };
                                        updateData({ columns: newCols });
                                    }}
                                    className={`flex items-center justify-center gap-1 py-1 text-xs font-medium rounded ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                    <Plus size={12} /> Add Card
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ columns: [...(data.columns || []), { id: createId(), title: 'New Column', color: '#e2e8f0', cards: [] }] })}
                            className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Plus size={14} /> Add Column
                        </button>
                    </div>
                );
            }

            case 'sprint': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sprint Name</label>
                            <input
                                type="text"
                                value={data.sprintName || ''}
                                onChange={(e) => updateData({ sprintName: e.target.value })}
                                className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Start Date</label>
                                <input
                                    type="date"
                                    value={data.startDate || ''}
                                    onChange={(e) => updateData({ startDate: e.target.value })}
                                    className={`px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>End Date</label>
                                <input
                                    type="date"
                                    value={data.endDate || ''}
                                    onChange={(e) => updateData({ endDate: e.target.value })}
                                    className={`px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Velocity Target</label>
                            <input
                                type="number"
                                value={data.velocityTarget || 0}
                                onChange={(e) => updateData({ velocityTarget: parseInt(e.target.value) || 0 })}
                                className={`px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Stories</label>
                            {(data.stories || []).map((story: any, i: number) => (
                                <div key={story.id} className={`flex flex-col gap-1.5 p-2 rounded border ${isDarkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={story.title}
                                            onChange={(e) => {
                                                const newStories = [...data.stories];
                                                newStories[i] = { ...story, title: e.target.value };
                                                updateData({ stories: newStories });
                                            }}
                                            placeholder="Story title"
                                            className={`flex-1 px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const newStories = data.stories.filter((_: any, idx: number) => idx !== i);
                                                updateData({ stories: newStories });
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-16">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Points</label>
                                            <input
                                                type="number"
                                                value={story.points}
                                                onChange={(e) => {
                                                    const newStories = [...data.stories];
                                                    newStories[i] = { ...story, points: parseInt(e.target.value) || 0 };
                                                    updateData({ stories: newStories });
                                                }}
                                                className={`w-full px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
                                            <Dropdown
                                                options={[
                                                    { value: 'todo', label: 'To Do' },
                                                    { value: 'in_progress', label: 'In Progress' },
                                                    { value: 'in_review', label: 'In Review' },
                                                    { value: 'done', label: 'Done' },
                                                ]}
                                                value={story.status}
                                                onChange={(val) => {
                                                    const newStories = [...data.stories];
                                                    newStories[i] = { ...story, status: val };
                                                    updateData({ stories: newStories });
                                                }}
                                                placeholder="Status"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assignee</label>
                                            <input
                                                type="text"
                                                value={story.assignee || ''}
                                                onChange={(e) => {
                                                    const newStories = [...data.stories];
                                                    newStories[i] = { ...story, assignee: e.target.value || undefined };
                                                    updateData({ stories: newStories });
                                                }}
                                                placeholder="Name"
                                                className={`w-full px-2 py-1 text-xs border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ stories: [...(data.stories || []), { id: createId(), title: 'New Story', points: 3, status: 'todo', labels: [] }] })}
                                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Add Story
                            </button>
                        </div>
                    </div>
                );
            }

            case 'roadmap': {
                const data = (step as any).data;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quarters</label>
                            {(data.quarters || []).map((q: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => {
                                            const newQuarters = [...data.quarters];
                                            newQuarters[i] = e.target.value;
                                            updateData({ quarters: newQuarters });
                                        }}
                                        className={`flex-1 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                    />
                                    <button
                                        onClick={() => {
                                            const newQuarters = data.quarters.filter((_: any, idx: number) => idx !== i);
                                            updateData({ quarters: newQuarters });
                                        }}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ quarters: [...(data.quarters || []), `Q${(data.quarters?.length || 0) + 1} ${new Date().getFullYear()}`] })}
                                className={`flex items-center justify-center gap-1 py-1 text-xs font-medium rounded ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={12} /> Add Quarter
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Items</label>
                            {(data.items || []).map((item: any, i: number) => (
                                <div key={item.id} className={`flex flex-col gap-1.5 p-2 rounded border ${isDarkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => {
                                                const newItems = [...data.items];
                                                newItems[i] = { ...item, title: e.target.value };
                                                updateData({ items: newItems });
                                            }}
                                            placeholder="Item title"
                                            className={`flex-1 px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const newItems = data.items.filter((_: any, idx: number) => idx !== i);
                                                updateData({ items: newItems });
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <AutoResizeTextarea
                                        value={item.description || ''}
                                        onChange={(e) => {
                                            const newItems = [...data.items];
                                            newItems[i] = { ...item, description: e.target.value };
                                            updateData({ items: newItems });
                                        }}
                                        placeholder="Description (optional)"
                                        minRows={1}
                                    />
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quarter</label>
                                            <Dropdown
                                                options={(data.quarters || []).map((q: string) => ({ value: q, label: q }))}
                                                value={item.quarter}
                                                onChange={(val) => {
                                                    const newItems = [...data.items];
                                                    newItems[i] = { ...item, quarter: val };
                                                    updateData({ items: newItems });
                                                }}
                                                placeholder="Quarter"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Type</label>
                                            <Dropdown
                                                options={[
                                                    { value: 'feature', label: 'Feature' },
                                                    { value: 'epic', label: 'Epic' },
                                                    { value: 'initiative', label: 'Initiative' },
                                                    { value: 'release', label: 'Release' },
                                                    { value: 'milestone', label: 'Milestone' },
                                                ]}
                                                value={item.type}
                                                onChange={(val) => {
                                                    const newItems = [...data.items];
                                                    newItems[i] = { ...item, type: val };
                                                    updateData({ items: newItems });
                                                }}
                                                placeholder="Type"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
                                            <Dropdown
                                                options={[
                                                    { value: 'planned', label: 'Planned' },
                                                    { value: 'in_progress', label: 'In Progress' },
                                                    { value: 'completed', label: 'Completed' },
                                                    { value: 'cancelled', label: 'Cancelled' },
                                                ]}
                                                value={item.status}
                                                onChange={(val) => {
                                                    const newItems = [...data.items];
                                                    newItems[i] = { ...item, status: val };
                                                    updateData({ items: newItems });
                                                }}
                                                placeholder="Status"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progress</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={item.progress ?? 0}
                                                onChange={(e) => {
                                                    const newItems = [...data.items];
                                                    newItems[i] = { ...item, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) };
                                                    updateData({ items: newItems });
                                                }}
                                                className={`w-full px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Team</label>
                                            <input
                                                type="text"
                                                value={item.team || ''}
                                                onChange={(e) => {
                                                    const newItems = [...data.items];
                                                    newItems[i] = { ...item, team: e.target.value || undefined };
                                                    updateData({ items: newItems });
                                                }}
                                                placeholder="Team name"
                                                className={`w-full px-2 py-1 text-xs border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => updateData({ items: [...(data.items || []), { id: createId(), title: 'New Item', quarter: data.quarters?.[0] || 'Q1 2025', status: 'planned', type: 'feature', progress: 0 }] })}
                                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    const editor = renderEditor();

    if (!editor) return null;

    return (
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 capitalize">{step.type} Data</h3>
            {editor}
        </div>
    );
};
