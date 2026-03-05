
import React from 'react';
import type { Phase, RoleDefinition } from '../../types';
import { useInfographicStore } from '../../store/useInfographicStore';
import { WidthProvider, ReactGridLayout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useUiStore } from '../../store/useUiStore';
import { StepCard } from './StepCard';
import { Plus } from 'lucide-react';

const GridLayout = WidthProvider(ReactGridLayout);

// Fine-grained grid: 8px rows, 8px margins → slots fit content tightly
const ROW_HEIGHT = 8;
const GRID_MARGIN = 8;

function pxToH(px: number): number {
  return Math.max(1, Math.ceil((px + GRID_MARGIN) / (ROW_HEIGHT + GRID_MARGIN)));
}

/** Linearly interpolate a hex colour toward white. ratio=0 → white, ratio=1 → full hex colour. */
function hexMix(hex: string, ratio: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(255 + (c - 255) * ratio);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/**
 * Blend two RGB/hex colour strings at ratio t (0=a, 1=b).
 * Works on 'rgb(...)' strings returned by hexMix as well as '#rrggbb'.
 */
function rgbBlend(a: string, b: string, t: number): string {
  const parse = (s: string): [number, number, number] => {
    const m = s.match(/\d+/g) ?? ['255', '255', '255'];
    return [+m[0], +m[1], +m[2]];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

interface CardWrapperProps {
  step: Phase['steps'][number];
  phaseId: string;
  roles: RoleDefinition[];
  cornerRadius: number;
  cardBackground?: string;
  phaseColor?: string;
}

/**
 * Wraps a StepCard and uses ResizeObserver to keep the grid slot h tightly
 * matched to actual rendered card height — eliminating empty space at the bottom.
 */
const CardWrapper: React.FC<CardWrapperProps> = ({ step, phaseId, roles, cornerRadius, cardBackground, phaseColor }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const stepRef = React.useRef(step);
  // Track last-sent h via ref to prevent rapid-fire store updates
  const sentH = React.useRef<number>(step.gridLayout?.h ?? 10);

  React.useEffect(() => {
    stepRef.current = step;
  }, [step]);

  React.useEffect(() => {
    sentH.current = step.gridLayout?.h ?? 10;
  }, [step.gridLayout?.h]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const measured = entries[0].contentRect.height;
      if (measured < 10) return; // skip tiny/initial measurements
      const newH = pxToH(measured);
      if (newH !== sentH.current) {
        sentH.current = newH; // optimistic update — prevents duplicate writes
        const currentStep = stepRef.current;
        useInfographicStore.getState().updateStep(phaseId, currentStep.id, {
          gridLayout: {
            x: currentStep.gridLayout?.x ?? 0,
            y: currentStep.gridLayout?.y ?? 0,
            w: currentStep.gridLayout?.w ?? 12,
            h: newH,
          },
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [step.id, phaseId]); // only re-create when identity changes

  return (
    <div ref={ref} className="w-full">
      <StepCard step={step} phaseId={phaseId} roles={roles} cornerRadius={cornerRadius} cardBackground={cardBackground} phaseColor={phaseColor} />
    </div>
  );
};

interface PhaseColumnProps {
  phase: Phase;
  roles: RoleDefinition[];
  stepGap: number;
  cornerRadius: number;
  phaseMinWidth: number;
  prevPhaseColor?: string;
  nextPhaseColor?: string;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phase,
  roles,
  cornerRadius,
  phaseMinWidth,
  prevPhaseColor,
  nextPhaseColor,
}) => {
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addStep = useInfographicStore((s) => s.addStep);
  const layout = useInfographicStore((s) => s.layout);
  const { phaseTintOpacity, cardTintOpacity, phaseTransitionSharpness, phaseTitleFontSize, phaseSubtitleFontSize } = layout;

  // White → phase colour interpolation for cards
  const cardBackground = hexMix(phase.backgroundColor, cardTintOpacity / 100);

  // Symmetric 4-stop gradient centred at the column boundary.
  // ALL colour stops are computed as solid RGB (not hex+opacity) so that both
  // sides of every boundary render the exact same midpoint colour, eliminating
  // the pixel-seam artefact that opacity-blending across separate divs causes.
  const blendHalf = (100 - phaseTransitionSharpness) / 2;
  const leftIn = `${blendHalf.toFixed(1)}%`;
  const rightOut = `${(100 - blendHalf).toFixed(1)}%`;

  /**
   * tintRatio: 1.0 → fully saturated phase colour (header), phaseTintOpacity/100 → card area tint.
   * Boundary stops = 50% RGB blend of the two neighbours, so columns agree exactly.
   */
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

  // Phase background pattern CSS
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
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const layoutItems = phase.steps.map((step) => {
    const gl = step.gridLayout || { x: 0, y: 9999, w: 12, h: 10 };
    return { ...gl, x: Math.round(gl.x / 12) * 12, w: 12 };
  });

  const maxRightEdge = Math.max(12, ...layoutItems.map((l) => l.x + l.w));
  const activeBlocks = Math.ceil(maxRightEdge / 12);
  const totalBlocks = isDragging ? activeBlocks + 1 : activeBlocks;
  const currentCols = Math.max(12, totalBlocks * 12);
  const currentWidth = Math.max(phaseMinWidth, totalBlocks * phaseMinWidth);

  return (
    <div
      className={`flex flex-col transition-all flex-1 min-w-0 ${isSelected ? 'selection-ring z-10' : ''}`}
      style={{
        minWidth: `${currentWidth}px`,
        '--phase-color': phase.backgroundColor
      } as React.CSSProperties}
      data-selection-ring={isSelected}
    >
      {/* Phase header — centered */}
      <div
        className="p-3 flex flex-col items-center justify-center cursor-pointer border-b border-transparent hover:border-slate-200 transition-colors shrink-0 h-[72px] text-center"
        style={{
          background: phaseGradient(1),
          color: phase.textColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement({ type: 'phase', phaseId: phase.id });
        }}
      >
        <h2
          className="font-bold uppercase tracking-wider leading-tight w-full text-center"
          style={{
            fontSize: layout.phaseTitleFontSize ? `${layout.phaseTitleFontSize}px` : '11px',
            fontFamily: layout.phaseTitleFontFamily || `'Inter', sans-serif`
          }}
        >
          {phase.title}
        </h2>
        <p
          className="opacity-80 mt-0.5 line-clamp-2 text-center"
          style={{
            fontSize: layout.phaseSubtitleFontSize ? `${layout.phaseSubtitleFontSize}px` : '10px',
            fontFamily: layout.phaseSubtitleFontFamily || `'Inter', sans-serif`
          }}
        >
          {phase.subtitle}
        </p>
      </div>

      {/* Steps grid — always react-grid-layout so all phases support side-by-side dragging */}
      <div
        className="p-3 pb-6 flex-1 flex flex-col relative"
        style={{ background: phaseGradient(phaseTintOpacity / 100) }}
      >
        {/* Pattern overlay */}
        {layout.phaseBackgroundPattern && layout.phaseBackgroundPattern !== 'none' && (
          <div className="absolute inset-0 pointer-events-none" style={patternStyle} />
        )}
        <GridLayout
          className="layout"
          layout={phase.steps.map((step) => {
            const gl = step.gridLayout || { x: 0, y: 9999, w: 12, h: 10 };
            return { i: step.id, ...gl, w: 12, x: Math.round(gl.x / 12) * 12 };
          })}
          cols={currentCols}
          rowHeight={ROW_HEIGHT}
          margin={[GRID_MARGIN, GRID_MARGIN]}
          onLayoutChange={(layout: any) => {
            layout.forEach((item: any) => {
              const step = phase.steps.find((s: any) => s.id === item.i);
              const fixedW = 12;
              const fixedX = Math.round(item.x / 12) * 12;
              if (
                step &&
                (!step.gridLayout ||
                  step.gridLayout.x !== fixedX ||
                  step.gridLayout.y !== item.y ||
                  step.gridLayout.w !== fixedW)
                // NOTE: we intentionally skip h here — CardWrapper owns h via ResizeObserver
              ) {
                useInfographicStore.getState().updateStep(phase.id, item.i, {
                  gridLayout: { x: fixedX, y: item.y, w: fixedW, h: step.gridLayout?.h ?? 10 },
                });
              }
            });
          }}
          onDragStart={() => {
            // Delay drag state so a simple click doesn't instantly resize the columns
            dragStartTimer.current = setTimeout(() => {
              setIsDragging(true);
              useUiStore.getState().setIsDraggingCard(true);
            }, 100);
          }}
          onDragStop={(_layout: any, _oldItem: any, newItem: any, _placeholder: any, e: Event, _element: any) => {
            if (dragStartTimer.current) {
              clearTimeout(dragStartTimer.current);
              dragStartTimer.current = null;
            }
            setIsDragging(false);
            useUiStore.getState().setIsDraggingCard(false);

            let clientY = 0;
            const event = e as unknown as MouseEvent | TouchEvent;
            if ('clientY' in event) clientY = event.clientY;
            else if ('changedTouches' in event && event.changedTouches.length > 0)
              clientY = event.changedTouches[0].clientY;

            if (clientY > 0 && clientY > window.innerHeight - 150) {
              useInfographicStore.getState().removeStep(phase.id, newItem.i);
            }
          }}
          compactType="vertical"
          isResizable={false}
          isDroppable={false}
        >
          {phase.steps.map((step) => {
            const gl = step.gridLayout || { x: 0, y: 9999, w: 12, h: 10 };
            const gridProps = { ...gl, w: 12, x: Math.round(gl.x / 12) * 12 };
            return (
              <div key={step.id} data-grid={gridProps}>
                <CardWrapper
                  step={step}
                  phaseId={phase.id}
                  roles={roles}
                  cornerRadius={cornerRadius}
                  cardBackground={cardBackground}
                  phaseColor={phase.backgroundColor}
                />
              </div>
            );
          })}
        </GridLayout>

        {/* Add step — hidden during export via .editor-only */}
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
