import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { TitleBar } from './TitleBar';
import { PhaseColumn } from './PhaseColumn';
import { Plus } from 'lucide-react';

export const InfographicRenderer = React.forwardRef<HTMLDivElement>((_, _outerRef) => {
  const { roles, phases, layout } = useInfographicStore();
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addPhase = useInfographicStore((s) => s.addPhase);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const resolvedRef = (_outerRef as React.RefObject<HTMLDivElement>) || innerRef;

  return (
    <div
      ref={resolvedRef}
      className="infographic-root w-full shadow-2xl rounded-xl border border-slate-200 overflow-hidden bg-white"
      style={{ display: 'flex', flexDirection: 'column' }}
      onClick={() => setSelectedElement(null)}
    >
      <TitleBar />

      {/* Phase columns — each phase takes equal share */}
      <div
        className="flex bg-slate-50 min-h-[600px] w-full"
        style={{ flexDirection: layout.direction === 'horizontal' ? 'row' : 'column' }}
      >
        {phases.map((phase, i) => (
          <PhaseColumn
            key={phase.id}
            phase={phase}
            roles={roles}
            stepGap={layout.stepGap}
            cornerRadius={layout.cornerRadius}
            phaseMinWidth={layout.phaseMinWidth}
            prevPhaseColor={phases[i - 1]?.backgroundColor}
            nextPhaseColor={phases[i + 1]?.backgroundColor}
          />
        ))}
      </div>

      {/* Add Phase footer bar — hidden during export via .exporting .editor-only */}
      <button
        className="editor-only flex items-center justify-center gap-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 border-t border-slate-200 py-3 w-full shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          addPhase();
        }}
      >
        <Plus size={16} />
        <span className="text-xs font-bold uppercase tracking-tighter">Add Phase</span>
      </button>
    </div>
  );
});

InfographicRenderer.displayName = 'InfographicRenderer';
