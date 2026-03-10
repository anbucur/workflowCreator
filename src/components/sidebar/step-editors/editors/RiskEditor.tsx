import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Dropdown } from '../../../shared/Dropdown';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface RiskItem {
    id: string;
    text: string;
    mitigation: string;
}

interface RiskData {
    severity: 'low' | 'medium' | 'high' | 'critical';
    risks: RiskItem[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<RiskData>) => void;
}

export const RiskEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as RiskData;

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
                    onChange={(val) => updateData({ severity: val as RiskData['severity'] })}
                    placeholder="Select Severity..."
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Risk Items</label>
                {(data.risks || []).map((risk: RiskItem, i: number) => (
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
                                aria-label="Remove risk"
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
};
