import React from 'react';
import { Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface EstimationItem {
    id: string;
    label: string;
    low: number;
    high: number;
    unit: string;
}

interface EstimationData {
    estimations: EstimationItem[];
    confidence: 'low' | 'medium' | 'high';
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<EstimationData>) => void;
}

export const EstimationEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as EstimationData;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Confidence Level</label>
                <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => updateData({ confidence: level })}
                            className={`px-3 py-1 text-xs rounded capitalize ${
                                data.confidence === level
                                    ? level === 'high' ? 'bg-green-500 text-white' : level === 'medium' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                                    : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Estimations</label>
                {(data.estimations || []).map((est: EstimationItem, i: number) => (
                    <div key={est.id} className="flex flex-col gap-2 pb-3 border-b border-slate-200 last:border-0">
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Item {i + 1}</span>
                            <button
                                onClick={() => {
                                    const newEst = [...data.estimations];
                                    newEst.splice(i, 1);
                                    updateData({ estimations: newEst });
                                }}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                        <AutoResizeTextarea
                            placeholder="Label (e.g., Development Time)"
                            value={est.label}
                            onChange={(e) => {
                                const newEst = [...data.estimations];
                                newEst[i] = { ...est, label: e.target.value };
                                updateData({ estimations: newEst });
                            }}
                        />
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Low</label>
                                <input
                                    type="number"
                                    value={est.low}
                                    onChange={(e) => {
                                        const newEst = [...data.estimations];
                                        newEst[i] = { ...est, low: Number(e.target.value) };
                                        updateData({ estimations: newEst });
                                    }}
                                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                            </div>
                            <div className="flex-1">
                                <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>High</label>
                                <input
                                    type="number"
                                    value={est.high}
                                    onChange={(e) => {
                                        const newEst = [...data.estimations];
                                        newEst[i] = { ...est, high: Number(e.target.value) };
                                        updateData({ estimations: newEst });
                                    }}
                                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                            </div>
                            <div className="w-20">
                                <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Unit</label>
                                <input
                                    type="text"
                                    placeholder="hrs"
                                    value={est.unit}
                                    onChange={(e) => {
                                        const newEst = [...data.estimations];
                                        newEst[i] = { ...est, unit: e.target.value };
                                        updateData({ estimations: newEst });
                                    }}
                                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => updateData({ estimations: [...(data.estimations || []), { id: createId(), label: 'New Estimation', low: 0, high: 0, unit: 'hrs' }] })}
                    className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                    <Plus size={14} /> Add Estimation
                </button>
            </div>
        </div>
    );
};
