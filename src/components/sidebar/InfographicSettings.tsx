import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { ColorPicker } from '../shared/ColorPicker';
import { RoleManager } from './RoleManager';
import { Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { FontSelector } from './shared/FontSelector';
import { PREDEFINED_THEMES } from '../../utils/themes';

export const InfographicSettings: React.FC = () => {
    const { titleBar, backgroundColor } = useInfographicStore();
    const updateTitleBar = useInfographicStore((s) => s.updateTitleBar);
    const setBackgroundColor = useInfographicStore((s) => s.setBackgroundColor);
    const layout = useInfographicStore((s) => s.layout);
    const updateLayout = useInfographicStore((s) => s.updateLayout);
    const applyTheme = useInfographicStore((s) => s.applyTheme);
    const phases = useInfographicStore((s) => s.phases);

    // Simple heuristic to check if a theme is active: check if first phase matches theme's first color
    const activeThemeId = PREDEFINED_THEMES.find(t => phases[0]?.backgroundColor === t.colors[0])?.id;

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-slate-800">Global Settings</h2>

            <div className="flex flex-col gap-4">
                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1">Title Bar</h3>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Main Title</label>
                    <input
                        type="text"
                        value={titleBar.text}
                        onChange={(e) => updateTitleBar({ text: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Title Font"
                        value={titleBar.titleFontFamily}
                        onChange={(val) => updateTitleBar({ titleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Title Size (px)</label>
                        <input
                            type="number"
                            min={10}
                            max={100}
                            value={titleBar.fontSize || 24}
                            onChange={(e) => updateTitleBar({ fontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-medium text-slate-700">Subtitle</label>
                    <input
                        type="text"
                        value={titleBar.subtitle || ''}
                        onChange={(e) => updateTitleBar({ subtitle: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Subtitle Font"
                        value={titleBar.subtitleFontFamily}
                        onChange={(val) => updateTitleBar({ subtitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Subtitle Size (px)</label>
                        <input
                            type="number"
                            min={8}
                            max={60}
                            value={titleBar.subtitleFontSize || 14}
                            onChange={(e) => updateTitleBar({ subtitleFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-medium text-slate-700">Text Alignment</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                                key={align}
                                onClick={() => updateTitleBar({ alignment: align })}
                                className={`flex-1 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${(titleBar.alignment || 'center') === align
                                    ? 'bg-white shadow-sm text-slate-800'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {align}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Original logo section follows... --- */}
                <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-medium text-slate-700">Project Logo</label>
                    {titleBar.logoUrl ? (
                        <div className="flex items-center gap-2 p-2 w-full bg-slate-50 border border-slate-200 rounded-md">
                            <img src={titleBar.logoUrl} alt="Logo" className="max-h-12 max-w-24 object-contain rounded" />
                            <button
                                onClick={() => updateTitleBar({ logoUrl: '' })}
                                className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center p-4 h-24 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors">
                            <ImageIcon size={20} className="text-slate-400 mb-2" />
                            <span className="text-xs font-medium text-slate-600">Upload Logo</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG, SVG</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        updateTitleBar({ logoUrl: event.target?.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                        </label>
                    )}
                </div>

                <ColorPicker
                    label="Title Background"
                    color={titleBar.backgroundColor}
                    onChange={(color) => updateTitleBar({ backgroundColor: color })}
                />

                <ColorPicker
                    label="Title Text Color"
                    color={titleBar.textColor}
                    onChange={(color) => updateTitleBar({ textColor: color })}
                />

                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1 mt-4">Predefined Themes</h3>
                <div className="grid grid-cols-1 gap-2">
                    {PREDEFINED_THEMES.map((theme) => {
                        const isActive = activeThemeId === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => applyTheme(theme.id)}
                                className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${isActive
                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-semibold text-slate-700">{theme.name}</span>
                                    {isActive && <CheckCircle2 size={14} className="text-blue-600" />}
                                </div>
                                <div className="flex rounded-md overflow-hidden h-4 w-full border border-slate-200">
                                    {theme.colors.map((c, i) => (
                                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1 mt-4">Canvas</h3>

                <ColorPicker
                    label="Canvas Background"
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                />

                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1 mt-4">Phase Typography & Tinting</h3>

                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Phase Title Font"
                        value={layout.phaseTitleFontFamily}
                        onChange={(val) => updateLayout({ phaseTitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Size (px)</label>
                        <input
                            type="number"
                            min={8}
                            max={60}
                            value={layout.phaseTitleFontSize || 11}
                            onChange={(e) => updateLayout({ phaseTitleFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    <FontSelector
                        label="Phase Subtitle Font"
                        value={layout.phaseSubtitleFontFamily}
                        onChange={(val) => updateLayout({ phaseSubtitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Size (px)</label>
                        <input
                            type="number"
                            min={8}
                            max={60}
                            value={layout.phaseSubtitleFontSize || 10}
                            onChange={(e) => updateLayout({ phaseSubtitleFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <h3 className="font-medium text-sm text-slate-800 border-b border-slate-200 pb-1 mt-4">Card Typography</h3>

                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Card Title Font"
                        value={layout.cardTitleFontFamily}
                        onChange={(val) => updateLayout({ cardTitleFontFamily: val })}
                    />
                    <FontSelector
                        label="Card Body Font"
                        value={layout.cardContentFontFamily}
                        onChange={(val) => updateLayout({ cardContentFontFamily: val })}
                    />
                </div>

                {/* Phase area tint slider */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-700">Phase Area Tint</label>
                        <span className="text-xs font-bold text-primary tabular-nums">{layout.phaseTintOpacity}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={layout.phaseTintOpacity}
                        onChange={(e) => updateLayout({ phaseTintOpacity: Number(e.target.value) })}
                        className="w-full accent-primary"
                        title="Phase area tint intensity"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                        Controls how strongly the phase colour tints the card area background. 100 = solid phase colour.
                    </p>
                </div>

                {/* Card tint slider */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-700">Card Tint</label>
                        <span className="text-xs font-bold text-primary tabular-nums">{layout.cardTintOpacity}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={layout.cardTintOpacity}
                        onChange={(e) => updateLayout({ cardTintOpacity: Number(e.target.value) })}
                        className="w-full accent-primary"
                        title="Card tint intensity"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                        Controls how much of the phase colour bleeds into each card. 100 = card matches phase colour exactly.
                    </p>
                </div>

                {/* Transition sharpness slider */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-700">Colour Blend Sharpness</label>
                        <span className="text-xs font-bold text-primary tabular-nums">{layout.phaseTransitionSharpness}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={layout.phaseTransitionSharpness}
                        onChange={(e) => updateLayout({ phaseTransitionSharpness: Number(e.target.value) })}
                        className="w-full accent-primary"
                        title="Colour blend sharpness"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                        0 = smooth full-width blend · 100 = instant cut at the midpoint.
                    </p>
                </div>

                <RoleManager />
            </div>
        </div>
    );
};
