import React from 'react';
import type { Step, RoleDefinition } from '../../types';
import { useUiStore } from '../../store/useUiStore';
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
}

export const StepCard: React.FC<StepCardProps> = ({ step, phaseId, roles, cornerRadius }) => {
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);

  const isSelected = selectedElement?.type === 'step' &&
    selectedElement.phaseId === phaseId &&
    selectedElement.stepId === step.id;

  const stepRoles = step.roleIds
    .map((rid) => roles.find((r) => r.id === rid))
    .filter(Boolean) as RoleDefinition[];

  const iconToRender = React.useMemo(() => getIcon(step.iconName), [step.iconName]);

  return (
    <div
      className={`glass p-3 cursor-pointer transition-all hover:shadow-md border border-white/50 shadow-sm ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
      style={{ borderRadius: `${Math.max(cornerRadius - 4, 4)}px` }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'step', phaseId, stepId: step.id });
      }}
      data-selection-ring={isSelected}
    >
      {/* Header row: type badge and icon */}
      <div className="flex justify-between items-start mb-2">
        {step.type !== 'standard' ? (
          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
            {STEP_TYPE_LABELS[step.type]}
          </span>
        ) : (
          <span className="opacity-0 w-0 h-0" /> // spacer if no badge to keep layout aligned
        )}

        {iconToRender && (
          <span className="text-slate-400">
            {React.createElement(iconToRender as any, { size: 14 })}
          </span>
        )}
      </div>

      {/* Title block */}
      <h4 className="font-bold text-[11px] leading-tight text-slate-900 mb-1">{step.title}</h4>
      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{step.description}</p>
      {/* Role badges (Overlap styling matching Stitch) */}
      {stepRoles.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-1">
            {stepRoles.map((role) => (
              <div
                key={role.id}
                className="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: role.color }}
                title={role.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Type-specific content */}
      <div className="mt-2 text-slate-700">
        <StepContentRouter step={step} roles={roles} />
      </div>
    </div>
  );
};
