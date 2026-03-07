import { nanoid } from 'nanoid';
import type { Step, Phase, RoleDefinition, InfographicData, StepType, MeetingData, DecisionData, ParallelData, ChecklistData, HandoffData, MilestoneData, DocumentData, EstimationData, CollaborationData, TimelineData, RiskData, MetricsData } from './index';

export function createId(): string {
  return nanoid(10);
}

export function createRole(name: string, color: string, textColor = '#ffffff'): RoleDefinition {
  return { id: createId(), name, color, textColor };
}

export function getDefaultStepData(type: StepType): unknown {
  switch (type) {
    case 'standard': return undefined;
    case 'meeting': return { agendaItems: ['Agenda item 1'], facilitator: '', duration: '1 hour' } as MeetingData;
    case 'decision': return { criteria: ['Criteria 1'], outcome: 'pending' } as DecisionData;
    case 'parallel': return { tracks: [{ id: createId(), label: 'Track A', description: 'Description', roleIds: [], items: [] }, { id: createId(), label: 'Track B', description: 'Description', roleIds: [], items: [] }] } as ParallelData;
    case 'checklist': return { items: [{ id: createId(), text: 'Item 1', checked: false }] } as ChecklistData;
    case 'handoff': return { fromTeam: 'Team A', toTeam: 'Team B', artifacts: ['Deliverable 1'] } as HandoffData;
    case 'milestone': return { status: 'not-started', deliverables: ['Deliverable 1'] } as MilestoneData;
    case 'document': return { documents: [{ id: createId(), name: 'Document 1', docType: 'spec' }] } as DocumentData;
    case 'estimation': return { method: 'tshirt', value: 'M', breakdown: [] } as EstimationData;
    case 'collaboration': return { participants: [], iterative: true, finalActionTitle: 'Final Output', finalItems: [] } as CollaborationData;
    case 'timeline': return { entries: [{ id: createId(), label: 'Task 1', startDate: '2025-01-01', endDate: '2025-01-15', color: '#3b82f6' }] } as TimelineData;
    case 'risk': return { severity: 'medium', risks: [{ id: createId(), text: 'Risk 1', mitigation: '' }] } as RiskData;
    case 'metrics': return { metrics: [{ id: createId(), label: 'Metric 1', value: 50, target: 100, unit: '%', format: 'progress' }] } as MetricsData;
  }
}

export function createStep(type: StepType = 'standard', overrides?: Partial<Step>): Step {
  const base = {
    id: createId(),
    title: 'New Step',
    description: 'Step description',
    iconName: type === 'standard' ? 'circle-dot' : ({ meeting: 'calendar', decision: 'scale', parallel: 'columns-2', checklist: 'list-checks', handoff: 'arrow-right-left', milestone: 'flag', document: 'file-text', estimation: 'calculator', collaboration: 'refresh-cw', timeline: 'gantt-chart', risk: 'alert-triangle', metrics: 'bar-chart-3' } as Record<string, string>)[type] || 'circle-dot',
    roleIds: [],
    type,
    gridLayout: { x: 0, y: 9999, w: 12, h: 2 },
    ...overrides,
  };
  const data = getDefaultStepData(type);
  if (data) {
    return { ...base, data } as Step;
  }
  return base as Step;
}

export function createPhase(overrides?: Partial<Phase>): Phase {
  return {
    id: createId(),
    title: 'New Phase',
    subtitle: 'Phase description',
    backgroundColor: '#f0f9ff',
    textColor: '#1e3a5f',
    steps: [],
    ...overrides,
  };
}

export function createDefaultInfographic(): InfographicData {
  return {
    id: createId(),
    titleBar: {
      text: 'New Project',
      subtitle: 'A blank canvas for your workflow',
      backgroundColor: '#1e293b',
      textColor: '#ffffff',
      fontSize: 24,
      subtitleFontSize: 16,
      alignment: 'center',
      logoUrl: '',
      titleFontFamily: `'Inter', sans-serif`,
      subtitleFontFamily: `'Inter', sans-serif`,
    },
    roles: [],
    backgroundColor: '#f8fafc',
    layout: {
      direction: 'horizontal',
      phaseGap: 12,
      stepGap: 10,
      padding: 20,
      phaseMinWidth: 280,
      cornerRadius: 12,
      phaseTintOpacity: 15,
      cardTintOpacity: 5,
      phaseTransitionSharpness: 30,
      phaseTitleFontSize: 15,
      phaseSubtitleFontSize: 15,
      phaseTitleFontFamily: `'Inter', sans-serif`,
      phaseSubtitleFontFamily: `'Inter', sans-serif`,
      phaseTitleColor: '#334155',
      phaseSubtitleColor: '#475569',
      cardTitleFontFamily: `'Inter', sans-serif`,
      cardContentFontFamily: `'Inter', sans-serif`,
      cardTitleFontSize: 16,
      cardContentFontSize: 16,
      cardSubtextFontSize: 15,
      cardSubtextFontFamily: `'Inter', sans-serif`,
      stepLabelColor: '#3c83f6',
      stepLabelTextColor: '#ffffff',
      stepLabelFontFamily: `'Inter', sans-serif`,
      stepLabelFontSize: 10,
      stepLabelMatchPhase: false,
      cardTextColorMode: 'custom',
      cardTextColor: '#1e293b',
      subcontentTitleFontFamily: `'Inter', sans-serif`,
      subcontentTitleFontSize: 9,
      subcontentTitleColor: '#94a3b8',
      cardBorderStyle: 'solid',
      cardBorderWidth: 1,
      cardShadow: 'soft',
      showStepIcons: true,
      phaseBackgroundPattern: 'none',
    },
    phases: [],
    connectors: [],
  };
}
