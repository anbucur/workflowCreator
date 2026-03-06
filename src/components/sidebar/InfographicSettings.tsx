import React, { useState, useEffect } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { ColorPicker } from '../shared/ColorPicker';
import { RoleManager } from './RoleManager';
import { Image as ImageIcon, Trash2, CheckCircle2, ChevronDown } from 'lucide-react';
import { FontSelector } from './shared/FontSelector';
import { PREDEFINED_THEMES } from '../../utils/themes';

/* ------------------------------------------------------------------ */
/*  Small reusable Accordion wrapper                                   */
/* ------------------------------------------------------------------ */
interface AccordionSectionProps {
    id: string;
    title: string;
    openSection: string | null;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ id, title, openSection, onToggle, children }) => {
    const isOpen = openSection === id;
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => onToggle(id)}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{title}</span>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className="transition-all duration-200 ease-in-out overflow-hidden"
                style={{ maxHeight: isOpen ? '2000px' : '0px', opacity: isOpen ? 1 : 0 }}
            >
                <div className="flex flex-col gap-3 p-3 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const InfographicSettings: React.FC = () => {
    const { titleBar, backgroundColor } = useInfographicStore();
    const updateTitleBar = useInfographicStore((s) => s.updateTitleBar);
    const setBackgroundColor = useInfographicStore((s) => s.setBackgroundColor);
    const layout = useInfographicStore((s) => s.layout);
    const updateLayout = useInfographicStore((s) => s.updateLayout);
    const applyTheme = useInfographicStore((s) => s.applyTheme);
    const phases = useInfographicStore((s) => s.phases);

    const selectedElement = useUiStore((s) => s.selectedElement);

    const [openSection, setOpenSection] = useState<string | null>('theme');

    useEffect(() => {
        if (selectedElement?.type === 'titleBar') {
            setOpenSection('titlebar');
        }
    }, [selectedElement]);

    const toggle = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

    // Simple heuristic to check if a theme is active
    const activeThemeId = PREDEFINED_THEMES.find(t => phases[0]?.backgroundColor === t.colors[0])?.id;
    const isCustom = !activeThemeId;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Global Settings</h2>

            {/* ============================================================ */}
            {/*  TITLE BAR                                                     */}
            {/* ============================================================ */}
            <AccordionSection id="titlebar" title="Title Bar" openSection={openSection} onToggle={toggle}>
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

                <div className="flex flex-col gap-1.5">
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

                <div className="flex flex-col gap-1.5">
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

                {/* Logo */}
                <div className="flex flex-col gap-1.5">
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
                            <span className="text-[10px] text-slate-400">PNG, JPG</span>
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
                                    if (file.size > MAX_LOGO_SIZE) {
                                        alert('Logo file must be under 2MB.');
                                        return;
                                    }
                                    const allowedTypes = ['image/png', 'image/jpeg'];
                                    if (!allowedTypes.includes(file.type)) {
                                        alert('Only PNG and JPG files are allowed.');
                                        return;
                                    }
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
            </AccordionSection>

            {/* ============================================================ */}
            {/*  THEME                                                         */}
            {/* ============================================================ */}
            <AccordionSection id="theme" title="Theme" openSection={openSection} onToggle={toggle}>
                <div className="grid grid-cols-1 gap-2">
                    {/* Custom (default) option */}
                    <button
                        onClick={() => { /* no-op: already custom */ }}
                        className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${isCustom
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-semibold text-slate-700">Custom</span>
                            {isCustom && <CheckCircle2 size={14} className="text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400">Freestyle — use per-phase colours and your own palette.</p>
                    </button>

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
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span style={{ fontFamily: theme.fonts.headingFont }} className="font-semibold">Aa</span>
                                    <span>{theme.fonts.headingFont.replace(/'/g, '').split(',')[0]}</span>
                                    <span>+</span>
                                    <span>{theme.fonts.bodyFont.replace(/'/g, '').split(',')[0]}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  CARD STYLING                                                  */}
            {/* ============================================================ */}
            <AccordionSection id="card-style" title="Card Styling" openSection={openSection} onToggle={toggle}>
                {/* Shadow */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Card Shadow</label>
                    <div className="grid grid-cols-5 gap-1">
                        {(['none', 'soft', 'medium', 'hard', 'neon'] as const).map((s) => (
                            <button
                                key={s}
                                title={s}
                                onClick={() => updateLayout({ cardShadow: s })}
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.cardShadow || 'soft') === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border Style */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Card Border Style</label>
                    <div className="grid grid-cols-4 gap-1">
                        {(['none', 'solid', 'dashed', 'dotted'] as const).map((s) => (
                            <button
                                key={s}
                                title={s}
                                onClick={() => updateLayout({ cardBorderStyle: s })}
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.cardBorderStyle || 'solid') === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border Width */}
                {layout.cardBorderStyle !== 'none' && (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-slate-700">Border Width</label>
                            <span className="text-xs font-bold text-primary tabular-nums">{layout.cardBorderWidth ?? 1}px</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={layout.cardBorderWidth ?? 1}
                            onChange={(e) => updateLayout({ cardBorderWidth: Number(e.target.value) })}
                            className="w-full accent-primary"
                            title="Card border width"
                        />
                    </div>
                )}

                {/* Show Icons toggle */}
                <div className="flex items-center justify-between py-1">
                    <div>
                        <label className="text-xs font-medium text-slate-700">Show Step Icons</label>
                        <p className="text-[10px] text-slate-400">Display icon in top-right corner of each card</p>
                    </div>
                    <button
                        onClick={() => updateLayout({ showStepIcons: !(layout.showStepIcons ?? true) })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${(layout.showStepIcons ?? true) ? 'bg-blue-600' : 'bg-slate-200'}`}
                        title="Toggle step icons"
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${(layout.showStepIcons ?? true) ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Step Labels configurations */}
                <hr className="border-slate-100 my-2" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Step Type Labels</h3>

                <ColorPicker
                    label="Label Background"
                    color={layout.stepLabelColor ?? '#3c83f6'}
                    onChange={(color) => updateLayout({ stepLabelColor: color })}
                />

                <ColorPicker
                    label="Label Text Color"
                    color={layout.stepLabelTextColor ?? '#ffffff'}
                    onChange={(color) => updateLayout({ stepLabelTextColor: color })}
                />

                <div className="grid grid-cols-2 gap-3 mt-1">
                    <FontSelector
                        label="Label Font"
                        value={layout.stepLabelFontFamily}
                        onChange={(val) => updateLayout({ stepLabelFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Size (px)</label>
                        <input
                            type="number"
                            min={6}
                            max={20}
                            value={layout.stepLabelFontSize ?? 9}
                            onChange={(e) => updateLayout({ stepLabelFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={layout.stepLabelMatchPhase ?? false}
                            onChange={(e) => updateLayout({ stepLabelMatchPhase: e.target.checked })}
                            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-600">Match Phase colour (darkened)</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Uses a slightly darker version of the phase colour as the label background.</p>
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  PHASE & CANVAS                                                */}
            {/* ============================================================ */}
            <AccordionSection id="phase-canvas" title="Phase & Canvas" openSection={openSection} onToggle={toggle}>
                <ColorPicker
                    label="Canvas Background"
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                />

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

                <div className="grid grid-cols-2 gap-3">
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

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Phase Background Pattern</label>
                    <div className="grid grid-cols-4 gap-1">
                        {([
                            { value: 'none', label: 'None' },
                            { value: 'dots', label: 'Dots' },
                            { value: 'grid', label: 'Grid' },
                            { value: 'diagonal', label: 'Lines' },
                        ] as const).map(({ value, label }) => (
                            <button
                                key={value}
                                title={label}
                                onClick={() => updateLayout({ phaseBackgroundPattern: value })}
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.phaseBackgroundPattern || 'none') === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Adds a subtle texture to the phase card area background.</p>
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
            </AccordionSection>

            {/* ============================================================ */}
            {/*  CARD TYPOGRAPHY                                               */}
            {/* ============================================================ */}
            <AccordionSection id="card-typo" title="Card Typography" openSection={openSection} onToggle={toggle}>
                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Card Title Font"
                        value={layout.cardTitleFontFamily}
                        onChange={(val) => updateLayout({ cardTitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Title Size (px)</label>
                        <input
                            type="number"
                            min={8}
                            max={40}
                            value={layout.cardTitleFontSize ?? 12}
                            onChange={(e) => updateLayout({ cardTitleFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FontSelector
                        label="Card Body Font"
                        value={layout.cardContentFontFamily}
                        onChange={(val) => updateLayout({ cardContentFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Body Size (px)</label>
                        <input
                            type="number"
                            min={7}
                            max={30}
                            value={layout.cardContentFontSize ?? 11}
                            onChange={(e) => updateLayout({ cardContentFontSize: Number(e.target.value) })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Sub-content font size */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-xs font-medium text-slate-700">Sub-content Size (px)</label>
                        <p className="text-[10px] text-slate-400">Agenda items, track labels, action text</p>
                    </div>
                    <input
                        type="number"
                        min={7}
                        max={20}
                        value={layout.cardSubtextFontSize ?? 9}
                        onChange={(e) => updateLayout({ cardSubtextFontSize: Number(e.target.value) })}
                        className="w-16 px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-center"
                        title="Sub-content font size"
                    />
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  ROLES                                                         */}
            {/* ============================================================ */}
            <AccordionSection id="roles" title="Roles" openSection={openSection} onToggle={toggle}>
                <RoleManager />
            </AccordionSection>
        </div>
    );
};
