import React from 'react';
import type { Phase, RoleDefinition } from '../../types';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { StepCard } from './StepCard';
import { Plus } from 'lucide-react';

interface PhaseColumnProps {
  phase: Phase;
  roles: RoleDefinition[];
  stepGap: number;
  cornerRadius: number;
  phaseMinWidth: number;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phase,
  roles,
  stepGap,
  cornerRadius,
  phaseMinWidth,
}) => {
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addStep = useInfographicStore((s) => s.addStep);

  const isSelected = selectedElement?.type === 'phase' && selectedElement.phaseId === phase.id;

  return (
    <div
      className={`flex flex-col transition-all border-r border-slate-200 last:border-r-0 ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
      style={{
        minWidth: `${phaseMinWidth}px`,
        flex: 1,
      }}
      data-selection-ring={isSelected}
    >
      {/* Phase header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer border-b border-transparent hover:border-slate-200 transition-colors"
        style={{
          backgroundColor: phase.backgroundColor,
          color: phase.textColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement({ type: 'phase', phaseId: phase.id });
        }}
      >
        <div>
          <h2 className="font-bold text-[11px] uppercase tracking-wider leading-tight">{phase.title}</h2>
          <p className="text-[10px] opacity-80 mt-0.5">{phase.subtitle}</p>
        </div>
      </div>

      {/* Steps */}
      <div
        className="px-3 pb-3 flex-1 flex flex-col"
        style={{ gap: `${stepGap}px` }}
      >
        {phase.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            phaseId={phase.id}
            roles={roles}
            cornerRadius={cornerRadius}
          />
        ))}

        {/* Add step button */}
        <button
          className="editor-only flex items-center justify-center gap-1 text-[10px] opacity-40 hover:opacity-70 transition-opacity py-1.5 rounded border border-dashed border-current/30 hover:border-current/50"
          onClick={(e) => {
            e.stopPropagation();
            addStep(phase.id);
          }}
        >
          <Plus size={12} /> Add Step
        </button>
      </div>
    </div>
  );
};
