import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { StepCard } from './StepCard';
import type { Step } from '../../types';

interface DraggableStepCardProps {
  step: Step;
  phaseId: string;
  cardBackground?: string;
  phaseColor?: string;
}

export const DraggableStepCard: React.FC<DraggableStepCardProps> = ({
  step,
  phaseId,
  cardBackground,
  phaseColor,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: step.id,
    data: { step, phaseId },
  });

  return (
    <div
      ref={setNodeRef}
      data-step-id={step.id}
      className="w-full"
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: isDragging ? undefined : 'opacity 150ms ease',
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <StepCard
        step={step}
        phaseId={phaseId}
        cardBackground={cardBackground}
        phaseColor={phaseColor}
      />
    </div>
  );
};