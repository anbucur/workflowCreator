import React from 'react';
import type { Step, RoleDefinition, MeetingData } from '../../types';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { StepContentRouter } from './step-content/StepContentRouter';
import { ConnectorHandle } from './ConnectorHandle';
import { STEP_TYPE_LABELS } from '../../types';
import { getContrastTextColor, getContrastMutedColor, isDarkBackground } from '../../utils/contrast';

// Global drag state for cross-phase card movement (shared with PhaseColumn)
declare global {
  interface Window {
    __draggedStepInfo: { stepId: string; sourcePhaseId: string; step: Step } | null;
  }
}

// Dynamically render lucide icons by name
import * as LucideIcons from 'lucide-react';

import type { LucideProps } from 'lucide-react';

function getIcon(name: string): React.ComponentType<LucideProps> | null {
  // Convert kebab-case to PascalCase
  const pascalName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascalName] || null;
}

interface StepCardProps {
  step: Step;
  phaseId: string;
  roles: RoleDefinition[];
  cornerRadius: number;
  cardBackground?: string;
  phaseColor?: string;
}

export const StepCard: React.FC<StepCardProps> = ({ step, phaseId, roles, cornerRadius, cardBackground, phaseColor }) => {
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const layout = useInfographicStore((s) => s.layout);

  const isSelected = selectedElement?.type === 'step' &&
    selectedElement.phaseId === phaseId &&
    selectedElement.stepId === step.id;

  const stepRoles = step.roleIds
    .map((rid) => roles.find((r) => r.id === rid))
    .filter(Boolean) as RoleDefinition[];

  const iconToRender = React.useMemo(() => getIcon(step.iconName), [step.iconName]);

  // Extract left-side footer pills per card type
  const footerLeft = React.useMemo(() => {
    if (step.type === 'meeting') {
      const { facilitator, duration } = (step as Step & { type: 'meeting'; data: MeetingData }).data;
      return (
        <div className="flex gap-1.5 flex-wrap items-center">
          {facilitator && (
            <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 shadow-sm">
              <span>👤</span> {facilitator}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-700 shadow-sm">
              <span>⏱</span> {duration}
            </span>
          )}
        </div>
      );
    }
    return null;
  }, [step]);

  const hasContent = React.useMemo(() => {
    if (step.type === 'standard') return false;
    if (step.type === 'milestone') {
      const msData = (step as any).data;
      if (msData.status === 'none' && !msData.targetDate && (!msData.deliverables || msData.deliverables.length === 0)) {
        return false;
      }
    }
    return true;
  }, [step]);

  const getShadowClass = (shadow: string) => {
    switch (shadow) {
      case 'none': return 'shadow-none';
      case 'soft': return 'shadow-sm shadow-slate-900/5';
      case 'medium': return 'shadow-md shadow-slate-900/10';
      case 'hard': return 'shadow-xl shadow-slate-900/20';
      case 'neon': return ''; // Handle via inline styles
      default: return 'shadow-sm shadow-slate-900/5';
    }
  };

  const shadowClass = getShadowClass(layout.cardShadow || 'soft');
  const showIcon = layout.showStepIcons ?? true;

  // Darken a hex colour by a fraction (0–1)
  const darkenColor = (hex: string, amount = 0.25): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `#${Math.round(r * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(g * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(b * (1 - amount)).toString(16).padStart(2, '0')}`;
  };

  // Compute the label badge background: match-phase uses a darkened phase colour
  const labelBg = layout.stepLabelMatchPhase
    ? darkenColor(phaseColor ?? layout.stepLabelColor ?? '#3c83f6', 0.25)
    : (layout.stepLabelColor ?? '#3c83f6');
  const labelFontFamily = layout.stepLabelFontFamily || `'Inter', sans-serif`;
  const labelFontSize = layout.stepLabelFontSize ?? 10;

  // Auto-contrast: compute text colours based on card background
  const effectiveBg = cardBackground ?? '#ffffff';
  let autoTextColor = getContrastTextColor(effectiveBg);
  let autoMutedColor = getContrastMutedColor(effectiveBg);

  if (layout.cardTextColorMode === 'high-contrast') {
    const isDark = isDarkBackground(effectiveBg);
    autoTextColor = isDark ? '#ffffff' : '#000000';
    autoMutedColor = isDark ? '#cccccc' : '#333333';
  } else if (layout.cardTextColorMode === 'custom') {
    autoTextColor = layout.cardTextColor ?? '#1a1a2e';
    autoMutedColor = layout.cardTextColor ?? '#1a1a2e'; // We'll just use the same for custom, or maybe 80% opacity in rendering.
  }

  const autoLabelTextColor = getContrastTextColor(labelBg);

  return (
    <div
      className={`glass h-fit flex flex-col p-3 cursor-pointer transition-all hover:-translate-y-0.5 relative group ${isSelected ? 'z-10' : ''} ${layout.cardShadow !== 'neon' ? shadowClass : ''}`}
      style={{
        borderRadius: `${Math.max(cornerRadius - 4, 4)}px`,
        backgroundColor: cardBackground ?? '#ffffff',
        borderStyle: layout.cardBorderStyle === 'none' ? 'hidden' : (layout.cardBorderStyle || 'solid'),
        borderWidth: layout.cardBorderStyle === 'none' ? '0px' : `${layout.cardBorderWidth || 1}px`,
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: layout.cardShadow === 'neon' ? `0 0 15px ${cardBackground ?? 'rgba(0,0,0,0.2)'}` : undefined,
        '--card-subtext-size': `${layout.cardSubtextFontSize ?? 15}px`,
        '--card-subtext-font': layout.cardSubtextFontFamily || layout.cardContentFontFamily || `'Inter', sans-serif`,
        '--card-subtext-color': layout.cardSubtextColor || autoMutedColor,
      } as React.CSSProperties}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'step', phaseId, stepId: step.id });
      }}
      data-selected={isSelected}
    >
      {/* Connector handles */}
      <ConnectorHandle stepId={step.id} position="top" />
      <ConnectorHandle stepId={step.id} position="bottom" />
      <ConnectorHandle stepId={step.id} position="left" />
      <ConnectorHandle stepId={step.id} position="right" />
      {/* Header row: type badge and icon */}
      <div className="flex justify-between items-start mb-2">
        {(step.type !== 'standard' || step.customLabel) ? (
          <span
            className="font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
            style={{
              backgroundColor: labelBg,
              color: layout.stepLabelTextColor || autoLabelTextColor,
              opacity: 0.9,
              fontFamily: labelFontFamily,
              fontSize: `${labelFontSize}px`,
            }}
          >
            {step.type !== 'standard' ? STEP_TYPE_LABELS[step.type] : step.customLabel}
          </span>
        ) : (
          <span className="opacity-0 w-0 h-0" />
        )}

        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {showIcon && iconToRender && React.createElement(iconToRender, { size: 20, style: { color: layout.stepIconColor || autoMutedColor } })}
        </div>
      </div>

      {/* Title block */}
      <h4
        className="font-bold leading-tight mb-1"
        style={{
          fontFamily: layout.cardTitleFontFamily || `'Inter', sans-serif`,
          fontSize: `${layout.cardTitleFontSize ?? 16}px`,
          color: layout.cardTitleColor || autoTextColor,
        }}
      >
        {step.title}
      </h4>
      <p
        className="leading-snug"
        style={{
          fontFamily: layout.cardContentFontFamily || `'Inter', sans-serif`,
          fontSize: `${layout.cardContentFontSize ?? 16}px`,
          color: layout.cardContentColor || autoMutedColor,
          opacity: (layout.cardContentColor || layout.cardTextColorMode === 'custom') ? 0.9 : 0.8,
        }}
      >
        {step.description}
      </p>

      {/* Type-specific content — full width */}
      {hasContent && (
        <div
          className="mt-2 pt-2 border-t border-slate-100"
          style={{
            fontFamily: layout.cardContentFontFamily || `'Inter', sans-serif`,
            color: layout.cardContentColor || autoMutedColor,
            opacity: (layout.cardContentColor || layout.cardTextColorMode === 'custom') ? 0.9 : 1,
          }}
        >
          <StepContentRouter step={step} roles={roles} />
        </div>
      )}

      {/* Footer row: left=type-specific pills, right=role badges */}
      {(footerLeft || stepRoles.length > 0) && (
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex-1">{footerLeft}</div>
          {stepRoles.length > 0 && (
            <div className="flex shrink-0">
              {stepRoles.map((role, i) => (
                <div
                  key={role.id}
                  className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 font-bold text-[8px] tracking-tighter"
                  style={{ backgroundColor: role.color, color: role.textColor || '#ffffff', zIndex: 10 - i, marginLeft: i > 0 ? '-6px' : '0' }}
                  title={role.name}
                >
                  {(role.tag || role.name.substring(0, 3)).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
