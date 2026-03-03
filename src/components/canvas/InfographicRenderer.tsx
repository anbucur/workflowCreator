import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { TitleBar } from './TitleBar';
import { PhaseColumn } from './PhaseColumn';
import { Plus } from 'lucide-react';

export const InfographicRenderer = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { roles, phases, layout } = useInfographicStore();
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addPhase = useInfographicStore((s) => s.addPhase);

  return (
    <div
      ref={ref}
      className="infographic-root shadow-2xl rounded-xl border border-slate-200 overflow-hidden bg-white"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        minWidth: `${phases.length * layout.phaseMinWidth}px`,
      }}
      onClick={() => setSelectedElement(null)}
    >
      <TitleBar />

      <div
        className="flex bg-slate-50 min-h-[600px]"
        style={{
          flexDirection: layout.direction === 'horizontal' ? 'row' : 'column',
        }}
      >
        {phases.map((phase) => (
          <PhaseColumn
            key={phase.id}
            phase={phase}
            roles={roles}
            stepGap={layout.stepGap}
            cornerRadius={layout.cornerRadius}
            phaseMinWidth={layout.phaseMinWidth}
          />
        ))}

        {/* Add phase button */}
        <button
          className="editor-only flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 border-l border-slate-200 px-6 shrink-0"
          style={{
            minWidth: '120px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            addPhase();
          }}
        >
          <Plus size={24} />
          <span className="text-xs font-bold uppercase tracking-tighter">Add Stage</span>
        </button>
      </div>
    </div>
  );
});

InfographicRenderer.displayName = 'InfographicRenderer';
