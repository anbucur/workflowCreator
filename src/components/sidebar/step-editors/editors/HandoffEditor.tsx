import React from 'react';
import { useThemeStore } from '../../../../store/useThemeStore';
import { useInfographicStore } from '../../../../store/useInfographicStore';
import type { Step } from '../../../../types';

interface HandoffData {
    fromRoleId: string;
    toRoleId: string;
    deliverables: string;
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<HandoffData>) => void;
}

export const HandoffEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const roles = useInfographicStore((s) => s.roles);
    const data = (step as any).data as HandoffData;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>From Role</label>
                <select
                    value={data.fromRoleId || ''}
                    onChange={(e) => updateData({ fromRoleId: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                    <option value="">Select role...</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>To Role</label>
                <select
                    value={data.toRoleId || ''}
                    onChange={(e) => updateData({ toRoleId: e.target.value })}
                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                    <option value="">Select role...</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Deliverables</label>
                <textarea
                    value={data.deliverables || ''}
                    onChange={(e) => updateData({ deliverables: e.target.value })}
                    rows={3}
                    className={`w-full px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="What is being handed off..."
                />
            </div>
        </div>
    );
};
