import React from 'react';
import type { Step } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { createId } from '../../../types/defaults';
import { Trash2, Plus, GripVertical } from 'lucide-react';

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
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.agendaItems];
                                            newItems[i] = e.target.value;
                                            updateData({ agendaItems: newItems });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
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
                            <input
                                type="text"
                                value={data.facilitator || ''}
                                onChange={(e) => updateData({ facilitator: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Duration</label>
                            <input
                                type="text"
                                value={data.duration || ''}
                                onChange={(e) => updateData({ duration: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
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
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => {
                                                    const newCriteria = [...data.decision.criteria];
                                                    newCriteria[i] = e.target.value;
                                                    updateData({ decision: { ...data.decision, criteria: newCriteria } });
                                                }}
                                                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
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
                                    <select
                                        value={data.decision.outcome || 'pending'}
                                        onChange={(e) => updateData({ decision: { ...data.decision, outcome: e.target.value } })}
                                        className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
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
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.criteria];
                                            newItems[i] = e.target.value;
                                            updateData({ criteria: newItems });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
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
                            <select
                                value={data.outcome || 'pending'}
                                onChange={(e) => updateData({ outcome: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
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
                            <div key={track.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
                                <input
                                    type="text"
                                    placeholder="Label"
                                    value={track.label}
                                    onChange={(e) => {
                                        const newTracks = [...data.tracks];
                                        newTracks[i] = { ...track, label: e.target.value };
                                        updateData({ tracks: newTracks });
                                    }}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={track.description}
                                    onChange={(e) => {
                                        const newTracks = [...data.tracks];
                                        newTracks[i] = { ...track, description: e.target.value };
                                        updateData({ tracks: newTracks });
                                    }}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded min-h-[60px]"
                                />
                                <button
                                    onClick={() => {
                                        const newTracks = [...data.tracks];
                                        newTracks.splice(i, 1);
                                        updateData({ tracks: newTracks });
                                    }}
                                    className="self-end text-xs text-red-500 hover:underline"
                                >
                                    Remove Track
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ tracks: [...(data.tracks || []), { id: createId(), label: 'New Track', description: '', roleIds: [] }] })}
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
                                <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => {
                                        const newItems = [...data.items];
                                        newItems[i] = { ...item, text: e.target.value };
                                        updateData({ items: newItems });
                                    }}
                                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
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
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.artifacts];
                                            newItems[i] = e.target.value;
                                            updateData({ artifacts: newItems });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded"
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
                            <select
                                value={data.status || 'not-started'}
                                onChange={(e) => updateData({ status: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                            >
                                <option value="none">None</option>
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
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
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.deliverables];
                                            newItems[i] = e.target.value;
                                            updateData({ deliverables: newItems });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded"
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
                            <div key={doc.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
                                <input
                                    type="text"
                                    placeholder="Document Name"
                                    value={doc.name}
                                    onChange={(e) => {
                                        const newDocs = [...data.documents];
                                        newDocs[i] = { ...doc, name: e.target.value };
                                        updateData({ documents: newDocs });
                                    }}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                                />
                                <select
                                    value={doc.docType}
                                    onChange={(e) => {
                                        const newDocs = [...data.documents];
                                        newDocs[i] = { ...doc, docType: e.target.value };
                                        updateData({ documents: newDocs });
                                    }}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                                >
                                    <option value="spec">Specification</option>
                                    <option value="diagram">Diagram</option>
                                    <option value="guide">Guide</option>
                                    <option value="other">Other</option>
                                </select>
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
                                <div key={i} className="flex gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                                    <select
                                        value={p.roleId}
                                        onChange={(e) => {
                                            const newP = [...data.participants];
                                            newP[i] = { ...p, roleId: e.target.value };
                                            updateData({ participants: newP });
                                        }}
                                        className="w-1/3 px-3 py-1.5 text-sm border border-slate-300 rounded"
                                    >
                                        <option value="">Select Role...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Action"
                                        value={p.action}
                                        onChange={(e) => {
                                            const newP = [...data.participants];
                                            newP[i] = { ...p, action: e.target.value };
                                            updateData({ participants: newP });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded"
                                    />
                                    <button onClick={() => { const n = [...data.participants]; n.splice(i, 1); updateData({ participants: n }); }} className="p-1.5 text-red-500 rounded"><Trash2 size={14} /></button>
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
                            <input
                                type="text"
                                value={data.finalActionTitle || ''}
                                onChange={(e) => updateData({ finalActionTitle: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">Final Items</label>
                            {(data.finalItems || []).map((item: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...data.finalItems];
                                            newItems[i] = e.target.value;
                                            updateData({ finalItems: newItems });
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded"
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
