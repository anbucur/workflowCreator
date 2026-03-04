import React from 'react';
import type { Step, RoleDefinition, MeetingData } from '../../types';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import { StepContentRouter } from './step-content/StepContentRouter';
import { STEP_TYPE_LABELS } from '../../types';

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
}

export const StepCard: React.FC<StepCardProps> = ({ step, phaseId, roles, cornerRadius, cardBackground }) => {
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

  return (
    <div
      className={`glass h-fit flex flex-col p-3 cursor-pointer transition-all hover:shadow-md border border-white/50 shadow-sm relative group ${isSelected ? 'selection-ring z-10' : ''}`}
      style={{
        borderRadius: `${Math.max(cornerRadius - 4, 4)}px`,
        backgroundColor: cardBackground ?? '#ffffff',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'step', phaseId, stepId: step.id });
      }}
      data-selection-ring={isSelected}
    >
      {/* Header row: type badge and icon */}
      <div className="flex justify-between items-start mb-2">
        {step.type !== 'standard' ? (
          <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">
            {STEP_TYPE_LABELS[step.type]}
          </span>
        ) : (
          <span className="opacity-0 w-0 h-0" /> // spacer if no badge to keep layout aligned
        )}

        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {iconToRender && React.createElement(iconToRender, { size: 18, className: "text-slate-700" })}
        </div>
      </div>

      {/* Title block */}
      <h4
        className="font-bold text-xs leading-tight text-slate-800 mb-1"
        style={{ fontFamily: layout.cardTitleFontFamily || `'Inter', sans-serif` }}
      >
        {step.title}
      </h4>
      <p
        className="text-[11px] text-slate-600 leading-snug"
        style={{ fontFamily: layout.cardContentFontFamily || `'Inter', sans-serif` }}
      >
        {step.description}
      </p>

      {/* Type-specific content — full width */}
      {hasContent && (
        <div
          className="mt-3 pt-3 border-t border-slate-100 text-slate-600"
          style={{ fontFamily: layout.cardContentFontFamily || `'Inter', sans-serif` }}
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
                  {role.name.substring(0, 3).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
