import React from 'react';
import type { Step } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
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
                            <label className="text-xs font-medium text-slate-700">Agenda Items</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Plus size={14} /> Add Agenda Item
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Facilitator</label>
                            <AutoResizeTextarea
                                value={data.facilitator || ''}
                                onChange={(e) => updateData({ facilitator: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Duration</label>
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
                                    <label className="text-xs font-medium text-slate-700">Decision Criteria</label>
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
                                        className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
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
                            <label className="text-xs font-medium text-slate-700">Criteria</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Plus size={14} /> Add Criteria
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Outcome</label>
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
                        <label className="text-xs font-medium text-slate-700">Tracks</label>
                        {(data.tracks || []).map((track: any, i: number) => (
                            <div key={track.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-violet-600">Track {i + 1}</span>
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
                                <label className="text-xs font-medium text-slate-600 mt-1">Items</label>
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
                                    className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded"
                                >
                                    <Plus size={14} /> Add Item
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ tracks: [...(data.tracks || []), { id: createId(), label: 'New Track', description: '', roleIds: [], items: [] }] })}
                            className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
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
                        <label className="text-xs font-medium text-slate-700">Checklist Items</label>
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
                            <label className="text-xs font-medium text-slate-700">From Team</label>
                            <input
                                type="text"
                                value={data.fromTeam}
                                onChange={(e) => updateData({ fromTeam: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">To Team</label>
                            <input
                                type="text"
                                value={data.toTeam}
                                onChange={(e) => updateData({ toTeam: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Artifacts</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
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
                            <label className="text-xs font-medium text-slate-700">Status</label>
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
                            <label className="text-xs font-medium text-slate-700">Target Date</label>
                            <input
                                type="date"
                                value={data.targetDate || ''}
                                onChange={(e) => updateData({ targetDate: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Deliverables</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
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
                        <label className="text-xs font-medium text-slate-700">Documents</label>
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
                            <label className="text-xs font-medium text-slate-700">Loop Participants</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
                            >
                                <Plus size={14} /> Add Participant
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-4 mt-2">
                            <label className="text-xs font-medium text-slate-700">Final Action Title</label>
                            <AutoResizeTextarea
                                value={data.finalActionTitle || ''}
                                onChange={(e) => updateData({ finalActionTitle: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Final Items</label>
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
                                className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
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
