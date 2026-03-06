import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { ColorPicker } from '../shared/ColorPicker';
import { Trash2 } from 'lucide-react';
import { getContrastTextColor } from '../../utils/contrast';

export const PhaseEditor: React.FC = () => {
    const selectedElement = useUiStore((s) => s.selectedElement);
    const phases = useInfographicStore((s) => s.phases);
    const updatePhase = useInfographicStore((s) => s.updatePhase);
    const removePhase = useInfographicStore((s) => s.removePhase);
    const setSelectedElement = useUiStore((s) => s.setSelectedElement);

    if (selectedElement?.type !== 'phase') return null;

    const phase = phases.find((p) => p.id === selectedElement.phaseId);
    if (!phase) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Edit Phase</h2>
                <button
                    onClick={() => {
                        removePhase(phase.id);
                        setSelectedElement(null);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete Phase"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="phase-title" className="text-xs font-medium text-slate-700">Title</label>
                    <input
                        id="phase-title"
                        type="text"
                        value={phase.title}
                        onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Enter phase title"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="phase-subtitle" className="text-xs font-medium text-slate-700">Subtitle</label>
                    <input
                        id="phase-subtitle"
                        type="text"
                        value={phase.subtitle}
                        onChange={(e) => updatePhase(phase.id, { subtitle: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Enter phase subtitle"
                    />
                </div>

                <ColorPicker
                    label="Background Color"
                    color={phase.backgroundColor}
                    onChange={(color) => updatePhase(phase.id, {
                        backgroundColor: color,
                        textColor: getContrastTextColor(color),
                    })}
                />

                <ColorPicker
                    label="Text Color"
                    color={phase.textColor}
                    onChange={(color) => updatePhase(phase.id, { textColor: color })}
                />
            </div>
        </div>
    );
};
