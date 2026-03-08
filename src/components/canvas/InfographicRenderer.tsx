import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import { TitleBar } from './TitleBar';
import { PhaseColumn, hexMix } from './PhaseColumn';
import type { DropTarget } from './PhaseColumn';
import { Plus } from 'lucide-react';
import { ConnectorOverlay } from './ConnectorOverlay';
import { StepCard } from './StepCard';
import type { Step } from '../../types';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from '@dnd-kit/core';

/** Returns true if the step at `index` is a full-width card (not part of a pair). */
function isFullWidthStep(steps: Step[], index: number): boolean {
  const step = steps[index];
  if (!step) return false;
  if (step.gridCol === 1) return false;           // right card → not full-width
  if (steps[index + 1]?.gridCol === 1) return false; // already has a right partner
  return true;
}

export const InfographicRenderer = React.forwardRef<HTMLDivElement>((_, _outerRef) => {
  const { roles, phases, layout } = useInfographicStore();
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);
  const addPhase = useInfographicStore((s) => s.addPhase);
  const removeStep = useInfographicStore((s) => s.removeStep);
  const moveStep = useInfographicStore((s) => s.moveStep);

  const innerRef = React.useRef<HTMLDivElement>(null);
  const resolvedRef = (_outerRef as React.RefObject<HTMLDivElement>) || innerRef;

  // Track pointer position throughout drag for drop-target computation
  const pointerPos = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    const handler = (e: PointerEvent) => {
      pointerPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  // Active drag state
  const [activeStep, setActiveStep] = React.useState<Step | null>(null);
  const [activePhaseId, setActivePhaseId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);
  const [overlayWidth, setOverlayWidth] = React.useState<number>(280);

  // dnd-kit sensor: 8px movement required to start drag (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /** Compute where a card would be dropped given the current pointer position. */
  const computeDropTarget = React.useCallback(
    (clientX: number, clientY: number, draggedStepId: string): DropTarget | null => {
      // Bottom 150px = delete zone, no drop target
      if (clientY > window.innerHeight - 150) return null;

      for (const phase of phases) {
        const phaseEl = document.querySelector<HTMLElement>(`[data-phase-id="${phase.id}"]`);
        if (!phaseEl) continue;
        const phaseRect = phaseEl.getBoundingClientRect();

        if (
          clientX >= phaseRect.left &&
          clientX <= phaseRect.right &&
          clientY >= phaseRect.top &&
          clientY <= phaseRect.bottom
        ) {
          if (phase.steps.length === 0) {
            return { phaseId: phase.id, stepIndex: 0, placement: 'before' };
          }

          // Find the step whose card the pointer is closest to (by Y centre)
          let closestStep: Step | null = null;
          let closestRect: DOMRect | null = null;
          let closestDistY = Infinity;

          for (const step of phase.steps) {
            if (step.id === draggedStepId) continue; // skip self
            const el = document.querySelector<HTMLElement>(`[data-step-id="${step.id}"]`);
            if (!el) continue;
            const rect = el.getBoundingClientRect();

            // Pointer inside card vertically → perfect match
            if (clientY >= rect.top && clientY <= rect.bottom) {
              closestStep = step;
              closestRect = rect;
              closestDistY = 0;
              break;
            }

            const distY = Math.min(
              Math.abs(clientY - rect.top),
              Math.abs(clientY - rect.bottom)
            );
            if (distY < closestDistY) {
              closestDistY = distY;
              closestStep = step;
              closestRect = rect;
            }
          }

          if (!closestStep || !closestRect) {
            // Pointer below all cards → append after last
            const lastIdx = phase.steps.length - 1;
            return { phaseId: phase.id, stepIndex: lastIdx, placement: 'after' };
          }

          const stepIndex = phase.steps.findIndex((st) => st.id === closestStep!.id);
          const centerY = closestRect.top + closestRect.height / 2;
          const relX = (clientX - closestRect.left) / closestRect.width; // 0–1

          // Left/right zones (outer 30%) only apply to full-width cards that the dragged
          // card is NOT already forming a pair with
          const fullWidth = isFullWidthStep(phase.steps, stepIndex);

          if (fullWidth && relX < 0.30) {
            return { phaseId: phase.id, stepIndex, placement: 'left-of' };
          }
          if (fullWidth && relX > 0.70) {
            return { phaseId: phase.id, stepIndex, placement: 'right-of' };
          }

          // Middle zone: before/after based on vertical position
          if (clientY < centerY) {
            return { phaseId: phase.id, stepIndex, placement: 'before' };
          }
          return { phaseId: phase.id, stepIndex, placement: 'after' };
        }
      }

      return null;
    },
    [phases]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { step: Step; phaseId: string } | undefined;
    if (!data) return;
    setActiveStep(data.step);
    setActivePhaseId(data.phaseId);
    // Capture the card's rendered width so the overlay matches exactly
    const el = document.querySelector<HTMLElement>(`[data-step-id="${data.step.id}"]`);
    if (el) setOverlayWidth(el.getBoundingClientRect().width);
    useUiStore.getState().setIsDraggingCard(true);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const draggedId = event.active.id as string;
    const { x, y } = pointerPos.current;
    const target = computeDropTarget(x, y, draggedId);
    setDropTarget(target);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    useUiStore.getState().setIsDraggingCard(false);

    const { x, y } = pointerPos.current;
    const draggedId = event.active.id as string;
    const data = event.active.data.current as { step: Step; phaseId: string } | undefined;

    if (!data) {
      setActiveStep(null);
      setActivePhaseId(null);
      setDropTarget(null);
      return;
    }

    // Delete zone: bottom 150px of viewport
    if (y > window.innerHeight - 150) {
      removeStep(data.phaseId, draggedId);
      setActiveStep(null);
      setActivePhaseId(null);
      setDropTarget(null);
      return;
    }

    const target = computeDropTarget(x, y, draggedId);
    if (target) {
      moveStep(data.phaseId, draggedId, target.phaseId, target.stepIndex, target.placement);
    }

    setActiveStep(null);
    setActivePhaseId(null);
    setDropTarget(null);
  };

  const handleDragCancel = () => {
    useUiStore.getState().setIsDraggingCard(false);
    setActiveStep(null);
    setActivePhaseId(null);
    setDropTarget(null);
  };

  // Find the active step's card styling for the DragOverlay clone
  const overlayPhase = activePhaseId ? phases.find((p) => p.id === activePhaseId) : null;
  const overlayCardBg = overlayPhase
    ? hexMix(overlayPhase.backgroundColor, layout.cardTintOpacity / 100)
    : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={resolvedRef}
        className="infographic-root w-full shadow-2xl rounded-xl border border-slate-200 overflow-hidden bg-white relative"
        style={{ display: 'flex', flexDirection: 'column' }}
        onClick={() => setSelectedElement(null)}
      >
        <TitleBar />
        <ConnectorOverlay />

        {/* Phase columns */}
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
              dropTarget={dropTarget}
            />
          ))}
        </div>

        {/* Add Phase footer */}
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

      {/* Floating card clone shown during drag */}
      <DragOverlay dropAnimation={null}>
        {activeStep && overlayPhase ? (
          <div
            className="rotate-1 scale-105 shadow-2xl"
            style={{ width: overlayWidth, pointerEvents: 'none' }}
          >
            <StepCard
              step={activeStep}
              phaseId={activePhaseId!}
              roles={roles}
              cornerRadius={layout.cornerRadius}
              cardBackground={overlayCardBg}
              phaseColor={overlayPhase.backgroundColor}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

InfographicRenderer.displayName = 'InfographicRenderer';
