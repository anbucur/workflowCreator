import React, { useState, useMemo } from 'react';
import {
  X, ArrowRight, ArrowLeft, Check, Sparkles, FileText,
  Code2, Megaphone, Settings, Users, Palette, LayoutGrid, ChevronRight, Bot, RefreshCw,
} from 'lucide-react';
import { WORKFLOW_TEMPLATES, WORKFLOW_CATEGORIES, type WorkflowCategory, type WorkflowTemplate } from '../../utils/templates';
import { PREDEFINED_THEMES } from '../../utils/themes';
import { FONT_OPTIONS } from '../sidebar/shared/FontSelector';
import { useThemeStore } from '../../store/useThemeStore';
import { generateProjectName } from '../../utils/nameGenerator';


const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'general': <LayoutGrid size={16} />,
  'software': <Code2 size={16} />,
  'marketing': <Megaphone size={16} />,
  'operations': <Settings size={16} />,
  'hr': <Users size={16} />,
  'creative': <Palette size={16} />,
};

type WizardStep = 'mode' | 'ai-create' | 'template' | 'details' | 'theme' | 'review';

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'mode', label: 'Mode' },
  { id: 'ai-create', label: 'AI' },
  { id: 'template', label: 'Template' },
  { id: 'details', label: 'Details' },
  { id: 'theme', label: 'Theme' },
  { id: 'review', label: 'Review' },
];

type CreationMode = 'ai' | 'template' | 'blank';

interface ProjectWizardProps {
  onComplete: (data: ReturnType<WorkflowTemplate['build']>, themeId?: string, aiPrompt?: string) => void;
  onClose: () => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('mode');
  const [creationMode, setCreationMode] = useState<CreationMode>('template');
  const [selectedCategory, setSelectedCategory] = useState<WorkflowCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [projectName, setProjectName] = useState(() => generateProjectName());
  const [projectSubtitle, setProjectSubtitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [headingFont, setHeadingFont] = useState(`'Outfit', sans-serif`);
  const [bodyFont, setBodyFont] = useState(`'Outfit', sans-serif`);
  const [aiPrompt, setAiPrompt] = useState('');
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const template = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate);

  // When template changes, sync theme from template
  const effectiveTheme = selectedTheme || template?.themeId || '';

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return WORKFLOW_TEMPLATES;
    return WORKFLOW_TEMPLATES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const stepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const canGoNext = (() => {
    switch (currentStep) {
      case 'mode': return true;
      case 'ai-create': return aiPrompt.trim().length > 0;
      case 'template': return !!selectedTemplate;
      case 'details': return projectName.trim().length > 0;
      case 'theme': return true;
      case 'review': return true;
    }
  })();

  const goNext = () => {
    // Determine next step based on current mode
    let nextStepId: WizardStep;
    switch (currentStep) {
      case 'mode':
        nextStepId = creationMode === 'ai' ? 'ai-create' : creationMode === 'blank' ? 'details' : 'template';
        break;
      case 'ai-create':
        nextStepId = 'details';
        break;
      case 'template':
        nextStepId = 'details';
        break;
      case 'details':
        nextStepId = 'theme';
        break;
      case 'theme':
        nextStepId = 'review';
        break;
      default: {
        const idx = stepIndex + 1;
        nextStepId = WIZARD_STEPS[idx]?.id || 'review';
      }
    }
    setCurrentStep(nextStepId);
  };

  const goPrev = () => {
    const idx = stepIndex - 1;
    if (idx >= 0) {
      setCurrentStep(WIZARD_STEPS[idx].id);
    }
  };

  const handleComplete = () => {
    // Handle AI mode
    if (creationMode === 'ai') {
      // Create a blank project for AI to populate
      const blankTemplate = WORKFLOW_TEMPLATES.find(t => t.id === 'blank') || WORKFLOW_TEMPLATES[0];
      const data = blankTemplate.build(
        projectName.trim() || 'Untitled Project',
        projectSubtitle.trim()
      );

      // Apply selected theme
      const theme = PREDEFINED_THEMES.find(t => t.id === effectiveTheme);
      if (theme) {
        data.backgroundColor = theme.canvasBg;
        data.titleBar.backgroundColor = theme.titleBarBg;
        data.titleBar.textColor = theme.titleBarText;
        data.phases = data.phases.map((phase, index) => ({
          ...phase,
          backgroundColor: theme.colors[index % theme.colors.length],
        }));
      }

      // Apply font selections
      data.titleBar.titleFontFamily = headingFont;
      data.titleBar.subtitleFontFamily = bodyFont;
      data.layout.phaseTitleFontFamily = headingFont;
      data.layout.phaseSubtitleFontFamily = bodyFont;
      data.layout.cardTitleFontFamily = headingFont;
      data.layout.cardContentFontFamily = bodyFont;
      data.layout.stepLabelFontFamily = bodyFont;

      // Pass the AI prompt to onComplete
      onComplete(data, effectiveTheme, aiPrompt.trim());
      return;
    }

    // Handle template/blank mode
    if (!template) return;
    const data = template.build(
      projectName.trim() || 'Untitled Project',
      projectSubtitle.trim()
    );

    // Apply selected theme colors if different from template default
    const theme = PREDEFINED_THEMES.find(t => t.id === effectiveTheme);
    if (theme) {
      data.backgroundColor = theme.canvasBg;
      data.titleBar.backgroundColor = theme.titleBarBg;
      data.titleBar.textColor = theme.titleBarText;
      data.phases = data.phases.map((phase, index) => ({
        ...phase,
        backgroundColor: theme.colors[index % theme.colors.length],
      }));
    }

    // Apply font selections
    data.titleBar.titleFontFamily = headingFont;
    data.titleBar.subtitleFontFamily = bodyFont;
    data.layout.phaseTitleFontFamily = headingFont;
    data.layout.phaseSubtitleFontFamily = bodyFont;
    data.layout.cardTitleFontFamily = headingFont;
    data.layout.cardContentFontFamily = bodyFont;
    data.layout.stepLabelFontFamily = bodyFont;

    onComplete(data, effectiveTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>New Project</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Create a workflow from a template or start fresh</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors`}>
            <X size={18} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className={`flex items-center gap-1 px-6 py-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          {WIZARD_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => i <= stepIndex && setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : i < stepIndex
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                      : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-400'
                }`}
                disabled={i > stepIndex}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === step.id
                    ? 'bg-white/20'
                    : i < stepIndex
                      ? 'bg-blue-200 text-blue-700'
                      : isDarkMode ? 'bg-slate-600 text-slate-500' : 'bg-slate-300 text-slate-500'
                }`}>
                  {i < stepIndex ? <Check size={10} /> : i + 1}
                </span>
                {step.label}
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <ChevronRight size={14} className={`${isDarkMode ? 'text-slate-600' : 'text-slate-300'} mx-1`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'mode' && (
            <StepMode
              selectedMode={creationMode}
              onModeChange={setCreationMode}
              isDarkMode={isDarkMode}
            />
          )}
          {currentStep === 'ai-create' && (
            <StepAICreate
              prompt={aiPrompt}
              onPromptChange={setAiPrompt}
              isDarkMode={isDarkMode}
            />
          )}
          {currentStep === 'template' && (
            <StepTemplate
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              templates={filteredTemplates}
              selectedTemplate={selectedTemplate}
              isDarkMode={isDarkMode}
              onSelectTemplate={(id) => {
                setSelectedTemplate(id);
                const tmpl = WORKFLOW_TEMPLATES.find(t => t.id === id);
                if (tmpl) {
                  setSelectedTheme(tmpl.themeId);
                  const theme = PREDEFINED_THEMES.find(t => t.id === tmpl.themeId);
                  if (theme) {
                    setHeadingFont(theme.fonts.headingFont);
                    setBodyFont(theme.fonts.bodyFont);
                  }
                }
              }}
            />
          )}
          {currentStep === 'details' && (
            <StepDetails
              name={projectName}
              onNameChange={setProjectName}
              subtitle={projectSubtitle}
              onSubtitleChange={setProjectSubtitle}
              templateName={creationMode === 'ai' ? 'AI Generated' : template?.name || 'Blank'}
              isDarkMode={isDarkMode}
              onRegenerateName={() => setProjectName(generateProjectName())}
            />
          )}
          {currentStep === 'theme' && (
            <StepTheme
              selectedTheme={effectiveTheme}
              onThemeChange={setSelectedTheme}
              headingFont={headingFont}
              bodyFont={bodyFont}
              onHeadingFontChange={setHeadingFont}
              onBodyFontChange={setBodyFont}
              isDarkMode={isDarkMode}
            />
          )}
          {currentStep === 'review' && (
            <StepReview
              templateName={creationMode === 'ai' ? 'AI Generated' : template?.name || 'Blank'}
              projectName={projectName || 'Untitled Project'}
              subtitle={projectSubtitle}
              themeName={PREDEFINED_THEMES.find(t => t.id === effectiveTheme)?.name || 'Custom'}
              headingFont={headingFont}
              bodyFont={bodyFont}
              phaseCount={template ? WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate)?.build('', '').phases.length || 0 : 0}
              isDarkMode={isDarkMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <button
            onClick={stepIndex === 0 ? onClose : goPrev}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} rounded-lg transition-colors`}
          >
            <ArrowLeft size={14} />
            {stepIndex === 0 ? 'Cancel' : 'Back'}
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-blue-700 shadow-md transition-all"
            >
              <Sparkles size={14} />
              Create Project
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  Step 1: Template Selection                                     */
/* ──────────────────────────────────────────────────────────────── */
const StepTemplate: React.FC<{
  selectedCategory: WorkflowCategory | 'all';
  onCategoryChange: (cat: WorkflowCategory | 'all') => void;
  templates: WorkflowTemplate[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  isDarkMode: boolean;
}> = ({ selectedCategory, onCategoryChange, templates, selectedTemplate, onSelectTemplate, isDarkMode }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>Choose a Template</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select a pre-built workflow template or start with a blank canvas.</p>
    </div>

    {/* Category filters */}
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          selectedCategory === 'all'
            ? 'bg-slate-800 text-white border-slate-800'
            : `${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-slate-600' : 'border-slate-400'}`
        }`}
      >
        All
      </button>
      {WORKFLOW_CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            selectedCategory === cat.id
              ? 'bg-slate-800 text-white border-slate-800'
              : `${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-slate-600' : 'border-slate-400'}`
          }`}
        >
          {CATEGORY_ICONS[cat.id]}
          {cat.label}
        </button>
      ))}
    </div>

    {/* Template grid */}
    <div className="grid grid-cols-2 gap-3">
      {templates.map(tmpl => {
        const isSelected = selectedTemplate === tmpl.id;
        const theme = PREDEFINED_THEMES.find(t => t.id === tmpl.themeId);
        return (
          <button
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl.id)}
            className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              isSelected
                ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-blue-600' : 'border-blue-300'}`
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-100' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-100')
                }`}>
                  <FileText size={16} className={isSelected ? 'text-blue-600' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
                </div>
                <div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} block`}>{tmpl.name}</span>
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
                    {WORKFLOW_CATEGORIES.find(c => c.id === tmpl.category)?.label}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>{tmpl.description}</p>
            {theme && (
              <div className="flex rounded-md overflow-hidden h-2 w-full">
                {theme.colors.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────── */
/*  Step 2: Project Details                                        */
/* ──────────────────────────────────────────────────────────────── */
const StepDetails: React.FC<{
  name: string;
  onNameChange: (v: string) => void;
  subtitle: string;
  onSubtitleChange: (v: string) => void;
  templateName: string;
  isDarkMode: boolean;
  onRegenerateName: () => void;
}> = ({ name, onNameChange, subtitle, onSubtitleChange, templateName, isDarkMode, onRegenerateName }) => (
  <div className="flex flex-col gap-6 max-w-lg mx-auto">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>Project Details</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Based on the <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{templateName}</span> template.</p>
    </div>

    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Project Name <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Q3 Product Launch"
            className={`flex-1 px-4 py-3 text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'} rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
            autoFocus
          />
          <button
            type="button"
            onClick={onRegenerateName}
            title="Generate a new random name"
            className={`px-3 py-3 border ${isDarkMode ? 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-400' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-500'} rounded-xl transition-colors`}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Subtitle</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="e.g. Workflow for the new mobile app release"
          className={`px-4 py-3 text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'} rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────── */
/*  Step 3: Theme & Fonts                                          */
/* ──────────────────────────────────────────────────────────────── */
const StepTheme: React.FC<{
  selectedTheme: string;
  onThemeChange: (id: string) => void;
  headingFont: string;
  bodyFont: string;
  onHeadingFontChange: (v: string) => void;
  onBodyFontChange: (v: string) => void;
  isDarkMode: boolean;
}> = ({ selectedTheme, onThemeChange, headingFont, bodyFont, onHeadingFontChange, onBodyFontChange, isDarkMode }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>Theme & Typography</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose a colour theme and fonts. Text colours will automatically adapt for readability.</p>
    </div>

    {/* Theme Grid */}
    <div className="grid grid-cols-2 gap-3">
      {PREDEFINED_THEMES.map(theme => {
        const isActive = selectedTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => {
              onThemeChange(theme.id);
              onHeadingFontChange(theme.fonts.headingFont);
              onBodyFontChange(theme.fonts.bodyFont);
            }}
            className={`flex flex-col gap-2 p-3 rounded-xl border-2 text-left transition-all ${
              isActive
                ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-blue-600' : 'border-blue-300'}`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{theme.name}</span>
              {isActive && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className={`flex rounded-md overflow-hidden h-5 w-full border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              {theme.colors.map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            {/* Font preview */}
            <div className={`flex items-center gap-2 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <span style={{ fontFamily: theme.fonts.headingFont }} className="font-semibold">
                Aa
              </span>
              <span>{theme.fonts.headingFont.replace(/'/g, '').split(',')[0]}</span>
              +
              <span>{theme.fonts.bodyFont.replace(/'/g, '').split(',')[0]}</span>
            </div>
          </button>
        );
      })}
    </div>

    {/* Font Selectors */}
    <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pt-4`}>
      <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider mb-3`}>Customize Fonts</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Heading Font</label>
          <select
            value={headingFont}
            onChange={(e) => onHeadingFontChange(e.target.value)}
            className={`px-3 py-2 text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'} rounded-lg focus:outline-none focus:border-blue-500`}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <div className={`px-3 py-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <span style={{ fontFamily: headingFont }} className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              The quick brown fox
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Body Font</label>
          <select
            value={bodyFont}
            onChange={(e) => onBodyFontChange(e.target.value)}
            className={`px-3 py-2 text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'} rounded-lg focus:outline-none focus:border-blue-500`}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <div className={`px-3 py-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <span style={{ fontFamily: bodyFont }} className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────── */
/*  Step 4: Review                                                 */
/* ──────────────────────────────────────────────────────────────── */
const StepReview: React.FC<{
  templateName: string;
  projectName: string;
  subtitle: string;
  themeName: string;
  headingFont: string;
  bodyFont: string;
  phaseCount: number;
  isDarkMode: boolean;
}> = ({ templateName, projectName, subtitle, themeName, headingFont, bodyFont, phaseCount, isDarkMode }) => (
  <div className="flex flex-col gap-6 max-w-lg mx-auto">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>Review & Create</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything looks good? Click "Create Project" to get started.</p>
    </div>

    <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
      <ReviewRow label="Template" value={templateName} isDarkMode={isDarkMode} />
      <ReviewRow label="Project Name" value={projectName} isDarkMode={isDarkMode} />
      {subtitle && <ReviewRow label="Subtitle" value={subtitle} isDarkMode={isDarkMode} />}
      <ReviewRow label="Theme" value={themeName} isDarkMode={isDarkMode} />
      <ReviewRow label="Heading Font" value={headingFont.replace(/'/g, '').split(',')[0]} isDarkMode={isDarkMode} />
      <ReviewRow label="Body Font" value={bodyFont.replace(/'/g, '').split(',')[0]} isDarkMode={isDarkMode} />
      <ReviewRow label="Phases" value={phaseCount > 0 ? `${phaseCount} phases pre-built` : 'Empty canvas'} isDarkMode={isDarkMode} />
    </div>

    <div className={`flex items-center gap-3 p-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-xl border ${isDarkMode ? 'border-blue-800' : 'border-blue-100'}`}>
      <Sparkles size={18} className="text-blue-600 shrink-0" />
      <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} leading-relaxed`}>
        You can customize everything after creation — add phases, steps, connectors, change themes, and more.
      </p>
    </div>
  </div>
);

const ReviewRow: React.FC<{ label: string; value: string; isDarkMode: boolean }> = ({ label, value, isDarkMode }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{value}</span>
  </div>
);

/* ──────────────────────────────────────────────────────────────── */
/*  Step 0: Creation Mode Selection                                */
/* ──────────────────────────────────────────────────────────────── */
const StepMode: React.FC<{
  selectedMode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  isDarkMode: boolean;
}> = ({ selectedMode, onModeChange, isDarkMode }) => (
  <div className="flex flex-col gap-6 max-w-lg mx-auto">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>How would you like to create your project?</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose the method that works best for you.</p>
    </div>

    <div className="grid gap-3">
      {/* AI Creation */}
      <button
        onClick={() => onModeChange('ai')}
        className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
          selectedMode === 'ai'
            ? 'border-purple-500 bg-purple-50/50 shadow-sm ring-2 ring-purple-500/20'
            : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-purple-600' : 'border-purple-300'}`
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          selectedMode === 'ai' ? 'bg-purple-100' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-100')
        }`}>
          <Bot size={24} className={selectedMode === 'ai' ? 'text-purple-600' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Create with AI</span>
            <span className={`px-1.5 py-0.5 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} text-[9px] font-bold rounded uppercase`}>New</span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1 leading-relaxed`}>
            Describe your workflow in natural language and let AI generate the complete project for you.
          </p>
        </div>
        {selectedMode === 'ai' && (
          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}
      </button>

      {/* Template */}
      <button
        onClick={() => onModeChange('template')}
        className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
          selectedMode === 'template'
            ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
            : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-blue-600' : 'border-blue-300'}`
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          selectedMode === 'template' ? 'bg-blue-100' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-100')
        }`}>
          <LayoutGrid size={24} className={selectedMode === 'template' ? 'text-blue-600' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
        </div>
        <div className="flex-1">
          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} block`}>Use a Template</span>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1 leading-relaxed`}>
            Start with a pre-built workflow template for common use cases.
          </p>
        </div>
        {selectedMode === 'template' && (
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}
      </button>

      {/* Blank Canvas */}
      <button
        onClick={() => onModeChange('blank')}
        className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
          selectedMode === 'blank'
            ? `border-slate-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} shadow-sm ring-2 ring-slate-500/20`
            : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} hover:${isDarkMode ? 'border-slate-600' : 'border-slate-400'}`
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          selectedMode === 'blank' ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-200') : (isDarkMode ? 'bg-slate-800' : 'bg-slate-100')
        }`}>
          <FileText size={24} className={selectedMode === 'blank' ? (isDarkMode ? 'text-slate-300' : 'text-slate-700') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')} />
        </div>
        <div className="flex-1">
          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} block`}>Start from Scratch</span>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1 leading-relaxed`}>
            Begin with a blank canvas and build your workflow from the ground up.
          </p>
        </div>
        {selectedMode === 'blank' && (
          <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}
      </button>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────── */
/*  Step 0.5: AI Creation Prompt                                   */
/* ──────────────────────────────────────────────────────────────── */
const StepAICreate: React.FC<{
  prompt: string;
  onPromptChange: (v: string) => void;
  isDarkMode: boolean;
}> = ({ prompt, onPromptChange, isDarkMode }) => (
  <div className="flex flex-col gap-6 max-w-lg mx-auto">
    <div>
      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} mb-1`}>Describe Your Workflow</h3>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tell AI what kind of workflow you want to create.</p>
    </div>

    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., Create a software development workflow with design, development, testing, and deployment phases. Include code review and QA steps."
          className={`px-4 py-3 text-sm border ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'} rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[120px] resize-none`}
          autoFocus
        />
      </div>

      <div className={`flex items-start gap-3 p-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-xl border ${isDarkMode ? 'border-purple-800' : 'border-purple-100'}`}>
        <Sparkles size={18} className="text-purple-600 shrink-0 mt-0.5" />
        <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} leading-relaxed`}>
          <p className="font-semibold mb-1">AI will generate:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Relevant phases for your workflow</li>
            <li>Appropriate steps in each phase</li>
            <li>Roles and responsibilities</li>
            <li>Matching theme and styling</li>
          </ul>
        </div>
      </div>

      <div className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tip:</span> Be specific about the type of workflow, industry, and key stages you need.
      </div>
    </div>
  </div>
);
