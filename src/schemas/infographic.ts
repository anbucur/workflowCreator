import { z } from 'zod';

// ─── Step data schemas ──────────────────────────────────────────────

const meetingDataSchema = z.object({
  agendaItems: z.array(z.string()),
  facilitator: z.string().optional(),
  duration: z.string().optional(),
  hasDecision: z.boolean().optional(),
  decision: z.object({
    criteria: z.array(z.string()),
    outcome: z.enum(['pending', 'approved', 'rejected']).optional(),
  }).optional(),
});

const decisionDataSchema = z.object({
  criteria: z.array(z.string()),
  outcome: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const parallelDataSchema = z.object({
  tracks: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    roleIds: z.array(z.string()),
    items: z.array(z.string()),
  })),
});

const checklistDataSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    checked: z.boolean(),
  })),
});

const handoffDataSchema = z.object({
  fromTeam: z.string(),
  toTeam: z.string(),
  artifacts: z.array(z.string()),
});

const milestoneDataSchema = z.object({
  status: z.enum(['none', 'not-started', 'in-progress', 'completed']),
  targetDate: z.string().optional(),
  deliverables: z.array(z.string()),
});

const documentDataSchema = z.object({
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    docType: z.string(),
    icon: z.string().optional(),
  })),
});

const estimationDataSchema = z.object({
  method: z.enum(['tshirt', 'points', 'hours']),
  value: z.string().optional(),
  breakdown: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

const collaborationDataSchema = z.object({
  participants: z.array(z.object({ roleId: z.string(), action: z.string() })),
  iterative: z.boolean(),
  finalActionTitle: z.string().optional(),
  finalItems: z.array(z.string()).optional(),
});

const timelineDataSchema = z.object({
  entries: z.array(z.object({
    id: z.string(),
    label: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    color: z.string(),
  })),
});

const riskDataSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  risks: z.array(z.object({
    id: z.string(),
    text: z.string(),
    mitigation: z.string().optional(),
  })),
});

const metricsDataSchema = z.object({
  metrics: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.number(),
    target: z.number().optional(),
    unit: z.string(),
    format: z.enum(['number', 'progress', 'badge']),
  })),
});

const kanbanDataSchema = z.object({
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string(),
    cards: z.array(z.object({
      id: z.string(),
      title: z.string(),
      assignee: z.string().optional(),
      labels: z.array(z.string()),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
      source: z.enum(['github', 'jira', 'manual']).optional(),
      sourceId: z.string().optional(),
    })),
  })),
  liveSource: z.enum(['github', 'jira', 'none']).optional(),
});

const okrDataSchema = z.object({
  objectives: z.array(z.object({
    id: z.string(),
    title: z.string(),
    owner: z.string().optional(),
    quarter: z.string().optional(),
    keyResults: z.array(z.object({
      id: z.string(),
      text: z.string(),
      current: z.number(),
      target: z.number(),
      unit: z.string(),
    })),
  })),
});

const sprintDataSchema = z.object({
  sprintName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  velocityTarget: z.number(),
  stories: z.array(z.object({
    id: z.string(),
    title: z.string(),
    points: z.number(),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
    assignee: z.string().optional(),
    labels: z.array(z.string()),
    sourceId: z.string().optional(),
  })),
  liveSource: z.enum(['jira', 'github', 'none']).optional(),
});

const roadmapDataSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    quarter: z.string(),
    status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
    type: z.enum(['feature', 'epic', 'initiative', 'release', 'milestone']),
    team: z.string().optional(),
    description: z.string().optional(),
    progress: z.number().optional(),
  })),
  quarters: z.array(z.string()),
});

const executiveDataSchema = z.object({
  kpis: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
    change: z.string().optional(),
    changeType: z.enum(['positive', 'negative', 'neutral']),
    trend: z.enum(['up', 'down', 'flat']),
    icon: z.string().optional(),
    color: z.string().optional(),
    liveSource: z.enum(['github', 'jira', 'manual']).optional(),
    liveMetric: z.string().optional(),
  })),
  summary: z.string().optional(),
  deploymentVersion: z.string().optional(),
  deploymentStatus: z.enum(['healthy', 'degraded', 'down', 'unknown']).optional(),
  liveRefresh: z.boolean().optional(),
});

// ─── Step schema (discriminated union) ──────────────────────────────

const baseStepFields = {
  id: z.string(),
  title: z.string(),
  description: z.string(),
  iconName: z.string(),
  roleIds: z.array(z.string()),
  customLabel: z.string().optional(),
  gridCol: z.union([z.literal(0), z.literal(1)]).optional(),
  gridLayout: z.object({
    x: z.number(), y: z.number(), w: z.number(), h: z.number(),
  }).optional(),
};

const stepSchema = z.discriminatedUnion('type', [
  z.object({ ...baseStepFields, type: z.literal('standard') }),
  z.object({ ...baseStepFields, type: z.literal('meeting'), data: meetingDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('decision'), data: decisionDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('parallel'), data: parallelDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('checklist'), data: checklistDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('handoff'), data: handoffDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('milestone'), data: milestoneDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('document'), data: documentDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('estimation'), data: estimationDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('collaboration'), data: collaborationDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('timeline'), data: timelineDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('risk'), data: riskDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('metrics'), data: metricsDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('kanban'), data: kanbanDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('okr'), data: okrDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('sprint'), data: sprintDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('roadmap'), data: roadmapDataSchema }),
  z.object({ ...baseStepFields, type: z.literal('executive'), data: executiveDataSchema }),
]);

// ─── Top-level schemas ──────────────────────────────────────────────

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string().optional(),
  color: z.string(),
  textColor: z.string(),
});

const phaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  steps: z.array(stepSchema),
});

const titleBarSchema = z.object({
  text: z.string(),
  subtitle: z.string().optional(),
  backgroundColor: z.string(),
  textColor: z.string(),
  subtitleColor: z.string().optional(),
  fontSize: z.number(),
  subtitleFontSize: z.number().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  logoUrl: z.string().optional(),
  titleFontFamily: z.string().optional(),
  subtitleFontFamily: z.string().optional(),
});

const layoutSchema = z.object({
  direction: z.enum(['horizontal', 'vertical']),
  phaseGap: z.number(),
  stepGap: z.number(),
  padding: z.number(),
  phaseMinWidth: z.number(),
  cornerRadius: z.number(),
  phaseTintOpacity: z.number(),
  cardTintOpacity: z.number(),
  phaseTransitionSharpness: z.number(),
  cardBorderStyle: z.enum(['solid', 'dashed', 'dotted', 'none']),
  cardBorderWidth: z.number(),
}).passthrough(); // Allow additional optional layout fields

const connectorSchema = z.object({
  id: z.string(),
  sourceStepId: z.string(),
  sourceHandle: z.enum(['top', 'bottom', 'left', 'right']),
  targetStepId: z.string(),
  targetHandle: z.enum(['top', 'bottom', 'left', 'right']),
  type: z.enum(['straight', 'curved', 'step', 'loop']),
  color: z.string(),
  label: z.string().optional(),
  lineStyle: z.enum(['solid', 'dashed', 'dotted']),
  sourceHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']),
  targetHead: z.enum(['none', 'arrow', 'diamond', 'circle', 'square']),
  strokeWidth: z.number(),
  waypoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
});

export const infographicDataSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  titleBar: titleBarSchema,
  roles: z.array(roleSchema),
  phases: z.array(phaseSchema),
  layout: layoutSchema,
  backgroundColor: z.string(),
  connectors: z.array(connectorSchema),
});

export type ValidatedInfographicData = z.infer<typeof infographicDataSchema>;

/**
 * Validate project data loaded from API. Returns the data if valid, or null with logged errors.
 */
export function validateProjectData(data: unknown): ValidatedInfographicData | null {
  const result = infographicDataSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('Project data validation failed:', result.error.issues.slice(0, 5));
  return null;
}
