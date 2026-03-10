import React from 'react';
import type { Phase, Step } from '../../types';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useDroppable } from '@dnd-kit/core';
import { useUiStore } from '../../store/useUiStore';
import { DraggableStepCard } from './DraggableStepCard';
import { Plus } from 'lucide-react';

/** Linearly interpolate a hex colour toward white. ratio=0 → white, ratio=1 → full hex colour. */
function hexMix(hex: string, ratio: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(255 + (c - 255) * ratio);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function rgbBlend(a: string, b: string, t: number): string {
  const parse = (s: string): [number, number, number] => {
    const m = s.match(/\d+/g) ?? ['255', '255', '255'];
    return [+m[0], +m[1], +m[2]];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

/** Group flat steps array into rows for 2-column rendering.
 *  A step with gridCol === 1 is always paired with the step immediately before it. */
export function groupStepsIntoRows(steps: Step[]): Array<{ left: Step; right?: Step }> {
  const rows: Array<{ left: Step; right?: Step }> = [];
  let i = 0;
  while (i < steps.length) {
    const left = steps[i];
    const next = steps[i + 1];
    if (next?.gridCol === 1) {
      rows.push({ left, right: next });
      i += 2;
    } else {
      rows.push({ left });
      i++;
    }
  }
  return rows;
}

export type DropPlacement = 'before' | 'after' | 'left-of' | 'right-of';
export interface DropTarget {
  phaseId: string;
  stepIndex: number;
  placement: DropPlacement;
}

interface PhaseColumnProps {
  phase: Phase;
  prevPhaseColor?: string;
  nextPhaseColor?: string;
  dropTarget: DropTarget | null;
}

const DropLine: React.FC = () => (
  <div className="relative flex items-center py-0.5 pointer-events-none">
    <div className="h-0.5 w-full rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
  </div>
);

const ColumnPlaceholder: React.FC = () => (
  <div
    className="flex-1 min-w-0 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/60"
    style={{ minHeight: 60 }}
  />
);

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phase,
  prevPhaseColor,
  nextPhaseColor,
  dropTarget,
}) => {
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addStep = useInfographicStore((s) => s.addStep);
  const layout = useInfographicStore((s) => s.layout);
  
  // Read these directly from store instead of prop drilling
  const stepGap = useInfographicStore((s) => s.layout.stepGap);
  const phaseMinWidth = useInfographicStore((s) => s.layout.phaseMinWidth);
  
  const { phaseTintOpacity, cardTintOpacity, phaseTransitionSharpness } = layout;

  const cardBackground = hexMix(phase.backgroundColor, cardTintOpacity / 100);

  const blendHalf = (100 - phaseTransitionSharpness) / 2;
  const leftIn = `${blendHalf.toFixed(1)}%`;
  const rightOut = `${(100 - blendHalf).toFixed(1)}%`;

  const phaseGradient = (tintRatio: number): string | undefined => {
    if (!phase.backgroundColor) return undefined;
    const tint = (hex: string) => hexMix(hex, tintRatio);
    const curC = tint(phase.backgroundColor);
    const prevC = prevPhaseColor ? tint(prevPhaseColor) : curC;
    const nextC = nextPhaseColor ? tint(nextPhaseColor) : curC;
    const leftEdge = prevPhaseColor ? rgbBlend(prevC, curC, 0.5) : curC;
    const rightEdge = nextPhaseColor ? rgbBlend(curC, nextC, 0.5) : curC;
    return `linear-gradient(to right, ${leftEdge} 0%, ${curC} ${leftIn}, ${curC} ${rightOut}, ${rightEdge} 100%)`;
  };

  const getPatternStyle = (pattern: string): React.CSSProperties => {
    const c = 'rgba(0,0,0,0.07)';
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(${c} 1.5px, transparent 1.5px)`,
          backgroundSize: '14px 14px',
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        };
      case 'diagonal':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px',
        };
      default:
        return {};
    }
  };

  const patternStyle = getPatternStyle(layout.phaseBackgroundPattern || 'none');
  const isSelected = selectedElement?.type === 'phase' && selectedElement.phaseId === phase.id;

  // Droppable zone for cross-phase drops into this phase
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `phase-${phase.id}` });

  const rows = groupStepsIntoRows(phase.steps);

  return (
    <div
      className={`flex flex-col transition-all flex-1 min-w-0 ${isSelected ? 'z-10' : ''}`}
      style={{
        minWidth: `${phaseMinWidth}px`,
        '--phase-color': phase.backgroundColor,
      } as React.CSSProperties}
      data-phase-id={phase.id}
      data-selected={isSelected}
    >
      {/* Phase header */}
      <div
        className="p-3 flex flex-col items-center justify-center cursor-pointer border-b border-transparent hover:border-slate-200 transition-colors shrink-0 h-[72px] text-center"
        style={{
          background: phaseGradient(1),
          color: layout.useGlobalPhaseTextColor ? layout.globalPhaseTextColor : phase.textColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement({ type: 'phase', phaseId: phase.id });
        }}
      >
        <h2
          className="font-bold uppercase tracking-wider leading-tight w-full text-center"
          style={{
            fontSize: layout.phaseTitleFontSize ? `${layout.phaseTitleFontSize}px` : '15px',
            fontFamily: layout.phaseTitleFontFamily || `'Inter', sans-serif`,
            color: layout.useGlobalPhaseTextColor ? layout.globalPhaseTextColor : layout.phaseTitleColor,
          }}
        >
          {phase.title}
        </h2>
        <p
          className="opacity-80 mt-0.5 line-clamp-2 text-center"
          style={{
            fontSize: layout.phaseSubtitleFontSize ? `${layout.phaseSubtitleFontSize}px` : '15px',
            fontFamily: layout.phaseSubtitleFontFamily || `'Inter', sans-serif`,
            color: layout.useGlobalPhaseTextColor ? layout.globalPhaseTextColor : layout.phaseSubtitleColor,
          }}
        >
          {phase.subtitle}
        </p>
      </div>

      {/* Steps area */}
      <div
        ref={setDropRef}
        className={`p-3 pb-6 flex-1 flex flex-col relative transition-all ${isOver ? 'ring-2 ring-inset ring-blue-300' : ''}`}
        style={{ background: phaseGradient(phaseTintOpacity / 100), gap: stepGap }}
      >
        {/* Pattern overlay */}
        {layout.phaseBackgroundPattern && layout.phaseBackgroundPattern !== 'none' && (
          <div className="absolute inset-0 pointer-events-none" style={patternStyle} />
        )}

        {/* Rows of cards */}
        {rows.map((row) => {
          const leftIdx = phase.steps.findIndex((s) => s.id === row.left.id);
          const rightIdx = row.right ? phase.steps.findIndex((s) => s.id === row.right!.id) : -1;

          const isThisPhase = dropTarget?.phaseId === phase.id;
          const showBefore = isThisPhase && dropTarget!.placement === 'before' && dropTarget!.stepIndex === leftIdx;
          const showAfter = isThisPhase && dropTarget!.placement === 'after' &&
            (dropTarget!.stepIndex === leftIdx || (rightIdx >= 0 && dropTarget!.stepIndex === rightIdx));
          const showLeftOf = isThisPhase && dropTarget!.placement === 'left-of' && dropTarget!.stepIndex === leftIdx;
          const showRightOf = isThisPhase && dropTarget!.placement === 'right-of' && dropTarget!.stepIndex === leftIdx;

          return (
            <React.Fragment key={row.left.id}>
              {showBefore && <DropLine />}

              <div className="flex" style={{ gap: stepGap }}>
                {/* Ghost placeholder on the LEFT side when dropping left-of this card */}
                {showLeftOf && <ColumnPlaceholder />}

                {/* Left (or full-width) card */}
                <div className="flex-1 min-w-0">
                  <DraggableStepCard
                    step={row.left}
                    phaseId={phase.id}
                    cardBackground={cardBackground}
                    phaseColor={phase.backgroundColor}
                  />
                </div>

                {/* Right card of a pair */}
                {row.right && (
                  <div className="flex-1 min-w-0">
                    <DraggableStepCard
                      step={row.right}
                      phaseId={phase.id}
                      cardBackground={cardBackground}
                      phaseColor={phase.backgroundColor}
                    />
                  </div>
                )}

                {/* Ghost placeholder on the RIGHT side when dropping right-of this card */}
                {showRightOf && <ColumnPlaceholder />}
              </div>

              {showAfter && <DropLine />}
            </React.Fragment>
          );
        })}

        {/* Empty phase drop indicator */}
        {phase.steps.length === 0 && dropTarget?.phaseId === phase.id && (
          <div className="h-16 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/60 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-blue-400 font-medium">Drop here</span>
          </div>
        )}

        {/* Add step button */}
        <button
          className="editor-only flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-200 opacity-50 hover:opacity-100 hover:border-primary transition-all group mt-2 w-full shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            addStep(phase.id);
          }}
        >
          <Plus size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
          <span className="text-[9px] text-slate-400 group-hover:text-primary font-bold uppercase tracking-tighter mt-1">
            Add Step
          </span>
        </button>
      </div>
    </div>
  );
};
