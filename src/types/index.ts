export interface RoleDefinition {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

// Step type-specific data interfaces
export interface MeetingData {
  agendaItems: string[];
  facilitator?: string;
  duration?: string;
}

export interface DecisionData {
  criteria: string[];
  outcome?: 'pending' | 'approved' | 'rejected';
}

export interface ParallelTrack {
  id: string;
  label: string;
  description: string;
  roleIds: string[];
}

export interface ParallelData {
  tracks: ParallelTrack[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistData {
  items: ChecklistItem[];
}

export interface HandoffData {
  fromTeam: string;
  toTeam: string;
  artifacts: string[];
}

export interface MilestoneData {
  status: 'not-started' | 'in-progress' | 'completed';
  targetDate?: string;
  deliverables: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  docType: string;
}

export interface DocumentData {
  documents: DocumentItem[];
}

export interface EstimationData {
  method: 'tshirt' | 'points' | 'hours';
  value?: string;
  breakdown?: Array<{ label: string; value: string }>;
}

export interface CollaborationParticipant {
  roleId: string;
  action: string;
}

export interface CollaborationData {
  participants: CollaborationParticipant[];
  iterative: boolean;
}

export interface TimelineEntry {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  color: string;
}

export interface TimelineData {
  entries: TimelineEntry[];
}

export interface RiskItem {
  id: string;
  text: string;
  mitigation?: string;
}

export interface RiskData {
  severity: 'low' | 'medium' | 'high' | 'critical';
  risks: RiskItem[];
}

export interface MetricItem {
  id: string;
  label: string;
  value: number;
  target?: number;
  unit: string;
  format: 'number' | 'progress' | 'badge';
}

export interface MetricsData {
  metrics: MetricItem[];
}

export type StepType = 'standard' | 'meeting' | 'decision' | 'parallel' | 'checklist' |
  'handoff' | 'milestone' | 'document' | 'estimation' | 'collaboration' |
  'timeline' | 'risk' | 'metrics';

export interface BaseStep {
  id: string;
  title: string;
  description: string;
  iconName: string;
  roleIds: string[];
}

export type Step = BaseStep & (
  | { type: 'standard' }
  | { type: 'meeting'; data: MeetingData }
  | { type: 'decision'; data: DecisionData }
  | { type: 'parallel'; data: ParallelData }
  | { type: 'checklist'; data: ChecklistData }
  | { type: 'handoff'; data: HandoffData }
  | { type: 'milestone'; data: MilestoneData }
  | { type: 'document'; data: DocumentData }
  | { type: 'estimation'; data: EstimationData }
  | { type: 'collaboration'; data: CollaborationData }
  | { type: 'timeline'; data: TimelineData }
  | { type: 'risk'; data: RiskData }
  | { type: 'metrics'; data: MetricsData }
);

export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  steps: Step[];
}

export interface TitleBarConfig {
  text: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}

export type LayoutDirection = 'horizontal' | 'vertical';

export interface LayoutConfig {
  direction: LayoutDirection;
  phaseGap: number;
  stepGap: number;
  padding: number;
  phaseMinWidth: number;
  cornerRadius: number;
}

export interface InfographicData {
  id: string;
  titleBar: TitleBarConfig;
  roles: RoleDefinition[];
  phases: Phase[];
  layout: LayoutConfig;
  backgroundColor: string;
}

export type SelectedElement =
  | { type: 'titleBar' }
  | { type: 'phase'; phaseId: string }
  | { type: 'step'; phaseId: string; stepId: string }
  | null;

export type ExportFormat = 'png' | 'svg' | 'pdf';

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  standard: 'Standard',
  meeting: 'Meeting',
  decision: 'Decision Gate',
  parallel: 'Parallel Tracks',
  checklist: 'Checklist',
  handoff: 'Handoff',
  milestone: 'Milestone',
  document: 'Document / Artifact',
  estimation: 'Estimation',
  collaboration: 'Collaboration Loop',
  timeline: 'Timeline',
  risk: 'Risk / Warning',
  metrics: 'Metrics / KPI',
};

export const STEP_TYPE_ICONS: Record<StepType, string> = {
  standard: 'circle-dot',
  meeting: 'calendar',
  decision: 'scale',
  parallel: 'columns-2',
  checklist: 'list-checks',
  handoff: 'arrow-right-left',
  milestone: 'flag',
  document: 'file-text',
  estimation: 'calculator',
  collaboration: 'refresh-cw',
  timeline: 'gantt-chart',
  risk: 'alert-triangle',
  metrics: 'bar-chart-3',
};
