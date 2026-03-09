import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Eye, ChevronDown, ChevronRight,
  Palette, RefreshCw, LayoutGrid, FileText, Move,
  Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  LayoutTemplate, GripVertical, EyeOff
} from 'lucide-react';
import { useInfographicStore } from '../store/useInfographicStore';
import { useBrandStore } from '../store/useBrandStore';
import { usePresentationStore, type FontConfig } from '../store/usePresentationStore';
import { useThemeStore } from '../store/useThemeStore';
import { ColorPicker } from '../components/shared/ColorPicker';
import { FontSelector } from '../components/sidebar/shared/FontSelector';

type TabType = 'slides' | 'header' | 'footer' | 'typography' | 'layout' | 'content' | 'theme';

// Font weight options
const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
  { value: 'black', label: 'Black' },
];

// Font editor component
const FontEditor: React.FC<{
  label: string;
  config: FontConfig;
  onChange: (config: FontConfig) => void;
  isDarkMode: boolean;
}> = ({ label, config, onChange, isDarkMode }) => (
  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
    <h4 className="font-medium mb-3">{label}</h4>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Font Family</label>
        <FontSelector
          value={config.fontFamily}
          onChange={(font) => onChange({ ...config, fontFamily: font })}
          label=""
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Size</label>
        <input
          type="number"
          min={8}
          max={120}
          value={config.fontSize}
          onChange={(e) => onChange({ ...config, fontSize: parseInt(e.target.value) || 16 })}
          className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-slate-300'} border`}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Weight</label>
        <select
          value={config.fontWeight}
          onChange={(e) => onChange({ ...config, fontWeight: e.target.value as FontConfig['fontWeight'] })}
          className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-slate-300'} border`}
        >
          {fontWeightOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Color</label>
        <ColorPicker
          color={config.color}
          onChange={(color) => onChange({ ...config, color })}
          label=""
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Line Height</label>
        <input
          type="number"
          min={1}
          max={3}
          step={0.1}
          value={config.lineHeight}
          onChange={(e) => onChange({ ...config, lineHeight: parseFloat(e.target.value) || 1.5 })}
          className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-slate-300'} border`}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Letter Spacing</label>
        <input
          type="number"
          min={-5}
          max={10}
          step={0.5}
          value={config.letterSpacing}
          onChange={(e) => onChange({ ...config, letterSpacing: parseFloat(e.target.value) || 0 })}
          className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-slate-300'} border`}
        />
      </div>
    </div>
  </div>
);

// Alignment button group
const AlignmentButtons: React.FC<{
  value: 'left' | 'center' | 'right' | 'justify';
  onChange: (value: 'left' | 'center' | 'right' | 'justify') => void;
  includeJustify?: boolean;
  isDarkMode: boolean;
}> = ({ value, onChange, includeJustify = false, isDarkMode }) => (
  <div className="flex gap-1">
    {[
      { id: 'left', icon: AlignLeft },
      { id: 'center', icon: AlignCenter },
      { id: 'right', icon: AlignRight },
      ...(includeJustify ? [{ id: 'justify', icon: AlignJustify }] : []),
    ].map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id as typeof value)}
        className={`p-2 rounded-lg transition-colors ${
          value === opt.id
            ? 'bg-blue-500 text-white'
            : isDarkMode
              ? 'hover:bg-slate-600 text-slate-300'
              : 'hover:bg-slate-200 text-slate-600'
        }`}
      >
        <opt.icon size={16} />
      </button>
    ))}
  </div>
);

export const PresentationConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const phases = useInfographicStore((s) => s.phases);
  const titleBar = useInfographicStore((s) => s.titleBar);
  const { brand } = useBrandStore();
  const { config, setConfig, resetConfig, togglePhase, toggleStep, updateHeader, updateFooter, updateTypography, updateLayout, updateContent, reorderSlides, hideSlide, showSlide } = usePresentationStore();
  const { isDarkMode } = useThemeStore();
  
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('slides');
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null);

  // Initialize all phases as selected if none selected
  useEffect(() => {
    if (config.selectedPhaseIds.length === 0 && phases.length > 0) {
      setConfig({ selectedPhaseIds: phases.map(p => p.id) });
    }
  }, [phases]);

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const selectAllSteps = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    const stepIds = phase.steps.map(s => s.id);
    const newSelected = [...new Set([...config.selectedStepIds, ...stepIds])];
    setConfig({ selectedStepIds: newSelected });
  };

  const deselectAllSteps = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    const stepIds = new Set(phase.steps.map(s => s.id));
    const newSelected = config.selectedStepIds.filter(id => !stepIds.has(id));
    setConfig({ selectedStepIds: newSelected });
  };

  const handleStartPresentation = () => {
    navigate('/present');
  };

  // Build slides list for reorder
  const buildSlidesList = () => {
    const slides: { id: string; title: string; type: string; visible: boolean }[] = [];
    
    if (config.includeCoverSlide) {
      slides.push({ id: 'cover', title: titleBar.text || 'Cover', type: 'cover', visible: !config.hiddenSlides.includes('cover') });
    }
    if (config.includeAgendaSlide && phases.length >= 3) {
      slides.push({ id: 'agenda', title: 'Agenda', type: 'agenda', visible: !config.hiddenSlides.includes('agenda') });
    }
    
    config.selectedPhaseIds.forEach((phaseId) => {
      const phase = phases.find(p => p.id === phaseId);
      if (!phase) return;
      
      if (config.showPhaseOverview) {
        slides.push({ id: `phase-${phase.id}`, title: phase.title, type: 'phase', visible: !config.hiddenSlides.includes(`phase-${phase.id}`) });
      }
      
      if (config.showStepDetails) {
        phase.steps.forEach((step) => {
          if (config.selectedStepIds.includes(step.id)) {
            slides.push({ id: `step-${step.id}`, title: step.title, type: 'step', visible: !config.hiddenSlides.includes(`step-${step.id}`) });
          }
        });
      }
    });
    
    if (config.includeThankYouSlide) {
      slides.push({ id: 'thankyou', title: 'Thank You', type: 'thankyou', visible: !config.hiddenSlides.includes('thankyou') });
    }
    
    return slides;
  };

  const slidesList = buildSlidesList();
  const visibleSlides = slidesList.filter(s => s.visible);
  const totalSlides = visibleSlides.length;

  const handleDragStart = (slideId: string) => {
    setDraggedSlide(slideId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedSlide) return;
    
    const fromIndex = slidesList.findIndex(s => s.id === draggedSlide);
    if (fromIndex !== -1 && fromIndex !== index) {
      reorderSlides(fromIndex, index);
    }
  };

  const handleDragEnd = () => {
    setDraggedSlide(null);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'slides', label: 'Slides', icon: LayoutGrid },
    { id: 'header', label: 'Header', icon: LayoutTemplate },
    { id: 'footer', label: 'Footer', icon: LayoutTemplate },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: AlignLeft },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/project')}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Presentation Setup</h1>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {titleBar.text || 'Untitled Project'} • {totalSlides} slides
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={resetConfig}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              onClick={handleStartPresentation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Play size={16} />
              Start Presentation
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="flex-1">
            {/* Tabs */}
            <div className={`flex border-b mb-6 overflow-x-auto ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : isDarkMode
                        ? 'border-transparent text-slate-400 hover:text-slate-200'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'slides' && (
              <div className="space-y-4">
                {/* Special Slides */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Special Slides</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'includeCoverSlide', label: 'Cover slide (title page)' },
                      { key: 'includeAgendaSlide', label: 'Agenda slide (overview of phases)' },
                      { key: 'includeThankYouSlide', label: 'Thank you slide (closing)' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config[item.key as keyof typeof config] as boolean}
                          onChange={(e) => setConfig({ [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Phase Overview Options */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Phase Slides</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showPhaseOverview}
                        onChange={(e) => setConfig({ showPhaseOverview: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show phase overview slides</span>
                    </label>
                    {config.showPhaseOverview && (
                      <div className="ml-7">
                        <label className="text-sm text-slate-500">Max steps per phase slide:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={config.slidesPerPhase}
                          onChange={(e) => setConfig({ slidesPerPhase: parseInt(e.target.value) || 4 })}
                          className={`ml-2 w-16 px-2 py-1 rounded text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Detail Options */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Step Detail Slides</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showStepDetails}
                        onChange={(e) => setConfig({ showStepDetails: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show individual step slides</span>
                    </label>
                  </div>
                </div>

                {/* Phase & Step Selection */}
                <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold">Select Content</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Choose which phases and steps to include
                    </p>
                  </div>
                  
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {phases.map((phase) => {
                      const isPhaseSelected = config.selectedPhaseIds.includes(phase.id);
                      const isExpanded = expandedPhases.has(phase.id);
                      const selectedStepsInPhase = phase.steps.filter(s => config.selectedStepIds.includes(s.id)).length;
                      
                      return (
                        <div key={phase.id}>
                          <div className={`flex items-center gap-3 p-3 ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                            <button onClick={() => togglePhaseExpand(phase.id)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <input
                              type="checkbox"
                              checked={isPhaseSelected}
                              onChange={() => {
                                togglePhase(phase.id);
                                if (!isPhaseSelected) selectAllSteps(phase.id);
                                else deselectAllSteps(phase.id);
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
                            <div className="flex-1">
                              <span className="font-medium">{phase.title}</span>
                              <span className={`ml-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                ({selectedStepsInPhase}/{phase.steps.length} steps)
                              </span>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className={`ml-10 mr-3 mb-2 space-y-1 ${isDarkMode ? 'bg-slate-700/30 rounded-lg p-2' : 'bg-slate-50 rounded-lg p-2'}`}>
                              {phase.steps.map((step) => (
                                <div key={step.id} className={`flex items-center gap-3 p-2 rounded ${isDarkMode ? 'hover:bg-slate-600/50' : 'hover:bg-white'}`}>
                                  <input
                                    type="checkbox"
                                    checked={config.selectedStepIds.includes(step.id)}
                                    onChange={() => toggleStep(step.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className={`text-sm ${!config.selectedStepIds.includes(step.id) ? 'opacity-50' : ''}`}>
                                    {step.title}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                    {step.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slide Order */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Move size={16} />
                    Slide Order
                  </h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Drag to reorder slides. Click the eye to show/hide.
                  </p>
                  <div className="space-y-2">
                    {slidesList.map((slide, index) => (
                      <div
                        key={slide.id}
                        draggable
                        onDragStart={() => handleDragStart(slide.id)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-move transition-colors ${
                          draggedSlide === slide.id
                            ? 'opacity-50 border-2 border-dashed border-blue-400'
                            : isDarkMode
                              ? 'bg-slate-700/50 hover:bg-slate-700'
                              : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <GripVertical size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 font-medium">{slide.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {slide.type}
                        </span>
                        <button
                          onClick={() => slide.visible ? hideSlide(slide.id) : showSlide(slide.id)}
                          className={`p-1.5 rounded transition-colors ${
                            slide.visible
                              ? 'text-blue-500 hover:bg-blue-500/10'
                              : isDarkMode
                                ? 'text-slate-500 hover:text-slate-300'
                                : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {slide.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Header Tab */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={config.header.enabled}
                      onChange={(e) => updateHeader({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Show Header</span>
                  </label>

                  {config.header.enabled && (
                    <div className="space-y-4">
                      {/* Height */}
                      <div>
                        <label className="text-sm text-slate-500 mb-1 block">Header Height (px)</label>
                        <input
                          type="number"
                          min={32}
                          max={100}
                          value={config.header.height}
                          onChange={(e) => updateHeader({ height: parseInt(e.target.value) || 48 })}
                          className={`w-24 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                        />
                      </div>

                      {/* Background */}
                      <div>
                        <label className="text-sm text-slate-500 mb-2 block">Background Type</label>
                        <div className="flex gap-2 mb-3">
                          {['solid', 'gradient', 'transparent'].map((type) => (
                            <button
                              key={type}
                              onClick={() => updateHeader({ backgroundType: type as 'solid' | 'gradient' | 'transparent' })}
                              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                                config.header.backgroundType === type
                                  ? 'bg-blue-500 text-white'
                                  : isDarkMode
                                    ? 'bg-slate-700 hover:bg-slate-600'
                                    : 'bg-slate-100 hover:bg-slate-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        {config.header.backgroundType !== 'transparent' && (
                          <div className="flex gap-3">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Color</label>
                              <ColorPicker
                                color={config.header.backgroundColor}
                                onChange={(color) => updateHeader({ backgroundColor: color })}
                                label=""
                              />
                            </div>
                            {config.header.backgroundType === 'gradient' && (
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">End Color</label>
                                <ColorPicker
                                  color={config.header.gradientEndColor}
                                  onChange={(color) => updateHeader({ gradientEndColor: color })}
                                  label=""
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Logo Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-500 mb-2 block">Logo Position</label>
                          <select
                            value={config.header.logoPosition}
                            onChange={(e) => updateHeader({ logoPosition: e.target.value as 'left' | 'center' | 'right' })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500 mb-2 block">Logo Height (px)</label>
                          <input
                            type="number"
                            min={16}
                            max={64}
                            value={config.header.logoHeight}
                            onChange={(e) => updateHeader({ logoHeight: parseInt(e.target.value) || 28 })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.header.showCompanyName}
                            onChange={(e) => updateHeader({ showCompanyName: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Show Company Name</span>
                        </label>
                        {config.header.showCompanyName && (
                          <div className="grid grid-cols-2 gap-4 ml-7">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Position</label>
                              <select
                                value={config.header.companyNamePosition}
                                onChange={(e) => updateHeader({ companyNamePosition: e.target.value as 'left' | 'center' | 'right' })}
                                className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Font Size</label>
                              <input
                                type="number"
                                min={10}
                                max={24}
                                value={config.header.companyNameSize}
                                onChange={(e) => updateHeader({ companyNameSize: parseInt(e.target.value) || 14 })}
                                className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Border */}
                      <div>
                        <label className="text-sm text-slate-500 mb-2 block">Border Style</label>
                        <div className="flex gap-2 mb-3">
                          {['none', 'solid', 'dashed'].map((style) => (
                            <button
                              key={style}
                              onClick={() => updateHeader({ borderStyle: style as 'none' | 'solid' | 'dashed' | 'gradient' })}
                              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                                config.header.borderStyle === style
                                  ? 'bg-blue-500 text-white'
                                  : isDarkMode
                                    ? 'bg-slate-700 hover:bg-slate-600'
                                    : 'bg-slate-100 hover:bg-slate-200'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                        {config.header.borderStyle !== 'none' && (
                          <div className="flex gap-3">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Width</label>
                              <input
                                type="number"
                                min={1}
                                max={4}
                                value={config.header.borderWidth}
                                onChange={(e) => updateHeader({ borderWidth: parseInt(e.target.value) || 1 })}
                                className={`w-20 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Color</label>
                              <ColorPicker
                                color={config.header.borderColor}
                                onChange={(color) => updateHeader({ borderColor: color })}
                                label=""
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={config.footer.enabled}
                      onChange={(e) => updateFooter({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Show Footer</span>
                  </label>

                  {config.footer.enabled && (
                    <div className="space-y-4">
                      {/* Height */}
                      <div>
                        <label className="text-sm text-slate-500 mb-1 block">Footer Height (px)</label>
                        <input
                          type="number"
                          min={24}
                          max={80}
                          value={config.footer.height}
                          onChange={(e) => updateFooter({ height: parseInt(e.target.value) || 40 })}
                          className={`w-24 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                        />
                      </div>

                      {/* Background */}
                      <div className="flex gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Background Color</label>
                          <ColorPicker
                            color={config.footer.backgroundColor}
                            onChange={(color) => updateFooter({ backgroundColor: color })}
                            label=""
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Text Color</label>
                          <ColorPicker
                            color={config.footer.textColor}
                            onChange={(color) => updateFooter({ textColor: color })}
                            label=""
                          />
                        </div>
                      </div>

                      {/* Content Sections */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-slate-500 mb-2 block">Left Content</label>
                          <select
                            value={config.footer.leftContent}
                            onChange={(e) => updateFooter({ leftContent: e.target.value as typeof config.footer.leftContent })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          >
                            <option value="none">None</option>
                            <option value="logo">Logo</option>
                            <option value="company">Company Name</option>
                            <option value="slide-title">Slide Title</option>
                            <option value="custom">Custom Text</option>
                          </select>
                          {config.footer.leftContent === 'custom' && (
                            <input
                              type="text"
                              value={config.footer.customLeftText}
                              onChange={(e) => updateFooter({ customLeftText: e.target.value })}
                              placeholder="Custom text..."
                              className={`w-full mt-2 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-slate-500 mb-2 block">Center Content</label>
                          <select
                            value={config.footer.centerContent}
                            onChange={(e) => updateFooter({ centerContent: e.target.value as typeof config.footer.centerContent })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          >
                            <option value="none">None</option>
                            <option value="company">Company Name</option>
                            <option value="slide-title">Slide Title</option>
                            <option value="section">Section Name</option>
                            <option value="date">Date</option>
                            <option value="custom">Custom Text</option>
                          </select>
                          {config.footer.centerContent === 'custom' && (
                            <input
                              type="text"
                              value={config.footer.customCenterText}
                              onChange={(e) => updateFooter({ customCenterText: e.target.value })}
                              placeholder="Custom text..."
                              className={`w-full mt-2 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-slate-500 mb-2 block">Right Content</label>
                          <select
                            value={config.footer.rightContent}
                            onChange={(e) => updateFooter({ rightContent: e.target.value as typeof config.footer.rightContent })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          >
                            <option value="none">None</option>
                            <option value="slide-number">Slide Number</option>
                            <option value="total-slides">Slide X of Y</option>
                            <option value="date">Date</option>
                            <option value="company">Company Name</option>
                            <option value="custom">Custom Text</option>
                          </select>
                          {config.footer.rightContent === 'custom' && (
                            <input
                              type="text"
                              value={config.footer.customRightText}
                              onChange={(e) => updateFooter({ customRightText: e.target.value })}
                              placeholder="Custom text..."
                              className={`w-full mt-2 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.footer.showDivider}
                          onChange={(e) => updateFooter({ showDivider: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Show top divider line</span>
                      </label>
                      {config.footer.showDivider && (
                        <div className="ml-7">
                          <ColorPicker
                            color={config.footer.dividerColor}
                            onChange={(color) => updateFooter({ dividerColor: color })}
                            label="Divider Color"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <FontEditor
                  label="Title Font"
                  config={config.typography.titleFont}
                  onChange={(font) => updateTypography({ titleFont: font })}
                  isDarkMode={isDarkMode}
                />
                <FontEditor
                  label="Subtitle Font"
                  config={config.typography.subtitleFont}
                  onChange={(font) => updateTypography({ subtitleFont: font })}
                  isDarkMode={isDarkMode}
                />
                <FontEditor
                  label="Body Font"
                  config={config.typography.bodyFont}
                  onChange={(font) => updateTypography({ bodyFont: font })}
                  isDarkMode={isDarkMode}
                />
                <FontEditor
                  label="Caption Font"
                  config={config.typography.captionFont}
                  onChange={(font) => updateTypography({ captionFont: font })}
                  isDarkMode={isDarkMode}
                />
                <FontEditor
                  label="Accent Font"
                  config={config.typography.accentFont}
                  onChange={(font) => updateTypography({ accentFont: font })}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                {/* Alignment */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-4">Alignment</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Title Alignment</span>
                      <AlignmentButtons
                        value={config.layout.titleAlignment}
                        onChange={(v) => updateLayout({ titleAlignment: v as 'left' | 'center' | 'right' })}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subtitle Alignment</span>
                      <AlignmentButtons
                        value={config.layout.subtitleAlignment}
                        onChange={(v) => updateLayout({ subtitleAlignment: v as 'left' | 'center' | 'right' })}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Alignment</span>
                      <AlignmentButtons
                        value={config.layout.contentAlignment}
                        onChange={(v) => updateLayout({ contentAlignment: v })}
                        includeJustify
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Position */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Vertical Position</h3>
                  <div className="flex gap-2">
                    {['top', 'center', 'bottom'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateLayout({ verticalPosition: pos as 'top' | 'center' | 'bottom' })}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${
                          config.layout.verticalPosition === pos
                            ? 'bg-blue-500 text-white'
                            : isDarkMode
                              ? 'bg-slate-700 hover:bg-slate-600'
                              : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-4">Spacing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Content Padding (px)</label>
                      <input
                        type="number"
                        min={16}
                        max={100}
                        value={config.layout.contentPadding}
                        onChange={(e) => updateLayout({ contentPadding: parseInt(e.target.value) || 48 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Max Content Width (px)</label>
                      <input
                        type="number"
                        min={400}
                        max={1400}
                        step={50}
                        value={config.layout.maxContentWidth}
                        onChange={(e) => updateLayout({ maxContentWidth: parseInt(e.target.value) || 1000 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Card Gap (px)</label>
                      <input
                        type="number"
                        min={8}
                        max={40}
                        value={config.layout.cardGap}
                        onChange={(e) => updateLayout({ cardGap: parseInt(e.target.value) || 16 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Card Padding (px)</label>
                      <input
                        type="number"
                        min={8}
                        max={40}
                        value={config.layout.cardPadding}
                        onChange={(e) => updateLayout({ cardPadding: parseInt(e.target.value) || 20 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Card Border Radius (px)</label>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={config.layout.cardBorderRadius}
                        onChange={(e) => updateLayout({ cardBorderRadius: parseInt(e.target.value) || 12 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Step Content Visibility</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'showStepType', label: 'Step Type Badge' },
                      { key: 'showStepDescription', label: 'Descriptions' },
                      { key: 'showStepRoles', label: 'Role Badges' },
                      { key: 'showStepIcons', label: 'Step Icons' },
                      { key: 'showStepDuration', label: 'Duration/Timeline' },
                      { key: 'showStepStatus', label: 'Status' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.content[item.key as keyof typeof config.content] as boolean}
                          onChange={(e) => updateContent({ [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Content Type Visibility</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'showMetrics', label: 'Metrics' },
                      { key: 'showChecklist', label: 'Checklist' },
                      { key: 'showTimeline', label: 'Timeline' },
                      { key: 'showDocuments', label: 'Documents' },
                      { key: 'showRisks', label: 'Risks' },
                      { key: 'showAgendaItems', label: 'Agenda Items' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.content[item.key as keyof typeof config.content] as boolean}
                          onChange={(e) => updateContent({ [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Content Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Max Description Length</label>
                      <input
                        type="number"
                        min={50}
                        max={500}
                        step={10}
                        value={config.content.descriptionMaxLength}
                        onChange={(e) => updateContent({ descriptionMaxLength: parseInt(e.target.value) || 150 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Max Checklist Items</label>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={config.content.maxChecklistItems}
                        onChange={(e) => updateContent({ maxChecklistItems: parseInt(e.target.value) || 6 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Max Metrics Count</label>
                      <input
                        type="number"
                        min={2}
                        max={8}
                        value={config.content.maxMetricsCount}
                        onChange={(e) => updateContent({ maxMetricsCount: parseInt(e.target.value) || 4 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Max Timeline Entries</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={config.content.maxTimelineEntries}
                        onChange={(e) => updateContent({ maxTimelineEntries: parseInt(e.target.value) || 5 })}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                {/* Theme Selection */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Presentation Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['corporate', 'modern', 'minimal', 'bold', 'dark', 'custom'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setConfig({ theme })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          config.theme === theme
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : isDarkMode
                              ? 'border-slate-600 hover:border-slate-500'
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded-lg mb-2"
                          style={{
                            background: theme === 'corporate' ? '#1e293b' :
                                       theme === 'modern' ? `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` :
                                       theme === 'minimal' ? '#ffffff' :
                                       theme === 'bold' ? '#facc15' :
                                       theme === 'dark' ? '#030712' :
                                       config.customBackground
                          }}
                        />
                        <span className="text-sm font-medium capitalize">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Primary</label>
                      <ColorPicker
                        color={config.primaryColor}
                        onChange={(color) => setConfig({ primaryColor: color })}
                        label=""
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Secondary</label>
                      <ColorPicker
                        color={config.secondaryColor}
                        onChange={(color) => setConfig({ secondaryColor: color })}
                        label=""
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 mb-1 block">Accent</label>
                      <ColorPicker
                        color={config.accentColor}
                        onChange={(color) => setConfig({ accentColor: color })}
                        label=""
                      />
                    </div>
                  </div>
                  
                  {config.theme === 'custom' && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-sm text-slate-500 mb-2 block">Custom Background</label>
                      <div className="flex gap-2 mb-3">
                        {['solid', 'gradient'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setConfig({ backgroundType: type as 'solid' | 'gradient' })}
                            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                              config.backgroundType === type
                                ? 'bg-blue-500 text-white'
                                : isDarkMode
                                  ? 'bg-slate-700 hover:bg-slate-600'
                                  : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <ColorPicker
                          color={config.customBackground || '#1e293b'}
                          onChange={(color) => setConfig({ customBackground: color })}
                          label="Start"
                        />
                        {config.backgroundType === 'gradient' && (
                          <ColorPicker
                            color={config.gradientEndColor}
                            onChange={(color) => setConfig({ gradientEndColor: color })}
                            label="End"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Branding */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Branding</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showLogo}
                        onChange={(e) => setConfig({ showLogo: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show logo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showCompanyName}
                        onChange={(e) => setConfig({ showCompanyName: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show company name</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showSlideNumbers}
                        onChange={(e) => setConfig({ showSlideNumbers: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show slide numbers</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showProgressIndicator}
                        onChange={(e) => setConfig({ showProgressIndicator: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show progress indicator</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.watermarkEnabled}
                        onChange={(e) => setConfig({ watermarkEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Show watermark</span>
                    </label>
                    {config.watermarkEnabled && (
                      <div className="ml-7 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Opacity</label>
                          <input
                            type="number"
                            min={0.01}
                            max={0.3}
                            step={0.01}
                            value={config.watermarkOpacity}
                            onChange={(e) => setConfig({ watermarkOpacity: parseFloat(e.target.value) || 0.05 })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Position</label>
                          <select
                            value={config.watermarkPosition}
                            onChange={(e) => setConfig({ watermarkPosition: e.target.value as typeof config.watermarkPosition })}
                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'} border`}
                          >
                            <option value="center">Center</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transitions */}
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h3 className="font-semibold mb-3">Transitions</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {([
                      { id: 'none', label: 'None' },
                      { id: 'fade', label: 'Fade' },
                      { id: 'slide', label: 'Slide' },
                      { id: 'zoom', label: 'Zoom' },
                      { id: 'flip', label: 'Flip' },
                    ] as const).map((trans) => (
                      <button
                        key={trans.id}
                        onClick={() => setConfig({ transitionType: trans.id })}
                        className={`p-2 rounded-xl border-2 text-center transition-all ${
                          config.transitionType === trans.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : isDarkMode
                              ? 'border-slate-600 hover:border-slate-500'
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{trans.label}</span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 mb-2 block">Transition Speed: {config.transitionDuration}ms</label>
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      step={50}
                      value={config.transitionDuration}
                      onChange={(e) => setConfig({ transitionDuration: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-80 flex-shrink-0">
            <div className={`sticky top-24 rounded-xl p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye size={16} />
                Preview
              </h3>
              
              {/* Mini preview */}
              <div
                className="aspect-video rounded-lg overflow-hidden mb-4 relative"
                style={{
                  background: config.theme === 'corporate' ? '#1e293b' :
                             config.theme === 'modern' ? `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` :
                             config.theme === 'minimal' ? '#ffffff' :
                             config.theme === 'bold' ? '#facc15' :
                             config.theme === 'dark' ? '#030712' :
                             config.backgroundType === 'gradient' 
                               ? `linear-gradient(135deg, ${config.customBackground}, ${config.gradientEndColor})`
                               : config.customBackground
                }}
              >
                {/* Header preview */}
                {config.header.enabled && (
                  <div 
                    className="absolute top-0 left-0 right-0 flex items-center px-2"
                    style={{ 
                      height: `${config.header.height / 3}px`,
                      backgroundColor: config.header.backgroundType === 'transparent' 
                        ? 'transparent' 
                        : config.header.backgroundColor,
                      borderBottom: config.header.borderStyle !== 'none' 
                        ? `${config.header.borderWidth}px ${config.header.borderStyle} ${config.header.borderColor}`
                        : 'none'
                    }}
                  >
                    {config.showLogo && brand.logoBase64 && (
                      <img src={brand.logoBase64} alt="Logo" className="h-3 w-auto" style={{ maxWidth: '30%' }} />
                    )}
                  </div>
                )}
                
                {/* Content area */}
                <div className="h-full flex flex-col items-center justify-center p-4">
                  {config.showLogo && brand.logoBase64 ? (
                    <img src={brand.logoBase64} alt="Logo" className="h-6 w-auto mb-2" />
                  ) : null}
                  <div
                    className="text-sm font-bold text-center truncate w-full"
                    style={{
                      color: config.theme === 'minimal' ? '#0f172a' : config.theme === 'bold' ? '#1e293b' : '#ffffff',
                      fontFamily: config.typography.titleFont.fontFamily,
                      fontSize: `${Math.min(config.typography.titleFont.fontSize / 4, 14)}px`,
                      textAlign: config.layout.titleAlignment
                    }}
                  >
                    {titleBar.text || 'Untitled Project'}
                  </div>
                </div>
                
                {/* Footer preview */}
                {config.footer.enabled && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2"
                    style={{ 
                      height: `${config.footer.height / 3}px`,
                      backgroundColor: config.footer.backgroundColor,
                      fontSize: `${config.footer.fontSize / 2}px`,
                      color: config.footer.textColor,
                      borderTop: config.footer.showDivider ? `1px solid ${config.footer.dividerColor}` : 'none'
                    }}
                  >
                    <span className="truncate" style={{ maxWidth: '30%' }}>
                      {config.footer.leftContent === 'company' ? brand.companyName : ''}
                    </span>
                    <span className="truncate" style={{ maxWidth: '40%' }}>
                      {config.footer.centerContent === 'slide-title' ? 'Slide Title' : ''}
                    </span>
                    <span className="truncate" style={{ maxWidth: '30%' }}>
                      {config.footer.rightContent === 'slide-number' ? '1' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Total slides:</span>
                  <span className="font-medium">{totalSlides}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Phases:</span>
                  <span className="font-medium">{config.selectedPhaseIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Steps:</span>
                  <span className="font-medium">{config.selectedStepIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Theme:</span>
                  <span className="font-medium capitalize">{config.theme}</span>
                </div>
              </div>

              <hr className={`my-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} />

              <button
                onClick={handleStartPresentation}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Play size={18} />
                Start Presentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};