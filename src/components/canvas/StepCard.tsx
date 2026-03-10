import React, { useState, memo } from 'react';
import type { Step, RoleDefinition, MeetingData } from '../../types';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useAiChatStore } from '../../store/useAiChatStore';
import { StepContentRouter } from './step-content/StepContentRouter';
import { ConnectorHandle } from './ConnectorHandle';
import { STEP_TYPE_LABELS } from '../../types';
import { getContrastTextColor, getContrastMutedColor, isDarkBackground } from '../../utils/contrast';
import { darkenColor, getShadowClass, adjustColor } from '../../utils/colors';
import { getIcon } from '../../utils/icons';
import { CardContextMenu } from '../shared/CardContextMenu';
import { AiEditInputDialog } from '../shared/AiEditInputDialog';

interface StepCardProps {
  step: Step;
  phaseId: string;
  cardBackground?: string;
  phaseColor?: string;
}

export const StepCard: React.FC<StepCardProps> = memo(({ step, phaseId, cardBackground, phaseColor }) => {
  // Read roles and cornerRadius directly from store instead of prop drilling
  const roles = useInfographicStore((s) => s.roles);
  const cornerRadius = useInfographicStore((s) => s.layout.cornerRadius);
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const layout = useInfographicStore((s) => s.layout);
  const setAiEditContext = useAiChatStore((s) => s.setAiEditContext);
  const setAiPanelOpen = useUiStore((s) => s.setAiPanelOpen);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showAiEditDialog, setShowAiEditDialog] = useState(false);

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

  const shadowClass = getShadowClass(layout.cardShadow || 'soft');
  const showIcon = layout.showStepIcons ?? true;

  // Compute the label badge background: match-phase uses phase colour with adjustable brightness/saturation
  const labelBg = layout.stepLabelMatchPhase
    ? adjustColor(
        phaseColor ?? layout.stepLabelColor ?? '#3c83f6',
        layout.stepLabelPhaseBrightness ?? -25,
        layout.stepLabelPhaseSaturation ?? 0
      )
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

  // Compute step icon color based on mode
  const stepIconColor = React.useMemo(() => {
    const mode = layout.stepIconColorMode || 'phase-match';
    const basePhaseColor = phaseColor || '#3b82f6';
    
    switch (mode) {
      case 'phase-match':
        return darkenColor(basePhaseColor, 0.2);
      case 'phase-lighter':
        return basePhaseColor;
      case 'phase-darker':
        return darkenColor(basePhaseColor, 0.4);
      case 'custom':
        return layout.stepIconColor || '#3b82f6';
      default:
        return darkenColor(basePhaseColor, 0.2);
    }
  }, [layout.stepIconColorMode, layout.stepIconColor, phaseColor]);

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Handle "Edit with AI" from context menu
  const handleEditWithAi = () => {
    setShowAiEditDialog(true);
  };

  // Handle submit from AI edit dialog
  const handleAiEditSubmit = (stepId: string, phaseId: string, prompt: string) => {
    setAiEditContext({
      stepId,
      phaseId,
      stepTitle: step.title,
      userPrompt: prompt,
    });
    setAiPanelOpen(true);
  };

  return (
    <>
      {/* Context Menu */}
      {contextMenu && (
        <CardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          stepId={step.id}
          phaseId={phaseId}
          stepTitle={step.title}
          onEditWithAi={handleEditWithAi}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* AI Edit Dialog */}
      <AiEditInputDialog
        isOpen={showAiEditDialog}
        stepTitle={step.title}
        stepId={step.id}
        phaseId={phaseId}
        onSubmit={handleAiEditSubmit}
        onClose={() => setShowAiEditDialog(false)}
      />

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
      onContextMenu={handleContextMenu}
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
            className="font-bold px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap"
            style={{
              backgroundColor: labelBg,
              color: layout.stepLabelTextColor || autoLabelTextColor,
              opacity: 0.9,
              fontFamily: labelFontFamily,
              fontSize: `${labelFontSize}px`,
            }}
          >
            {step.customLabel || STEP_TYPE_LABELS[step.type]}
          </span>
        ) : (
          <span className="opacity-0 w-0 h-0" />
        )}

        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {showIcon && iconToRender && React.createElement(iconToRender, { size: 20, style: { color: stepIconColor } })}
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
    </>
  );
});