export interface RoleDefinition {
  id: string;
  name: string;
  tag?: string;
  color: string;
  textColor: string;
}

// Step type-specific data interfaces
export interface MeetingData {
  agendaItems: string[];
  facilitator?: string;
  duration?: string;
  hasDecision?: boolean;
  decision?: DecisionData;
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
  items: string[];
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
  status: 'none' | 'not-started' | 'in-progress' | 'completed';
  targetDate?: string;
  deliverables: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  docType: string;
  icon?: string; // Lucide icon name
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
  finalActionTitle?: string;
  finalItems?: string[];
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

// ─── New enterprise board step types ─────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  assignee?: string;
  labels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  source?: 'github' | 'jira' | 'manual'; // live integration source
  sourceId?: string; // GitHub issue# or Jira key
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export interface KanbanData {
  columns: KanbanColumn[];
  liveSource?: 'github' | 'jira' | 'none';
}

export interface OKRKeyResult {
  id: string;
  text: string;
  current: number;
  target: number;
  unit: string;
}

export interface OKRObjective {
  id: string;
  title: string;
  owner?: string;
  quarter?: string;
  keyResults: OKRKeyResult[];
}

export interface OKRData {
  objectives: OKRObjective[];
}

export type SprintStoryStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface SprintStory {
  id: string;
  title: string;
  points: number;
  status: SprintStoryStatus;
  assignee?: string;
  labels: string[];
  sourceId?: string; // Jira key or GitHub issue#
}

export interface SprintData {
  sprintName: string;
  startDate: string;
  endDate: string;
  velocityTarget: number;
  stories: SprintStory[];
  liveSource?: 'jira' | 'github' | 'none';
}

export type RoadmapItemStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type RoadmapItemType = 'feature' | 'epic' | 'initiative' | 'release' | 'milestone';

export interface RoadmapItem {
  id: string;
  title: string;
  quarter: string; // e.g. "Q1 2025"
  status: RoadmapItemStatus;
  type: RoadmapItemType;
  team?: string;
  description?: string;
  progress?: number; // 0-100
}

export interface RoadmapData {
  items: RoadmapItem[];
  quarters: string[]; // ordered list of quarter labels to display
}

export type KPITrend = 'up' | 'down' | 'flat';
export type KPIChangeType = 'positive' | 'negative' | 'neutral';

export interface ExecutiveKPI {
  id: string;
  label: string;
  value: string;
  change?: string; // e.g. "+12%"
  changeType: KPIChangeType;
  trend: KPITrend;
  icon?: string;
  color?: string;
  liveSource?: 'github' | 'jira' | 'manual';
  liveMetric?: string; // e.g. "open_issues", "velocity", "release_count"
}

export interface ExecutiveData {
  kpis: ExecutiveKPI[];
  summary?: string;
  deploymentVersion?: string;
  deploymentStatus?: 'healthy' | 'degraded' | 'down' | 'unknown';
  liveRefresh?: boolean;
}

export type StepType = 'standard' | 'meeting' | 'decision' | 'parallel' | 'checklist' |
  'handoff' | 'milestone' | 'document' | 'estimation' | 'collaboration' |
  'timeline' | 'risk' | 'metrics' |
  'kanban' | 'okr' | 'sprint' | 'roadmap' | 'executive';

export interface BaseStep {
  id: string;
  title: string;
  description: string;
  iconName: string;
  roleIds: string[];
  customLabel?: string;
  /** 0 = full-width or left card of a side-by-side pair; 1 = right card of a pair (pairs with the step immediately before it) */
  gridCol?: 0 | 1;
  gridLayout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
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
  | { type: 'kanban'; data: KanbanData }
  | { type: 'okr'; data: OKRData }
  | { type: 'sprint'; data: SprintData }
  | { type: 'roadmap'; data: RoadmapData }
  | { type: 'executive'; data: ExecutiveData }
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
  subtitleColor?: string;
  fontSize: number;
  subtitleFontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  logoUrl?: string; // Base64 or absolute URL
  titleFontFamily?: string;
  subtitleFontFamily?: string;
}

export type LayoutDirection = 'horizontal' | 'vertical';

export interface LayoutConfig {
  direction: LayoutDirection;
  phaseGap: number;
  stepGap: number;
  padding: number;
  phaseMinWidth: number;
  cornerRadius: number;
  /** 0–100. How strong the phase color tint is in the card area background (100 = full phase color). */
  phaseTintOpacity: number;
  /** 0–100. How much of the phase color bleeds into each card's background (100 = full phase color). */
  cardTintOpacity: number;
  /** 0–100. How abrupt the transition between adjacent phase colors is. 0 = smooth full-width blend, 100 = near-instant cut at the midpoint. */
  phaseTransitionSharpness: number;
  phaseTitleFontSize?: number;
  phaseSubtitleFontSize?: number;
  phaseTitleFontFamily?: string;
  phaseSubtitleFontFamily?: string;
  phaseTitleColor?: string;
  phaseSubtitleColor?: string;
  cardTitleFontFamily?: string;
  cardContentFontFamily?: string;
  cardTitleFontSize?: number;
  cardContentFontSize?: number;
  cardSubtextFontSize?: number;
  cardSubtextFontFamily?: string;
  cardTitleColor?: string;
  cardContentColor?: string;
  cardSubtextColor?: string;
  stepLabelColor?: string;
  stepLabelTextColor?: string;
  stepLabelFontFamily?: string;
  stepLabelFontSize?: number;
  stepLabelMatchPhase?: boolean;

  cardTextColorMode?: 'default' | 'high-contrast' | 'custom';
  cardTextColor?: string;

  // Subcontent title settings (e.g., "AGENDA", "Tracks")
  subcontentTitleFontFamily?: string;
  subcontentTitleFontSize?: number;
  subcontentTitleColor?: string;

  // Global phase text color override
  useGlobalPhaseTextColor?: boolean;
  globalPhaseTextColor?: string;

  // New UI Customizations
  cardBorderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  cardBorderWidth: number;
  cardShadow?: 'none' | 'soft' | 'medium' | 'hard' | 'neon';
  showStepIcons?: boolean;
  stepIconColor?: string;
  phaseBackgroundPattern?: 'none' | 'dots' | 'grid' | 'diagonal';
}

export type ConnectorHandlePosition = 'top' | 'bottom' | 'left' | 'right';
export type ConnectorType = 'straight' | 'curved' | 'step' | 'loop';
export type ConnectorLineStyle = 'solid' | 'dashed' | 'dotted';
export type ConnectorHeadType = 'none' | 'arrow' | 'diamond' | 'circle' | 'square';

export interface Connector {
  id: string;
  sourceStepId: string;
  sourceHandle: ConnectorHandlePosition;
  targetStepId: string;
  targetHandle: ConnectorHandlePosition;
  type: ConnectorType;
  color: string;
  label?: string;
  lineStyle: ConnectorLineStyle;
  sourceHead: ConnectorHeadType;
  targetHead: ConnectorHeadType;
  strokeWidth: number;
  waypoints?: { x: number; y: number }[];
}

export interface InfographicData {
  id: string;
  name?: string;
  titleBar: TitleBarConfig;
  roles: RoleDefinition[];
  phases: Phase[];
  layout: LayoutConfig;
  backgroundColor: string;
  connectors: Connector[];
}

export type SelectedElement =
  | { type: 'titleBar' }
  | { type: 'phase'; phaseId: string }
  | { type: 'step'; phaseId: string; stepId: string }
  | { type: 'connector'; connectorId: string }
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
  kanban: 'Kanban Board',
  okr: 'OKR Tracker',
  sprint: 'Sprint Board',
  roadmap: 'Roadmap',
  executive: 'Executive Dashboard',
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
  kanban: 'kanban',
  okr: 'target',
  sprint: 'zap',
  roadmap: 'map',
  executive: 'layout-dashboard',
};
