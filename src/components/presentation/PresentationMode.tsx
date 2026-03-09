import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, Maximize2, Download,
  LayoutGrid, BarChart3, Target, Map, Zap, Circle,
  Calendar, Scale, Columns, ListChecks, ArrowRightLeft, Flag,
  FileText, Calculator, RefreshCw, GanttChart, AlertTriangle,
  Kanban, Trophy, Users, Clock, Check,
  Play, Pause, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useBrandStore } from '../../store/useBrandStore';
import type { Phase, Step, RoleDefinition } from '../../types';
import type { BrandKit } from '../../types/integrations';
import { exportInfographic } from '../../utils/export';
import { useExportStore } from '../../store/useExportStore';

interface Props {
  onClose: () => void;
}

type SlideType = 'cover' | 'agenda' | 'phase' | 'step' | 'metrics' | 'roadmap' | 'thankyou';

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  phase?: Phase;
  step?: Step;
  phaseIndex?: number;
}

function buildSlides(phases: Phase[], titleBar: { text: string; subtitle?: string }, companyName: string): Slide[] {
  const slides: Slide[] = [];

  // Cover slide
  slides.push({ id: 'cover', type: 'cover', title: titleBar.text });

  // Agenda slide (if 3+ phases)
  if (phases.length >= 3) {
    slides.push({ id: 'agenda', type: 'agenda', title: 'Agenda' });
  }

  // One slide per phase, then individual step slides for ALL steps
  phases.forEach((phase, phaseIndex) => {
    slides.push({ id: `phase-${phase.id}`, type: 'phase', title: phase.title, phase, phaseIndex });

    // Create individual step slides for ALL steps with detailed content
    phase.steps.forEach(step => {
      slides.push({ id: `step-${step.id}`, type: 'step', title: step.title, phase, step, phaseIndex });
    });
  });

  // Thank you / closing slide
  slides.push({ id: 'thankyou', type: 'thankyou', title: companyName || 'Thank You' });

  return slides;
}

// ─── Slide Renderers ─────────────────────────────────────────────────────────

export interface SlideProps {
  slide: Slide;
  brand: BrandKit;
  titleBar: { text: string; subtitle?: string; logoUrl?: string };
  phases: Phase[];
  themeStyles: ThemeStyles;
  roles: RoleDefinition[];
}

export interface ThemeStyles {
  container: string;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  metaColor: string;
}

export function getThemeStyles(theme: string, primary: string, _secondary: string): ThemeStyles {
  const themes: Record<string, ThemeStyles> = {
    corporate: {
      container: 'bg-slate-800 text-white',
      titleColor: '#ffffff',
      subtitleColor: '#94a3b8',
      accentColor: primary,
      cardBg: 'rgba(255,255,255,0.07)',
      cardBorder: 'rgba(255,255,255,0.1)',
      metaColor: '#64748b',
    },
    modern: {
      container: 'text-white',
      titleColor: '#ffffff',
      subtitleColor: 'rgba(255,255,255,0.75)',
      accentColor: '#ffffff',
      cardBg: 'rgba(255,255,255,0.12)',
      cardBorder: 'rgba(255,255,255,0.2)',
      metaColor: 'rgba(255,255,255,0.5)',
    },
    minimal: {
      container: 'bg-white text-slate-900 border border-slate-100',
      titleColor: '#0f172a',
      subtitleColor: '#64748b',
      accentColor: primary,
      cardBg: '#f8fafc',
      cardBorder: '#e2e8f0',
      metaColor: '#94a3b8',
    },
    bold: {
      container: 'bg-yellow-400 text-slate-900',
      titleColor: '#1e293b',
      subtitleColor: '#475569',
      accentColor: '#1e293b',
      cardBg: 'rgba(0,0,0,0.08)',
      cardBorder: 'rgba(0,0,0,0.12)',
      metaColor: '#64748b',
    },
    dark: {
      container: 'bg-slate-950 text-cyan-400',
      titleColor: '#22d3ee',
      subtitleColor: '#0e7490',
      accentColor: '#22d3ee',
      cardBg: 'rgba(34,211,238,0.07)',
      cardBorder: 'rgba(34,211,238,0.2)',
      metaColor: '#0e7490',
    },
  };
  return themes[theme] || themes.corporate;
}

export const CoverSlide: React.FC<SlideProps> = ({ brand, titleBar, themeStyles }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-16">
    {brand.logoBase64 || titleBar.logoUrl ? (
      <img src={brand.logoBase64 || titleBar.logoUrl} alt="Logo" className="h-20 w-auto object-contain mb-8" />
    ) : (
      <div className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
        style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
        {(brand.companyName || 'P').charAt(0)}
      </div>
    )}
    <h1
      className="text-5xl font-black leading-tight mb-4"
      style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}
    >
      {titleBar.text}
    </h1>
    {titleBar.subtitle && (
      <p className="text-xl font-medium max-w-2xl" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
        {titleBar.subtitle}
      </p>
    )}
    <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: themeStyles.accentColor }} />
    {brand.companyName && (
      <p className="mt-4 text-sm font-semibold tracking-widest uppercase" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
        {brand.companyName}
      </p>
    )}
  </div>
);

export const AgendaSlide: React.FC<SlideProps> = ({ phases, brand, themeStyles }) => (
  <div className="flex flex-col justify-center h-full px-16">
    <h2 className="text-4xl font-black mb-10" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
      Agenda
    </h2>
    <div className="grid grid-cols-2 gap-4">
      {phases.map((phase, i) => (
        <div
          key={phase.id}
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
            style={{ backgroundColor: phase.backgroundColor }}
          >
            {i + 1}
          </div>
          <div>
            <div className="font-bold text-base" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
              {phase.title}
            </div>
            {phase.subtitle && (
              <div className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                {phase.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const STEP_TYPE_ICONS_MAP: Record<string, React.ElementType> = {
  metrics: BarChart3,
  okr: Target,
  roadmap: Map,
  sprint: Zap,
  kanban: Kanban,
  executive: BarChart3,
  meeting: Calendar,
  decision: Scale,
  parallel: Columns,
  checklist: ListChecks,
  handoff: ArrowRightLeft,
  milestone: Flag,
  document: FileText,
  estimation: Calculator,
  collaboration: RefreshCw,
  timeline: GanttChart,
  risk: AlertTriangle,
  standard: Circle,
};

// ─── Detailed Step Content Renderers for Presentation ─────────────────────────

const StepContentRenderer: React.FC<{ step: Step; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => {
  switch (step.type) {
    case 'meeting':
      return <MeetingStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'decision':
      return <DecisionStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'parallel':
      return <ParallelStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'checklist':
      return <ChecklistStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'handoff':
      return <HandoffStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'milestone':
      return <MilestoneStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'document':
      return <DocumentStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'estimation':
      return <EstimationStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'collaboration':
      return <CollaborationStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'timeline':
      return <TimelineStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'risk':
      return <RiskStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'metrics':
      return <MetricsStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'kanban':
      return <KanbanStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'okr':
      return <OKRStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'sprint':
      return <SprintStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'roadmap':
      return <RoadmapStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    case 'executive':
      return <ExecutiveStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
    default:
      return <StandardStepContent step={step} roles={roles} themeStyles={themeStyles} brand={brand} />;
  }
};

// Standard Step Content
const StandardStepContent: React.FC<{ step: Step; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => (
  <div className="space-y-4">
    {step.description && (
      <p className="text-lg leading-relaxed" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
        {step.description}
      </p>
    )}
    {step.roleIds.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {step.roleIds.map(roleId => {
          const role = roles.find(r => r.id === roleId);
          if (!role) return null;
          return (
            <span
              key={roleId}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: role.color, color: role.textColor }}
            >
              {role.name}
            </span>
          );
        })}
      </div>
    )}
  </div>
);

// Meeting Step Content
const MeetingStepContent: React.FC<{ step: Step & { type: 'meeting' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => {
  const { data } = step;
  const facilitatorRole = roles.find(r => r.id === data.facilitator);
  
  return (
    <div className="space-y-6">
      {/* Meeting metadata */}
      <div className="flex flex-wrap gap-4">
        {data.duration && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: themeStyles.cardBg }}>
            <Clock size={18} style={{ color: themeStyles.accentColor }} />
            <span style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{data.duration}</span>
          </div>
        )}
        {facilitatorRole && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: themeStyles.cardBg }}>
            <Users size={18} style={{ color: themeStyles.accentColor }} />
            <span style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>Facilitator: {facilitatorRole.name}</span>
          </div>
        )}
      </div>

      {/* Agenda items */}
      {data.agendaItems.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Agenda
          </h4>
          <ul className="space-y-2">
            {data.agendaItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: themeStyles.accentColor, color: themeStyles.container.includes('bg-slate') || themeStyles.container.includes('bg-slate-950') ? '#000' : '#fff' }}>
                  {i + 1}
                </span>
                <span style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decision outcome */}
      {data.hasDecision && data.decision && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Decision
          </h4>
          {data.decision.criteria.length > 0 && (
            <ul className="space-y-1 mb-3">
              {data.decision.criteria.map((c, i) => (
                <li key={i} className="flex items-center gap-2" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                  <Check size={16} style={{ color: themeStyles.accentColor }} />
                  {c}
                </li>
              ))}
            </ul>
          )}
          {data.decision.outcome && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: themeStyles.metaColor }}>Outcome:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                data.decision.outcome === 'approved' ? 'bg-green-500/20 text-green-400' :
                data.decision.outcome === 'rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {data.decision.outcome === 'approved' ? '✓ Approved' : data.decision.outcome === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Decision Step Content
const DecisionStepContent: React.FC<{ step: Step & { type: 'decision' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-6">
      {/* Criteria */}
      {data.criteria.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Decision Criteria
          </h4>
          <div className="grid gap-3">
            {data.criteria.map((criterion, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: themeStyles.cardBg }}>
                <Check size={20} style={{ color: themeStyles.accentColor }} className="flex-shrink-0 mt-0.5" />
                <span style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{criterion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome */}
      {data.outcome && (
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <span className="text-sm font-medium" style={{ color: themeStyles.metaColor }}>Decision:</span>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            data.outcome === 'approved' ? 'bg-green-500/20 text-green-400' :
            data.outcome === 'rejected' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {data.outcome === 'approved' ? '✓ Approved' : data.outcome === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
          </span>
        </div>
      )}
    </div>
  );
};

// Parallel Step Content
const ParallelStepContent: React.FC<{ step: Step & { type: 'parallel' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {data.tracks.map((track) => (
          <div key={track.id} className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <h4 className="font-bold mb-2" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
              {track.label}
            </h4>
            {track.description && (
              <p className="text-sm mb-3" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                {track.description}
              </p>
            )}
            {track.roleIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {track.roleIds.map(roleId => {
                  const role = roles.find(r => r.id === roleId);
                  if (!role) return null;
                  return (
                    <span key={roleId} className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: role.color, color: role.textColor }}>
                      {role.name}
                    </span>
                  );
                })}
              </div>
            )}
            {track.items.length > 0 && (
              <ul className="space-y-1">
                {track.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                    <Circle size={6} style={{ color: themeStyles.accentColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Checklist Step Content
const ChecklistStepContent: React.FC<{ step: Step & { type: 'checklist' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  const completed = data.items.filter(i => i.checked).length;
  const progress = data.items.length > 0 ? (completed / data.items.length) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Progress
          </span>
          <span className="text-sm font-bold" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>
            {completed}/{data.items.length} ({Math.round(progress)}%)
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: themeStyles.cardBg }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: themeStyles.accentColor }} />
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${item.checked ? 'opacity-60' : ''}`}
            style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.checked ? themeStyles.accentColor : 'transparent', border: item.checked ? 'none' : `2px solid ${themeStyles.cardBorder}` }}>
              {item.checked && <Check size={14} style={{ color: themeStyles.container.includes('bg-slate') || themeStyles.container.includes('bg-slate-950') ? '#000' : '#fff' }} />}
            </div>
            <span className={item.checked ? 'line-through' : ''} style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Handoff Step Content
const HandoffStepContent: React.FC<{ step: Step & { type: 'handoff' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-6">
      {/* From/To */}
      <div className="flex items-center justify-center gap-8">
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, minWidth: '150px' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>From</p>
          <p className="text-xl font-bold" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{data.fromTeam}</p>
        </div>
        <ArrowRightLeft size={32} style={{ color: themeStyles.accentColor }} />
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, minWidth: '150px' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>To</p>
          <p className="text-xl font-bold" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{data.toTeam}</p>
        </div>
      </div>

      {/* Artifacts */}
      {data.artifacts.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Artifacts
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {data.artifacts.map((artifact, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: themeStyles.cardBg }}>
                <FileText size={18} style={{ color: themeStyles.accentColor }} />
                <span style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{artifact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Milestone Step Content
const MilestoneStepContent: React.FC<{ step: Step & { type: 'milestone' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const statusConfig = {
    'none': { label: 'Not Set', icon: Circle, color: themeStyles.metaColor },
    'not-started': { label: 'Not Started', icon: Pause, color: '#94a3b8' },
    'in-progress': { label: 'In Progress', icon: Play, color: '#3b82f6' },
    'completed': { label: 'Completed', icon: Check, color: '#22c55e' },
  };
  
  const status = statusConfig[data.status];
  const StatusIcon = status.icon;
  
  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: `${status.color}20` }}>
          <StatusIcon size={20} style={{ color: status.color }} />
          <span className="font-medium" style={{ color: status.color, fontFamily: brand.fonts.body }}>{status.label}</span>
        </div>
        {data.targetDate && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: themeStyles.cardBg }}>
            <Calendar size={18} style={{ color: themeStyles.accentColor }} />
            <span style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{data.targetDate}</span>
          </div>
        )}
      </div>

      {/* Deliverables */}
      {data.deliverables.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Deliverables
          </h4>
          <div className="grid gap-3">
            {data.deliverables.map((deliverable, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
                <Trophy size={20} style={{ color: themeStyles.accentColor }} />
                <span style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{deliverable}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Document Step Content
const DocumentStepContent: React.FC<{ step: Step & { type: 'document' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {data.documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeStyles.accentColor + '20' }}>
              <FileText size={24} style={{ color: themeStyles.accentColor }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{doc.name}</p>
              <p className="text-sm" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{doc.docType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estimation Step Content
const EstimationStepContent: React.FC<{ step: Step & { type: 'estimation' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const methodLabels = {
    'tshirt': 'T-Shirt Sizing',
    'points': 'Story Points',
    'hours': 'Hours'
  };
  
  return (
    <div className="space-y-6">
      {/* Method and value */}
      <div className="flex items-center gap-6">
        <div className="px-4 py-2 rounded-full" style={{ backgroundColor: themeStyles.cardBg }}>
          <span className="text-sm font-medium" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{methodLabels[data.method]}</span>
        </div>
        {data.value && (
          <div className="px-6 py-3 rounded-xl" style={{ backgroundColor: themeStyles.accentColor }}>
            <span className="text-2xl font-black" style={{ color: themeStyles.container.includes('bg-slate') || themeStyles.container.includes('bg-slate-950') ? '#000' : '#fff', fontFamily: brand.fonts.heading }}>
              {data.value}
            </span>
          </div>
        )}
      </div>

      {/* Breakdown */}
      {data.breakdown && data.breakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {data.breakdown.map((item, i) => (
              <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
                <p className="text-2xl font-bold mb-1" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.heading }}>{item.value}</p>
                <p className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Collaboration Step Content
const CollaborationStepContent: React.FC<{ step: Step & { type: 'collaboration' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-6">
      {/* Iterative indicator */}
      {data.iterative && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full w-fit" style={{ backgroundColor: themeStyles.accentColor + '20' }}>
          <RefreshCw size={18} style={{ color: themeStyles.accentColor }} />
          <span className="font-medium" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>Iterative Process</span>
        </div>
      )}

      {/* Participants */}
      {data.participants.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            Participants
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {data.participants.map((p, i) => {
              const role = roles.find(r => r.id === p.roleId);
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
                  {role && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: role.color, color: role.textColor }}>
                      {role.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    {role && <p className="font-bold" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{role.name}</p>}
                    <p className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{p.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final action */}
      {data.finalActionTitle && data.finalItems && data.finalItems.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <h4 className="font-bold mb-3" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{data.finalActionTitle}</h4>
          <ul className="space-y-2">
            {data.finalItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                <Check size={16} style={{ color: themeStyles.accentColor }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Timeline Step Content
const TimelineStepContent: React.FC<{ step: Step & { type: 'timeline' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  if (data.entries.length === 0) return null;
  
  const allDates = data.entries.flatMap(e => [new Date(e.startDate).getTime(), new Date(e.endDate).getTime()]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const range = maxDate - minDate || 1;
  
  return (
    <div className="space-y-4">
      {data.entries.map((entry) => {
        const start = ((new Date(entry.startDate).getTime() - minDate) / range) * 100;
        const width = ((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / range) * 100;
        
        return (
          <div key={entry.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{entry.label}</span>
              <span className="text-sm" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{entry.startDate} - {entry.endDate}</span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: themeStyles.cardBg }}>
              <div className="h-full rounded-full" style={{ left: `${start}%`, width: `${Math.max(width, 5)}%`, backgroundColor: entry.color, marginLeft: `${start}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Risk Step Content
const RiskStepContent: React.FC<{ step: Step & { type: 'risk' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const severityConfig = {
    'low': { label: 'Low', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' },
    'medium': { label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
    'high': { label: 'High', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
    'critical': { label: 'Critical', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.3)' },
  };
  
  const severity = severityConfig[data.severity];
  
  return (
    <div className="space-y-6">
      {/* Severity badge */}
      <div className="flex items-center gap-3">
        <AlertTriangle size={24} style={{ color: severity.color }} />
        <span className="px-4 py-2 rounded-full font-bold" style={{ backgroundColor: severity.bg, color: severity.color, fontFamily: brand.fonts.body }}>
          {severity.label} Severity
        </span>
      </div>

      {/* Risks */}
      <div className="space-y-4">
        {data.risks.map((risk) => (
          <div key={risk.id} className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <p className="font-medium mb-2" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{risk.text}</p>
            {risk.mitigation && (
              <div className="flex items-start gap-2 mt-2 pt-2" style={{ borderTop: `1px solid ${themeStyles.cardBorder}` }}>
                <Check size={16} style={{ color: themeStyles.accentColor }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase tracking-wider" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>Mitigation: </span>
                  <span className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{risk.mitigation}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Metrics Step Content
const MetricsStepContent: React.FC<{ step: Step & { type: 'metrics' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.metrics.map((metric) => {
        const pct = metric.target ? Math.min((metric.value / metric.target) * 100, 100) : 0;
        
        return (
          <div key={metric.id} className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{metric.label}</span>
              {metric.format === 'badge' ? (
                <span className="px-3 py-1 rounded-full font-bold text-sm"
                  style={{
                    backgroundColor: pct >= 80 ? '#d1fae5' : pct >= 50 ? '#fef3c7' : '#fecaca',
                    color: pct >= 80 ? '#065f46' : pct >= 50 ? '#92400e' : '#991b1b',
                    fontFamily: brand.fonts.body
                  }}>
                  {metric.value} {metric.unit}
                </span>
              ) : (
                <span className="font-bold" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>
                  {metric.value}{metric.target ? `/${metric.target}` : ''} {metric.unit}
                </span>
              )}
            </div>
            {metric.format === 'progress' && metric.target && (
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: themeStyles.cardBorder }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Kanban Step Content
const KanbanStepContent: React.FC<{ step: Step & { type: 'kanban' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.columns.map((column) => (
        <div key={column.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <div className="p-3 font-bold text-center" style={{ backgroundColor: column.color + '40', color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
            {column.title} ({column.cards.length})
          </div>
          <div className="p-2 space-y-2">
            {column.cards.slice(0, 5).map((card) => (
              <div key={card.id} className="p-2 rounded-lg" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
                <p className="text-sm font-medium" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{card.title}</p>
                {card.assignee && (
                  <p className="text-xs mt-1" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>@{card.assignee}</p>
                )}
              </div>
            ))}
            {column.cards.length > 5 && (
              <p className="text-xs text-center py-1" style={{ color: themeStyles.metaColor }}>+{column.cards.length - 5} more</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// OKR Step Content
const OKRStepContent: React.FC<{ step: Step & { type: 'okr' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  roles,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  return (
    <div className="space-y-6">
      {data.objectives.map((obj) => (
        <div key={obj.id} className="p-4 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>{obj.title}</h4>
            {obj.owner && (
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: themeStyles.accentColor + '20', color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>
                {roles.find(r => r.id === obj.owner)?.name || obj.owner}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {obj.keyResults.map((kr) => {
              const progress = (kr.current / kr.target) * 100;
              return (
                <div key={kr.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{kr.text}</span>
                    <span className="text-sm font-bold" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>
                      {kr.current}/{kr.target} {kr.unit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: themeStyles.cardBorder }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: themeStyles.accentColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Sprint Step Content
const SprintStepContent: React.FC<{ step: Step & { type: 'sprint' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const statusGroups = {
    todo: data.stories.filter(s => s.status === 'todo'),
    in_progress: data.stories.filter(s => s.status === 'in_progress'),
    in_review: data.stories.filter(s => s.status === 'in_review'),
    done: data.stories.filter(s => s.status === 'done'),
  };
  
  return (
    <div className="space-y-6">
      {/* Sprint info */}
      <div className="flex items-center gap-6">
        <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: themeStyles.accentColor }}>
          <span className="font-bold" style={{ color: themeStyles.container.includes('bg-slate') || themeStyles.container.includes('bg-slate-950') ? '#000' : '#fff', fontFamily: brand.fonts.heading }}>
            {data.sprintName}
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
          <Calendar size={18} />
          <span>{data.startDate} - {data.endDate}</span>
        </div>
        <div className="flex items-center gap-2" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
          <Zap size={18} />
          <span>Target: {data.velocityTarget} pts</span>
        </div>
      </div>

      {/* Stories by status */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(statusGroups).map(([status, stories]) => (
          <div key={status} className="rounded-xl overflow-hidden" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <div className="p-2 text-center font-bold text-sm capitalize" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
              {status.replace('_', ' ')} ({stories.length})
            </div>
            <div className="p-2 space-y-2 max-h-32 overflow-y-auto">
              {stories.slice(0, 4).map((story) => (
                <div key={story.id} className="p-2 rounded-lg text-xs" style={{ backgroundColor: themeStyles.cardBg }}>
                  <p style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{story.title}</p>
                  <p style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{story.points} pts</p>
                </div>
              ))}
              {stories.length > 4 && (
                <p className="text-xs text-center" style={{ color: themeStyles.metaColor }}>+{stories.length - 4} more</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Roadmap Step Content
const RoadmapStepContent: React.FC<{ step: Step & { type: 'roadmap' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const statusColors: Record<string, string> = {
    'planned': '#94a3b8',
    'in_progress': '#3b82f6',
    'completed': '#22c55e',
    'cancelled': '#ef4444',
  };
  
  const typeIcons: Record<string, string> = {
    'feature': '🎯',
    'epic': '📦',
    'initiative': '🚀',
    'release': '🎉',
    'milestone': '🏁',
  };
  
  return (
    <div className="space-y-4">
      {/* Quarters header */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {data.quarters.map((q) => (
          <div key={q} className="text-center font-bold text-sm" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
            {q}
          </div>
        ))}
      </div>

      {/* Roadmap items */}
      {data.items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
          <div className="w-8 text-center text-lg">{typeIcons[item.type] || '📌'}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}>{item.title}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors[item.status] + '30', color: statusColors[item.status] }}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
            {item.description && (
              <p className="text-sm mt-1" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{item.description}</p>
            )}
          </div>
          <div className="text-sm font-medium" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{item.quarter}</div>
          {item.progress !== undefined && (
            <div className="w-16">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: themeStyles.cardBorder }}>
                <div className="h-full rounded-full" style={{ width: `${item.progress}%`, backgroundColor: themeStyles.accentColor }} />
              </div>
              <p className="text-xs text-center mt-1" style={{ color: themeStyles.metaColor }}>{item.progress}%</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Executive Step Content
const ExecutiveStepContent: React.FC<{ step: Step & { type: 'executive' }; roles: RoleDefinition[]; themeStyles: ThemeStyles; brand: BrandKit }> = ({
  step,
  themeStyles,
  brand
}) => {
  const { data } = step;
  
  const trendIcons = {
    'up': <TrendingUp size={16} className="text-green-400" />,
    'down': <TrendingDown size={16} className="text-red-400" />,
    'flat': <Minus size={16} className="text-slate-400" />,
  };
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      {data.summary && (
        <p className="text-lg" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>{data.summary}</p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {data.kpis.map((kpi) => (
          <div key={kpi.id} className="p-4 rounded-xl text-center" style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}>
            <p className="text-sm mb-2" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>{kpi.label}</p>
            <p className="text-3xl font-black mb-2" style={{ color: kpi.color || themeStyles.accentColor, fontFamily: brand.fonts.heading }}>{kpi.value}</p>
            {kpi.change && (
              <div className="flex items-center justify-center gap-2">
                {trendIcons[kpi.trend]}
                <span className={`text-sm font-medium ${
                  kpi.changeType === 'positive' ? 'text-green-400' :
                  kpi.changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deployment info */}
      {data.deploymentVersion && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="px-4 py-2 rounded-full font-medium" style={{ backgroundColor: themeStyles.cardBg, color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
            Version: {data.deploymentVersion}
          </span>
          {data.deploymentStatus && (
            <span className={`px-4 py-2 rounded-full font-bold ${
              data.deploymentStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
              data.deploymentStatus === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {data.deploymentStatus.charAt(0).toUpperCase() + data.deploymentStatus.slice(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Phase Slide with detailed step content ───────────────────────────────────

export const PhaseSlide: React.FC<SlideProps> = ({ slide, brand, themeStyles, roles }) => {
  const { phase } = slide;
  if (!phase) return null;

  return (
    <div className="flex flex-col justify-center h-full px-16">
      {/* Phase number badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}
        >
          Phase {(slide.phaseIndex || 0) + 1}
        </span>
      </div>

      <h2 className="text-5xl font-black leading-tight mb-4" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
        {phase.title}
      </h2>
      {phase.subtitle && (
        <p className="text-xl mb-8" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
          {phase.subtitle}
        </p>
      )}

      {/* Step cards with detailed content */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(phase.steps.length, 2)}, 1fr)` }}>
        {phase.steps.slice(0, 4).map((step) => {
          const IconComp = STEP_TYPE_ICONS_MAP[step.type] || Circle;
          return (
            <div
              key={step.id}
              className="rounded-xl p-4"
              style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <IconComp size={20} style={{ color: phase.backgroundColor }} />
                <div className="font-bold text-lg leading-tight" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
                  {step.title}
                </div>
              </div>
              {step.description && (
                <div className="text-sm mb-3 leading-snug" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                  {step.description.substring(0, 120)}{step.description.length > 120 ? '…' : ''}
                </div>
              )}
              {/* Show roles */}
              {step.roleIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {step.roleIds.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    if (!role) return null;
                    return (
                      <span key={roleId} className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: role.color, color: role.textColor }}>
                        {role.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {phase.steps.length > 4 && (
        <p className="text-sm mt-4 text-center" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
          +{phase.steps.length - 4} more steps
        </p>
      )}
    </div>
  );
};

// ─── Individual Step Slide with full detail ────────────────────────────────────

export const StepSlide: React.FC<SlideProps> = ({ slide, brand, themeStyles, roles }) => {
  const { step, phase } = slide;
  if (!step || !phase) return null;

  const IconComp = STEP_TYPE_ICONS_MAP[step.type] || Circle;
  
  return (
    <div className="flex flex-col justify-center h-full px-16">
      {/* Phase breadcrumb */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-1 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
        <span className="text-sm font-medium tracking-wider uppercase" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
          {phase.title}
        </span>
      </div>

      {/* Step title */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: phase.backgroundColor + '30' }}>
          <IconComp size={24} style={{ color: phase.backgroundColor }} />
        </div>
        <h2 className="text-4xl font-black leading-tight" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
          {step.title}
        </h2>
      </div>

      {/* Custom label */}
      {step.customLabel && (
        <div className="px-3 py-1 rounded-full w-fit mb-4" style={{ backgroundColor: themeStyles.accentColor + '20' }}>
          <span className="text-sm font-medium" style={{ color: themeStyles.accentColor, fontFamily: brand.fonts.body }}>{step.customLabel}</span>
        </div>
      )}

      {/* Description */}
      {step.description && (
        <p className="text-lg mb-6 max-w-3xl" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
          {step.description}
        </p>
      )}

      {/* Detailed step content */}
      <div className="max-w-4xl">
        <StepContentRenderer step={step} roles={roles} themeStyles={themeStyles} brand={brand} />
      </div>

      {/* Roles */}
      {step.roleIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {step.roleIds.map(roleId => {
            const role = roles.find(r => r.id === roleId);
            if (!role) return null;
            return (
              <span key={roleId} className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: role.color, color: role.textColor }}>
                {role.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ThankYouSlide: React.FC<SlideProps> = ({ brand, themeStyles }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-16">
    <div className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
      style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
      <span>✓</span>
    </div>
    <h1 className="text-6xl font-black mb-4" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
      Thank You
    </h1>
    {brand.tagline && (
      <p className="text-xl" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
        {brand.tagline}
      </p>
    )}
    <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: themeStyles.accentColor }} />
    {brand.companyName && (
      <p className="mt-4 text-sm font-semibold tracking-widest uppercase" style={{ color: themeStyles.metaColor }}>
        {brand.companyName}
      </p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export type TransitionType = 'slide' | 'fade' | 'zoom' | 'flip';

export const PresentationMode: React.FC<Props> = ({ onClose }) => {
  const phases = useInfographicStore((s) => s.phases);
  const roles = useInfographicStore((s) => s.roles);
  const titleBar = useInfographicStore((s) => s.titleBar);
  const { brand } = useBrandStore();
  const [current, setCurrent] = useState(0);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailOpen, setThumbnailOpen] = useState(true);
  const [transitionType] = useState<TransitionType>('slide');
  const containerRef = useRef<HTMLDivElement>(null);
  const infographicRef = useExportStore((s) => s.infographicRef);

  const slides = buildSlides(phases, titleBar, brand.companyName);
  const themeStyles = getThemeStyles(brand.presentationTheme, brand.colors.primary, brand.colors.secondary);

  const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleExportPDF = async () => {
    if (!infographicRef?.current) return;
    await exportInfographic(infographicRef.current, 'pdf');
  };

  const currentSlide = slides[current];

  const getModernGradient = () => {
    if (brand.presentationTheme === 'modern') {
      return `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})`;
    }
    return undefined;
  };

  const renderSlide = (slide: Slide) => {
    const props: SlideProps = { slide, brand, titleBar, phases, themeStyles, roles };
    switch (slide.type) {
      case 'cover': return <CoverSlide {...props} />;
      case 'agenda': return <AgendaSlide {...props} />;
      case 'phase': return <PhaseSlide {...props} />;
      case 'step': return <StepSlide {...props} />;
      case 'thankyou': return <ThankYouSlide {...props} />;
      default: return <PhaseSlide {...props} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {brand.logoBase64 ? (
            <img src={brand.logoBase64} alt="Logo" className="h-6 w-auto" />
          ) : (
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
              {(brand.companyName || 'P').charAt(0)}
            </div>
          )}
          <span className="text-white text-sm font-semibold">{brand.companyName || titleBar.text}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Slide counter */}
          <span className="text-slate-400 text-sm">{current + 1} / {slides.length}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setThumbnailOpen(t => !t)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
              title="Toggle slide panel"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen (F)"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Export PDF"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide thumbnails panel */}
        {thumbnailOpen && (
          <div className="w-40 bg-black/70 overflow-y-auto flex-shrink-0 py-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(i)}
                className={`w-full p-2 group transition-colors ${i === current ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div
                  className={`w-full aspect-video rounded-lg overflow-hidden border-2 mb-1 transition-colors ${i === current ? 'border-blue-400' : 'border-transparent group-hover:border-white/20'}`}
                  style={{ background: getModernGradient() || (brand.presentationTheme === 'dark' ? '#030712' : brand.presentationTheme === 'minimal' ? '#ffffff' : brand.presentationTheme === 'bold' ? '#facc15' : '#1e293b') }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <div className="text-xs font-bold text-center truncate w-full" style={{ color: themeStyles.titleColor, fontSize: '5px' }}>
                      {slide.title}
                    </div>
                    <div className="text-[4px] mt-0.5" style={{ color: themeStyles.metaColor }}>
                      {slide.type}
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 text-xs text-center">{i + 1}</div>
              </button>
            ))}
          </div>
        )}

        {/* Main slide */}
        <div className="flex-1 flex items-center justify-center p-4 slide-container">
          <div
            key={currentSlide.id}
            className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden ${themeStyles.container} ${transitionType}-enter-active`}
            style={{
              aspectRatio: '16/9',
              background: getModernGradient() || undefined,
              position: 'relative',
              animation: 'fadeIn 0.4s ease-out',
            }}
          >
            {renderSlide(currentSlide)}

            {/* Slide number watermark */}
            <div
              className="absolute bottom-4 right-6 text-xs font-semibold opacity-30"
              style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}
            >
              {current + 1}/{slides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 text-white hover:bg-white/10 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center max-w-md overflow-hidden">
          {slides.length > 20 ? (
            // Show abbreviated dots for many slides
            <>
              {slides.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="transition-all"
                  style={{
                    width: i === current ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: i === current ? brand.colors.primary : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
              {current > 4 && current < slides.length - 5 && (
                <>
                  <span className="text-slate-500 text-xs">...</span>
                  <button
                    onClick={() => setCurrent(current)}
                    className="transition-all"
                    style={{
                      width: '20px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: brand.colors.primary,
                    }}
                  />
                </>
              )}
              <span className="text-slate-500 text-xs">...</span>
              {slides.slice(-5).map((_, i) => (
                <button
                  key={slides.length - 5 + i}
                  onClick={() => setCurrent(slides.length - 5 + i)}
                  className="transition-all"
                  style={{
                    width: (slides.length - 5 + i) === current ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: (slides.length - 5 + i) === current ? brand.colors.primary : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </>
          ) : (
            slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all"
                style={{
                  width: i === current ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: i === current ? brand.colors.primary : 'rgba(255,255,255,0.3)',
                }}
              />
            ))
          )}
        </div>

        <button
          onClick={goNext}
          disabled={current === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 text-white hover:bg-white/10 disabled:hover:bg-transparent"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};