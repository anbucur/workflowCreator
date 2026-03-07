import React, { useState, useEffect } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { ColorPicker } from '../shared/ColorPicker';
import { RoleManager } from './RoleManager';
import { Image as ImageIcon, Trash2, CheckCircle2, ChevronDown } from 'lucide-react';
import { FontSelector } from './shared/FontSelector';
import { PREDEFINED_THEMES, THEMES_BY_CATEGORY } from '../../utils/themes';

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
    const [overflowStatus, setOverflowStatus] = useState<'hidden' | 'visible'>('hidden');
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setOverflowStatus('visible'), 210);
            return () => clearTimeout(t);
        } else {
            setOverflowStatus('hidden');
        }
    }, [isOpen]);

    return (
        <div className={`border rounded-lg transition-colors duration-300 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${isOpen ? '' : 'overflow-hidden'}`}>
            <button
                onClick={() => onToggle(id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 transition-colors text-left ${isOpen ? 'rounded-t-lg' : ''} ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
                <span className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{title}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                />
            </button>
            <div
                className="transition-all duration-200 ease-in-out"
                style={{
                    maxHeight: isOpen ? '2000px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    overflow: overflowStatus
                }}
            >
                <div className="flex flex-col gap-3 p-3 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Sub-section divider                                                */
/* ------------------------------------------------------------------ */
const SubSection: React.FC<{ title: string }> = ({ title }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    return (
        <div className="pt-1">
            <hr className={`mb-3 transition-colors duration-300 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h3>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Theme Category Tabs                                                */
/* ------------------------------------------------------------------ */
interface ThemeCategoryTabsProps {
    activeCategory: 'business' | 'marketing' | 'educational' | 'legacy';
    onCategoryChange: (category: 'business' | 'marketing' | 'educational' | 'legacy') => void;
}

const ThemeCategoryTabs: React.FC<ThemeCategoryTabsProps> = ({ activeCategory, onCategoryChange }) => {
    const categories: { id: 'business' | 'marketing' | 'educational' | 'legacy'; label: string }[] = [
        { id: 'business', label: 'Business' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'educational', label: 'Education' },
        { id: 'legacy', label: 'Classic' },
    ];
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    return (
        <div className="flex flex-wrap gap-1 mb-2">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                        activeCategory === cat.id
                            ? 'bg-blue-500 text-white'
                            : isDarkMode
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};

// Helper component for dark mode labels
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    return (
        <label className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} ${className}`}>
            {children}
        </label>
    );
};

// Helper component for dark mode inputs
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    return (
        <input
            {...props}
            className={`px-3 py-2 text-sm border rounded focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            } ${props.className || ''}`}
        />
    );
};

// Helper component for helper text
const HelperText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    return (
        <p className={`text-[10px] transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {children}
        </p>
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
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const selectedElement = useUiStore((s) => s.selectedElement);

    const [openSection, setOpenSection] = useState<string | null>('theme');
    const [activeThemeCategory, setActiveThemeCategory] = useState<'business' | 'marketing' | 'educational' | 'legacy'>('business');

    useEffect(() => {
        if (selectedElement?.type === 'titleBar') {
            setOpenSection('titlebar');
        }
    }, [selectedElement]);

    const toggle = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

    const activeThemeId = PREDEFINED_THEMES.find(t => phases[0]?.backgroundColor === t.colors[0])?.id;
    const isCustom = !activeThemeId;

    return (
        <div className="flex flex-col gap-3">
            <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Global Settings</h2>

            {/* ============================================================ */}
            {/*  1. THEME - Compact Grid with Categories                       */}
            {/* ============================================================ */}
            <AccordionSection id="theme" title="Theme" openSection={openSection} onToggle={toggle}>
                {/* Custom Theme Button */}
                <button
                    onClick={() => { /* no-op: already custom */ }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all mb-3 ${isCustom
                        ? isDarkMode
                            ? 'border-blue-500 bg-blue-900/20 shadow-sm ring-1 ring-blue-500/20'
                            : 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                        : isDarkMode
                            ? 'border-slate-700 hover:border-blue-600 hover:bg-slate-800'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center ${isDarkMode ? 'from-slate-700 to-slate-600' : 'from-slate-200 to-slate-300'}`}>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>✎</span>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Custom</span>
                            <span className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Your own colors</span>
                        </div>
                    </div>
                    {isCustom && <CheckCircle2 size={14} className="text-blue-600" />}
                </button>

                {/* Category Tabs */}
                <ThemeCategoryTabs 
                    activeCategory={activeThemeCategory}
                    onCategoryChange={setActiveThemeCategory}
                />

                {/* Compact Theme Grid */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {(THEMES_BY_CATEGORY[activeThemeCategory] || PREDEFINED_THEMES).map((theme) => {
                        const isActive = activeThemeId === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => applyTheme(theme.id)}
                                className={`group flex flex-col gap-1 p-2 rounded-lg border text-left transition-all ${isActive
                                    ? isDarkMode
                                        ? 'border-blue-500 bg-blue-900/20 shadow-sm ring-1 ring-blue-500/20'
                                        : 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                                    : isDarkMode
                                        ? 'border-slate-700 hover:border-blue-600 hover:bg-slate-800'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className={`text-[10px] font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{theme.name}</span>
                                    {isActive && <CheckCircle2 size={12} className="text-blue-600 flex-shrink-0" />}
                                </div>
                                <div className={`flex rounded overflow-hidden h-3 w-full border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                    {theme.colors.slice(0, 5).map((c, i) => (
                                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  2. TITLE BAR                                                  */}
            {/* ============================================================ */}
            <AccordionSection id="titlebar" title="Title Bar" openSection={openSection} onToggle={toggle}>
                <div className="flex flex-col gap-1.5">
                    <Label>Main Title</Label>
                    <Input
                        type="text"
                        value={titleBar.text}
                        onChange={(e) => updateTitleBar({ text: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <FontSelector
                        label="Title Font"
                        value={titleBar.titleFontFamily}
                        onChange={(val) => updateTitleBar({ titleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            type="number"
                            min={10}
                            max={100}
                            value={titleBar.fontSize || 24}
                            onChange={(e) => updateTitleBar({ fontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={titleBar.textColor}
                        onChange={(color) => updateTitleBar({ textColor: color })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Subtitle</Label>
                    <Input
                        type="text"
                        value={titleBar.subtitle || ''}
                        onChange={(e) => updateTitleBar({ subtitle: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <FontSelector
                        label="Subtitle Font"
                        value={titleBar.subtitleFontFamily}
                        onChange={(val) => updateTitleBar({ subtitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            type="number"
                            min={8}
                            max={60}
                            value={titleBar.subtitleFontSize || 16}
                            onChange={(e) => updateTitleBar({ subtitleFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={titleBar.subtitleColor ?? titleBar.textColor}
                        onChange={(color) => updateTitleBar({ subtitleColor: color })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Text Alignment</Label>
                    <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                                key={align}
                                onClick={() => updateTitleBar({ alignment: align })}
                                className={`flex-1 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${(titleBar.alignment || 'center') === align
                                    ? isDarkMode
                                        ? 'bg-slate-700 shadow-sm text-slate-200'
                                        : 'bg-white shadow-sm text-slate-800'
                                    : isDarkMode
                                        ? 'text-slate-400 hover:text-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {align}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Project Logo</Label>
                    {titleBar.logoUrl ? (
                        <div className={`flex items-center gap-2 p-2 w-full border rounded-md ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <img src={titleBar.logoUrl} alt="Logo" className="max-h-12 max-w-24 object-contain rounded" />
                            <button
                                onClick={() => updateTitleBar({ logoUrl: '' })}
                                className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className={`flex flex-col items-center justify-center p-4 h-24 w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-600 hover:bg-slate-800 hover:border-slate-500' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400'}`}>
                            <ImageIcon size={20} className={`mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Upload Logo</span>
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG</span>
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const MAX_LOGO_SIZE = 2 * 1024 * 1024;
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
            </AccordionSection>

            {/* ============================================================ */}
            {/*  3. CANVAS & LAYOUT                                            */}
            {/* ============================================================ */}
            <AccordionSection id="canvas-layout" title="Canvas & Layout" openSection={openSection} onToggle={toggle}>
                <ColorPicker
                    label="Canvas Background"
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                />

                {/* Layout direction */}
                <div className="flex flex-col gap-1.5">
                    <Label>Layout Direction</Label>
                    <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        {(['horizontal', 'vertical'] as const).map((dir) => (
                            <button
                                key={dir}
                                onClick={() => updateLayout({ direction: dir })}
                                className={`flex-1 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${(layout.direction || 'horizontal') === dir
                                    ? isDarkMode
                                        ? 'bg-slate-700 shadow-sm text-slate-200'
                                        : 'bg-white shadow-sm text-slate-800'
                                    : isDarkMode
                                        ? 'text-slate-400 hover:text-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {dir}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Corner radius */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <Label>Corner Radius</Label>
                        <span className="text-xs font-bold text-primary tabular-nums">{layout.cornerRadius ?? 12}px</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={32}
                        value={layout.cornerRadius ?? 12}
                        onChange={(e) => updateLayout({ cornerRadius: Number(e.target.value) })}
                        className="w-full accent-primary"
                        title="Corner radius for cards and phase headers"
                    />
                    <HelperText>Rounded corners applied to cards and phase headers.</HelperText>
                </div>

                <SubSection title="Spacing" />

                {/* Phase gap */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Phase Gap</Label>
                        <HelperText>Space between phases</HelperText>
                    </div>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min={0}
                            max={80}
                            value={layout.phaseGap ?? 12}
                            onChange={(e) => updateLayout({ phaseGap: Number(e.target.value) })}
                            className="w-16 text-center"
                            title="Gap between phases"
                        />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>px</span>
                    </div>
                </div>

                {/* Step gap */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Step Gap</Label>
                        <HelperText>Space between cards within a phase</HelperText>
                    </div>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min={0}
                            max={60}
                            value={layout.stepGap ?? 10}
                            onChange={(e) => updateLayout({ stepGap: Number(e.target.value) })}
                            className="w-16 text-center"
                            title="Gap between steps"
                        />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>px</span>
                    </div>
                </div>

                {/* Padding */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Canvas Padding</Label>
                        <HelperText>Inner padding around the entire canvas</HelperText>
                    </div>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={layout.padding ?? 20}
                            onChange={(e) => updateLayout({ padding: Number(e.target.value) })}
                            className="w-16 text-center"
                            title="Canvas padding"
                        />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>px</span>
                    </div>
                </div>

                {/* Phase min width */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Min Phase Width</Label>
                        <HelperText>Minimum width of each phase column</HelperText>
                    </div>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min={120}
                            max={600}
                            step={10}
                            value={layout.phaseMinWidth ?? 280}
                            onChange={(e) => updateLayout({ phaseMinWidth: Number(e.target.value) })}
                            className="w-16 text-center"
                            title="Minimum phase column width"
                        />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>px</span>
                    </div>
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  4. PHASES                                                      */}
            {/* ============================================================ */}
            <AccordionSection id="phases" title="Phases" openSection={openSection} onToggle={toggle}>
                {/* Phase typography */}
                <div className="grid grid-cols-3 gap-3">
                    <FontSelector
                        label="Phase Title Font"
                        value={layout.phaseTitleFontFamily}
                        onChange={(val) => updateLayout({ phaseTitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Phase Title Size"
                            type="number"
                            min={8} max={48}
                            value={layout.phaseTitleFontSize || 15}
                            onChange={(e) => updateLayout({ phaseTitleFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.phaseTitleColor ?? layout.cardTextColor ?? '#1e293b'}
                        onChange={(c) => updateLayout({ phaseTitleColor: c })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                    <FontSelector
                        label="Phase Subtitle Font"
                        value={layout.phaseSubtitleFontFamily}
                        onChange={(val) => updateLayout({ phaseSubtitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Phase Subtitle Size"
                            type="number"
                            min={8} max={36}
                            value={layout.phaseSubtitleFontSize || 15}
                            onChange={(e) => updateLayout({ phaseSubtitleFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.phaseSubtitleColor ?? layout.cardTextColor ?? '#64748b'}
                        onChange={(c) => updateLayout({ phaseSubtitleColor: c })}
                    />
                </div>

                {/* Global Phase Text Color Override */}
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={layout.useGlobalPhaseTextColor ?? false}
                            onChange={(e) => updateLayout({ useGlobalPhaseTextColor: e.target.checked })}
                            className={`rounded text-blue-500 focus:ring-blue-500 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                        />
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Use global phase text color</span>
                    </label>
                    <HelperText>Override all phase title/subtitle colors with a single color</HelperText>

                    {layout.useGlobalPhaseTextColor && (
                        <div className="mt-2">
                            <ColorPicker
                                label="Global Phase Text Color"
                                color={layout.globalPhaseTextColor ?? '#000000'}
                                onChange={(c) => updateLayout({ globalPhaseTextColor: c })}
                            />
                        </div>
                    )}
                </div>

                <SubSection title="Background" />

                {/* Phase background pattern */}
                <div className="flex flex-col gap-1.5">
                    <Label>Background Pattern</Label>
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
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.phaseBackgroundPattern || 'none') === value ? 'bg-blue-600 text-white border-blue-600' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <HelperText>Adds a subtle texture to the phase card area background.</HelperText>
                </div>

                {/* Phase area tint */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <Label>Phase Area Tint</Label>
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
                    <HelperText>Controls how strongly the phase colour tints the card area background. 100 = solid phase colour.</HelperText>
                </div>

                {/* Colour blend sharpness */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <Label>Colour Blend Sharpness</Label>
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
                    <HelperText>0 = smooth full-width blend · 100 = instant cut at the midpoint.</HelperText>
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  5. CARDS                                                       */}
            {/* ============================================================ */}
            <AccordionSection id="cards" title="Cards" openSection={openSection} onToggle={toggle}>

                {/* --- Appearance --- */}
                <SubSection title="Appearance" />

                {/* Shadow */}
                <div className="flex flex-col gap-1.5">
                    <Label>Card Shadow</Label>
                    <div className="grid grid-cols-5 gap-1">
                        {(['none', 'soft', 'medium', 'hard', 'neon'] as const).map((s) => (
                            <button
                                key={s}
                                title={s}
                                onClick={() => updateLayout({ cardShadow: s })}
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.cardShadow || 'soft') === s ? 'bg-blue-600 text-white border-blue-600' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border style */}
                <div className="flex flex-col gap-1.5">
                    <Label>Card Border Style</Label>
                    <div className="grid grid-cols-4 gap-1">
                        {(['none', 'solid', 'dashed', 'dotted'] as const).map((s) => (
                            <button
                                key={s}
                                title={s}
                                onClick={() => updateLayout({ cardBorderStyle: s })}
                                className={`py-1.5 text-[9px] font-bold capitalize rounded-md border transition-all ${(layout.cardBorderStyle || 'solid') === s ? 'bg-blue-600 text-white border-blue-600' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border width */}
                {layout.cardBorderStyle !== 'none' && (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <Label>Border Width</Label>
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

                {/* Card tint (moved from Phase & Canvas) */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <Label>Card Tint</Label>
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
                    <HelperText>Controls how much of the phase colour bleeds into each card. 100 = card matches phase colour exactly.</HelperText>
                </div>

                {/* Show step icons */}
                <div className="flex items-center justify-between py-1">
                    <div>
                        <Label>Show Step Icons</Label>
                        <HelperText>Display icon in top-right corner of each card</HelperText>
                    </div>
                    <button
                        onClick={() => updateLayout({ showStepIcons: !(layout.showStepIcons ?? true) })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${(layout.showStepIcons ?? true) ? 'bg-blue-600' : isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}
                        title="Toggle step icons"
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${(layout.showStepIcons ?? true) ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* --- Typography --- */}
                <SubSection title="Typography" />

                <div className="flex flex-col gap-1.5">
                    <Label>Text Color Mode</Label>
                    <div className="grid grid-cols-3 gap-1">
                        {([
                            { value: 'default', label: 'Auto' },
                            { value: 'high-contrast', label: 'Contrast' },
                            { value: 'custom', label: 'Custom' },
                        ] as const).map(({ value, label }) => (
                            <button
                                key={value}
                                title={label}
                                onClick={() => updateLayout({ cardTextColorMode: value })}
                                className={`py-1.5 text-[10px] font-bold capitalize rounded-md border transition-all ${(layout.cardTextColorMode || 'default') === value ? 'bg-blue-600 text-white border-blue-600' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {layout.cardTextColorMode === 'custom' && (
                    <div className="mt-1">
                        <ColorPicker
                            label="Custom Text Color"
                            color={layout.cardTextColor ?? '#1a1a2e'}
                            onChange={(color) => updateLayout({ cardTextColor: color })}
                        />
                    </div>
                )}

                <div className={`mt-2 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Card Text Color Mode manages the overall tint, but specific colors override it.</div>

                <div className="grid grid-cols-3 gap-3 mt-2 items-end">
                    <FontSelector
                        label="Card Title Font"
                        value={layout.cardTitleFontFamily}
                        onChange={(val) => updateLayout({ cardTitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Card Title Size"
                            type="number"
                            min={8} max={36}
                            value={layout.cardTitleFontSize ?? 16}
                            onChange={(e) => updateLayout({ cardTitleFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.cardTitleColor ?? layout.cardTextColor ?? '#1e293b'}
                        onChange={(c) => updateLayout({ cardTitleColor: c })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2 items-end">
                    <FontSelector
                        label="Card Body Font"
                        value={layout.cardContentFontFamily}
                        onChange={(val) => updateLayout({ cardContentFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Card Content Size"
                            type="number"
                            min={8} max={24}
                            value={layout.cardContentFontSize ?? 16}
                            onChange={(e) => updateLayout({ cardContentFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.cardContentColor ?? layout.cardTextColor ?? '#334155'}
                        onChange={(c) => updateLayout({ cardContentColor: c })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2 items-end">
                    <FontSelector
                        label="Sub-content Font"
                        value={layout.cardSubtextFontFamily}
                        onChange={(val) => updateLayout({ cardSubtextFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Card Subtext Size"
                            type="number"
                            min={8} max={20}
                            value={layout.cardSubtextFontSize ?? 15}
                            onChange={(e) => updateLayout({ cardSubtextFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.cardSubtextColor ?? layout.cardTextColor ?? '#64748b'}
                        onChange={(c) => updateLayout({ cardSubtextColor: c })}
                    />
                </div>
                <HelperText>Agenda items, track labels, action text</HelperText>

                {/* --- Subcontent Title Settings --- */}
                <SubSection title="Subcontent Title Settings" />

                <div className="grid grid-cols-3 gap-3 items-end">
                    <FontSelector
                        label="Title Font"
                        value={layout.subcontentTitleFontFamily}
                        onChange={(val) => updateLayout({ subcontentTitleFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Subcontent Title Size"
                            type="number"
                            min={6} max={16}
                            value={layout.subcontentTitleFontSize ?? 9}
                            onChange={(e) => updateLayout({ subcontentTitleFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.subcontentTitleColor ?? '#94a3b8'}
                        onChange={(c) => updateLayout({ subcontentTitleColor: c })}
                    />
                </div>
                <HelperText>Labels like "AGENDA", "Tracks", "Iterative Loop"</HelperText>

                {/* --- Step Type Labels --- */}
                <SubSection title="Step Type Labels" />

                <ColorPicker
                    label="Label Background"
                    color={layout.stepLabelColor ?? '#3c83f6'}
                    onChange={(color) => updateLayout({ stepLabelColor: color })}
                />

                <div className="grid grid-cols-3 gap-3 mt-2 items-end">
                    <FontSelector
                        label="Label Font"
                        value={layout.stepLabelFontFamily}
                        onChange={(val) => updateLayout({ stepLabelFontFamily: val })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Size (px)</Label>
                        <Input
                            title="Step Label Size"
                            type="number"
                            min={8} max={20}
                            value={layout.stepLabelFontSize ?? 10}
                            onChange={(e) => updateLayout({ stepLabelFontSize: Number(e.target.value) })}
                        />
                    </div>
                    <ColorPicker
                        label="Color"
                        color={layout.stepLabelTextColor ?? '#ffffff'}
                        onChange={(c) => updateLayout({ stepLabelTextColor: c })}
                    />
                </div>

                <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={layout.stepLabelMatchPhase ?? false}
                            onChange={(e) => updateLayout({ stepLabelMatchPhase: e.target.checked })}
                            className={`rounded text-blue-500 focus:ring-blue-500 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                        />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Match Phase colour (darkened)</span>
                    </label>
                    <HelperText>Uses a slightly darker version of the phase colour as the label background.</HelperText>
                </div>
            </AccordionSection>

            {/* ============================================================ */}
            {/*  6. ROLES                                                       */}
            {/* ============================================================ */}
            <AccordionSection id="roles" title="Roles" openSection={openSection} onToggle={toggle}>
                <RoleManager />
            </AccordionSection>
        </div>
    );
};
