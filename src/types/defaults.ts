import { nanoid } from 'nanoid';
import type { Step, Phase, RoleDefinition, InfographicData, StepType, MeetingData, DecisionData, ParallelData, ChecklistData, HandoffData, MilestoneData, DocumentData, EstimationData, CollaborationData, TimelineData, RiskData, MetricsData, KanbanData, OKRData, SprintData, RoadmapData, ExecutiveData } from './index';

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
    case 'kanban': return {
      columns: [
        { id: createId(), title: 'To Do', color: '#e2e8f0', cards: [{ id: createId(), title: 'Task 1', labels: [], priority: 'medium' }] },
        { id: createId(), title: 'In Progress', color: '#dbeafe', cards: [] },
        { id: createId(), title: 'Done', color: '#dcfce7', cards: [] },
      ],
      liveSource: 'none',
    } as KanbanData;
    case 'okr': return {
      objectives: [{
        id: createId(), title: 'Objective 1', owner: 'Team', quarter: 'Q1 2025',
        keyResults: [
          { id: createId(), text: 'Key Result 1', current: 0, target: 100, unit: '%' },
          { id: createId(), text: 'Key Result 2', current: 0, target: 50, unit: 'items' },
        ],
      }],
    } as OKRData;
    case 'sprint': return {
      sprintName: 'Sprint 1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      velocityTarget: 40,
      stories: [
        { id: createId(), title: 'Story 1', points: 5, status: 'todo', labels: [] },
        { id: createId(), title: 'Story 2', points: 8, status: 'in_progress', labels: [] },
      ],
      liveSource: 'none',
    } as SprintData;
    case 'roadmap': return {
      quarters: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
      items: [
        { id: createId(), title: 'Feature Launch', quarter: 'Q1 2025', status: 'completed', type: 'feature', team: 'Engineering', progress: 100 },
        { id: createId(), title: 'Mobile App', quarter: 'Q2 2025', status: 'in_progress', type: 'initiative', team: 'Product', progress: 45 },
        { id: createId(), title: 'API v2', quarter: 'Q3 2025', status: 'planned', type: 'epic', team: 'Platform', progress: 0 },
      ],
    } as RoadmapData;
    case 'executive': return {
      kpis: [
        { id: createId(), label: 'Revenue', value: '$2.4M', change: '+18%', changeType: 'positive', trend: 'up', icon: 'trending-up', color: '#22c55e' },
        { id: createId(), label: 'Active Users', value: '14,280', change: '+7%', changeType: 'positive', trend: 'up', icon: 'users', color: '#3b82f6' },
        { id: createId(), label: 'NPS Score', value: '72', change: '+4', changeType: 'positive', trend: 'up', icon: 'heart', color: '#ec4899' },
        { id: createId(), label: 'Bugs Open', value: '23', change: '-12', changeType: 'positive', trend: 'down', icon: 'bug', color: '#f59e0b' },
      ],
      summary: 'Q1 performance exceeds targets across all key indicators.',
      deploymentStatus: 'healthy',
      liveRefresh: false,
    } as ExecutiveData;
  }
}

export function createStep(type: StepType = 'standard', overrides?: Partial<Step>): Step {
  const base = {
    id: createId(),
    title: 'New Step',
    description: 'Step description',
    iconName: type === 'standard' ? 'circle-dot' : ({ meeting: 'calendar', decision: 'scale', parallel: 'columns-2', checklist: 'list-checks', handoff: 'arrow-right-left', milestone: 'flag', document: 'file-text', estimation: 'calculator', collaboration: 'refresh-cw', timeline: 'gantt-chart', risk: 'alert-triangle', metrics: 'bar-chart-3', kanban: 'kanban', okr: 'target', sprint: 'zap', roadmap: 'map', executive: 'layout-dashboard' } as Record<string, string>)[type] || 'circle-dot',
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
