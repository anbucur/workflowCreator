import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { Trash2, Cable } from 'lucide-react';
import type { ConnectorType } from '../../types';

const CONNECTOR_TYPES: { value: ConnectorType; label: string }[] = [
    { value: 'curved', label: 'Curved' },
    { value: 'straight', label: 'Straight' },
    { value: 'step', label: 'Stepped' },
    { value: 'loop', label: 'Loop' },
];

export const ConnectorEditor: React.FC = () => {
    const selectedElement = useUiStore((s) => s.selectedElement);
    const setSelectedElement = useUiStore((s) => s.setSelectedElement);
    const connectors = useInfographicStore((s) => s.connectors || []);
    const updateConnector = useInfographicStore((s) => s.updateConnector);
    const removeConnector = useInfographicStore((s) => s.removeConnector);

    if (selectedElement?.type !== 'connector') return null;
    const connector = connectors.find((c) => c.id === selectedElement.connectorId);
    if (!connector) return null;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Cable size={18} className="text-indigo-500" />
                <h2 className="font-bold text-sm text-slate-800 tracking-tight">Connector</h2>
            </div>

            {/* Type selector */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                    {CONNECTOR_TYPES.map((ct) => (
                        <button
                            key={ct.value}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${connector.type === ct.value
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            onClick={() => updateConnector(connector.id, { type: ct.value })}
                        >
                            {ct.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                    {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map((c) => (
                        <button
                            key={c}
                            className={`w-7 h-7 rounded-lg border-2 transition-all ${connector.color === c ? 'border-slate-800 scale-110' : 'border-transparent hover:border-slate-300'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => updateConnector(connector.id, { color: c })}
                            title={c}
                        />
                    ))}
                </div>
            </div>

            {/* Line Style */}
            <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-medium text-slate-700">Line Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {['solid', 'dashed', 'dotted'].map((style) => (
                        <button
                            key={style}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold capitalize transition-all ${connector.lineStyle === style ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            onClick={() => updateConnector(connector.id, { lineStyle: style as any })}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thickness */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">Thickness</label>
                <input
                    type="range" min="1" max="6" step="1" title="Thickness"
                    className="w-full accent-indigo-500"
                    value={connector.strokeWidth || 2}
                    onChange={(e) => updateConnector(connector.id, { strokeWidth: parseInt(e.target.value) })}
                />
            </div>

            {/* Heads */}
            <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-medium text-slate-700">Start Head</label>
                    <select
                        title="Start Head"
                        className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={connector.sourceHead || 'none'}
                        onChange={(e) => updateConnector(connector.id, { sourceHead: e.target.value as any })}
                    >
                        <option value="none">None</option>
                        <option value="arrow">Arrow</option>
                        <option value="diamond">Diamond</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-medium text-slate-700">End Head</label>
                    <select
                        title="End Head"
                        className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={connector.targetHead || 'arrow'}
                        onChange={(e) => updateConnector(connector.id, { targetHead: e.target.value as any })}
                    >
                        <option value="none">None</option>
                        <option value="arrow">Arrow</option>
                        <option value="diamond">Diamond</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                    </select>
                </div>
            </div>

            {/* Label */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">Label (optional)</label>
                <input
                    type="text"
                    title="Connector Label"
                    className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                    value={connector.label || ''}
                    placeholder="e.g. on failure, loop back"
                    onChange={(e) => updateConnector(connector.id, { label: e.target.value || undefined })}
                />
            </div>

            {/* Delete */}
            <button
                className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg py-2 transition-colors mt-2"
                onClick={() => {
                    removeConnector(connector.id);
                    setSelectedElement(null);
                }}
            >
                <Trash2 size={14} />
                Delete Connector
            </button>
        </div>
    );
};
