import React from 'react';
import { Plus } from 'lucide-react';
import { AutoResizeTextarea } from '../../../shared/AutoResizeTextarea';
import { useThemeStore } from '../../../../store/useThemeStore';
import { createId } from '../../../../types/defaults';
import type { Step } from '../../../../types';

interface MetricItem {
    id: string;
    label: string;
    value: string;
    unit: string;
    trend?: 'up' | 'down' | 'neutral';
}

interface MetricsData {
    metrics: MetricItem[];
}

interface Props {
    step: Step;
    phaseId: string;
    updateData: (newData: Partial<MetricsData>) => void;
}

export const MetricsEditor: React.FC<Props> = ({ step, updateData }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const data = (step as any).data as MetricsData;

    return (
        <div className="flex flex-col gap-4">
            <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Metrics</label>
            {(data.metrics || []).map((metric: MetricItem, i: number) => (
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
                        placeholder="Label (e.g., Revenue)"
                        value={metric.label}
                        onChange={(e) => {
                            const newMetrics = [...data.metrics];
                            newMetrics[i] = { ...metric, label: e.target.value };
                            updateData({ metrics: newMetrics });
                        }}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Value"
                            value={metric.value}
                            onChange={(e) => {
                                const newMetrics = [...data.metrics];
                                newMetrics[i] = { ...metric, value: e.target.value };
                                updateData({ metrics: newMetrics });
                            }}
                            className={`flex-1 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                        <input
                            type="text"
                            placeholder="Unit"
                            value={metric.unit}
                            onChange={(e) => {
                                const newMetrics = [...data.metrics];
                                newMetrics[i] = { ...metric, unit: e.target.value };
                                updateData({ metrics: newMetrics });
                            }}
                            className={`w-20 px-2 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <label className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Trend:</label>
                        {(['up', 'down', 'neutral'] as const).map((trend) => (
                            <button
                                key={trend}
                                onClick={() => {
                                    const newMetrics = [...data.metrics];
                                    newMetrics[i] = { ...metric, trend };
                                    updateData({ metrics: newMetrics });
                                }}
                                className={`px-2 py-0.5 text-xs rounded ${
                                    metric.trend === trend
                                        ? trend === 'up' ? 'bg-green-100 text-green-700' : trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                        : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {trend === 'up' ? '↑ Up' : trend === 'down' ? '↓ Down' : '→ Neutral'}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <button
                onClick={() => updateData({ metrics: [...(data.metrics || []), { id: createId(), label: 'New Metric', value: '', unit: '', trend: 'neutral' }] })}
                className={`flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded transition-colors duration-300 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                <Plus size={14} /> Add Metric
            </button>
        </div>
    );
};
