import React, { useMemo } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Trash2 } from 'lucide-react';
import { IconSelector } from '../shared/IconSelector';
import { StepDataEditor } from './step-editors/StepDataEditor';
import { STEP_TYPE_LABELS } from '../../types';
import { getDefaultStepData } from '../../types/defaults';
import { Dropdown, type DropdownOption } from '../shared/Dropdown';
import { AutoResizeTextarea } from '../shared/AutoResizeTextarea';

export const StepEditor: React.FC = () => {
    const selectedElement = useUiStore((s) => s.selectedElement);
    const phases = useInfographicStore((s) => s.phases);
    const roles = useInfographicStore((s) => s.roles);
    const updateStep = useInfographicStore((s) => s.updateStep);
    const removeStep = useInfographicStore((s) => s.removeStep);
    const toggleStepRole = useInfographicStore((s) => s.toggleStepRole);
    const setSelectedElement = useUiStore((s) => s.setSelectedElement);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const stepTypeOptions: DropdownOption[] = useMemo(() =>
        Object.entries(STEP_TYPE_LABELS).map(([value, label]) => ({ value, label })),
        []
    );

    if (selectedElement?.type !== 'step') return null;

    const phase = phases.find((p) => p.id === selectedElement.phaseId);
    const step = phase?.steps.find((s) => s.id === selectedElement.stepId);

    if (!phase || !step) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Edit Step</h2>
                <button
                    onClick={() => {
                        removeStep(phase.id, step.id);
                        setSelectedElement(null);
                    }}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                    title="Delete Step"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Title</label>
                    <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(phase.id, step.id, { title: e.target.value })}
                        className={`px-3 py-2 text-sm border rounded focus:outline-none focus:border-blue-500 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Step Type</label>
                    <Dropdown
                        options={stepTypeOptions}
                        value={step.type}
                        onChange={(val) => {
                            const newType = val as any;
                            updateStep(phase.id, step.id, {
                                type: newType,
                                data: getDefaultStepData(newType) as any
                            });
                        }}
                        placeholder="Select Type…"
                    />
                </div>

                {step.type === 'standard' && (
                    <div className="flex flex-col gap-1.5">
                        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Custom Label <span className={`font-normal transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Meeting, Review, Sprint…"
                            value={step.customLabel || ''}
                            onChange={(e) => updateStep(phase.id, step.id, { customLabel: e.target.value || undefined })}
                            className={`px-3 py-2 text-sm border rounded focus:outline-none focus:border-blue-500 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                        />
                        <p className={`text-[10px] transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Shown as a badge in the card header</p>
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                    <AutoResizeTextarea
                        value={step.description}
                        onChange={(e) => updateStep(phase.id, step.id, { description: e.target.value })}
                        minRows={2}
                    />
                </div>

                <IconSelector
                    label="Icon"
                    value={step.iconName}
                    onChange={(iconName) => updateStep(phase.id, step.id, { iconName })}
                />

                <div className="flex flex-col gap-2 mt-2">
                    <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assigned Roles</label>
                    <div className="flex flex-col gap-2 pl-1">
                        {roles.map((role) => (
                            <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={step.roleIds.includes(role.id)}
                                    onChange={() => toggleStepRole(phase.id, step.id, role.id)}
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

                <StepDataEditor step={step} phaseId={phase.id} />
            </div>
        </div>
    );
};