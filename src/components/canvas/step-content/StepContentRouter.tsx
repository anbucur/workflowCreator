import React from 'react';
import type { Step, RoleDefinition } from '../../../types';
import { StandardContent } from './StandardContent';
import { MeetingContent } from './MeetingContent';
import { DecisionContent } from './DecisionContent';
import { ParallelContent } from './ParallelContent';
import { ChecklistContent } from './ChecklistContent';
import { HandoffContent } from './HandoffContent';
import { MilestoneContent } from './MilestoneContent';
import { DocumentContent } from './DocumentContent';
import { EstimationContent } from './EstimationContent';
import { CollaborationContent } from './CollaborationContent';
import { TimelineContent } from './TimelineContent';
import { RiskContent } from './RiskContent';
import { MetricsContent } from './MetricsContent';

interface StepContentProps {
  step: Step;
  roles: RoleDefinition[];
}

export const StepContentRouter: React.FC<StepContentProps> = ({ step, roles }) => {
  switch (step.type) {
    case 'meeting': return <MeetingContent step={step} roles={roles} />;
    case 'decision': return <DecisionContent step={step} roles={roles} />;
    case 'parallel': return <ParallelContent step={step} roles={roles} />;
    case 'checklist': return <ChecklistContent step={step} roles={roles} />;
    case 'handoff': return <HandoffContent step={step} roles={roles} />;
    case 'milestone': return <MilestoneContent step={step} roles={roles} />;
    case 'document': return <DocumentContent step={step} roles={roles} />;
    case 'estimation': return <EstimationContent step={step} roles={roles} />;
    case 'collaboration': return <CollaborationContent step={step} roles={roles} />;
    case 'timeline': return <TimelineContent step={step} roles={roles} />;
    case 'risk': return <RiskContent step={step} roles={roles} />;
    case 'metrics': return <MetricsContent step={step} roles={roles} />;
    case 'standard':
    default: return <StandardContent step={step} roles={roles} />;
  }
};
