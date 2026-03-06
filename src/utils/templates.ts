import type { InfographicData, Step, Phase } from '../types';
import { createId } from '../types/defaults';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  icon: string;
  themeId: string;
  build: (projectName: string, subtitle: string) => InfographicData;
}

export type WorkflowCategory =
  | 'software'
  | 'marketing'
  | 'operations'
  | 'hr'
  | 'creative'
  | 'general';

export const WORKFLOW_CATEGORIES: { id: WorkflowCategory; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'layout-grid' },
  { id: 'software', label: 'Software', icon: 'code-2' },
  { id: 'marketing', label: 'Marketing', icon: 'megaphone' },
  { id: 'operations', label: 'Operations', icon: 'settings' },
  { id: 'hr', label: 'People & HR', icon: 'users' },
  { id: 'creative', label: 'Creative', icon: 'palette' },
];

function makeStep(type: string, title: string, description: string, iconName: string, roleIds: string[] = [], data?: unknown): Step {
  const base: Record<string, unknown> = {
    id: createId(),
    title,
    description,
    iconName,
    roleIds,
    type,
    gridLayout: { x: 0, y: 9999, w: 12, h: 2 },
  };
  if (data) base.data = data;
  return base as unknown as Step;
}

function makePhase(title: string, subtitle: string, bg: string, textColor: string, steps: Step[]): Phase {
  return { id: createId(), title, subtitle, backgroundColor: bg, textColor, steps };
}

const defaultLayout = {
  direction: 'horizontal' as const,
  phaseGap: 12,
  stepGap: 10,
  padding: 20,
  phaseMinWidth: 280,
  cornerRadius: 12,
  phaseTintOpacity: 15,
  cardTintOpacity: 5,
  phaseTransitionSharpness: 30,
  phaseTitleFontSize: 11,
  phaseSubtitleFontSize: 10,
  phaseTitleFontFamily: `'Inter', sans-serif`,
  phaseSubtitleFontFamily: `'Inter', sans-serif`,
  cardTitleFontFamily: `'Inter', sans-serif`,
  cardContentFontFamily: `'Inter', sans-serif`,
  cardTitleFontSize: 12,
  cardContentFontSize: 11,
  cardSubtextFontSize: 9,
  stepLabelColor: '#3c83f6',
  stepLabelTextColor: '#ffffff',
  stepLabelFontFamily: `'Inter', sans-serif`,
  stepLabelFontSize: 9,
  stepLabelMatchPhase: false,
  cardBorderStyle: 'solid' as const,
  cardBorderWidth: 1,
  cardShadow: 'soft' as const,
  showStepIcons: true,
  phaseBackgroundPattern: 'none' as const,
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ── Blank Canvas ──
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty workflow.',
    category: 'general',
    icon: 'file-plus',
    themeId: 'monochrome-slate',
    build: (projectName, subtitle) => ({
      id: createId(),
      titleBar: { text: projectName, subtitle, backgroundColor: '#1e293b', textColor: '#ffffff', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Inter', sans-serif`, subtitleFontFamily: `'Inter', sans-serif` },
      roles: [],
      phases: [],
      layout: { ...defaultLayout },
      backgroundColor: '#f8fafc',
      connectors: [],
    }),
  },

  // ── Software Development Lifecycle ──
  {
    id: 'sdlc',
    name: 'Software Development Lifecycle',
    description: 'Full SDLC from requirements to deployment with agile practices.',
    category: 'software',
    icon: 'code-2',
    themeId: 'ocean-depth',
    build: (projectName, subtitle) => {
      const pm = { id: createId(), name: 'Product Manager', color: '#6366f1', textColor: '#ffffff' };
      const dev = { id: createId(), name: 'Developer', color: '#3b82f6', textColor: '#ffffff' };
      const qa = { id: createId(), name: 'QA Engineer', color: '#22c55e', textColor: '#ffffff' };
      const devops = { id: createId(), name: 'DevOps', color: '#f59e0b', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#0c4a6e', textColor: '#ffffff', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Inter', sans-serif`, subtitleFontFamily: `'Inter', sans-serif` },
        roles: [pm, dev, qa, devops],
        phases: [
          makePhase('Discovery', 'Requirements & Planning', '#e0f2fe', '#0f172a', [
            makeStep('standard', 'Stakeholder Interviews', 'Gather requirements from key stakeholders', 'users', [pm.id]),
            makeStep('document', 'Requirements Document', 'Create detailed requirements specification', 'file-text', [pm.id], { documents: [{ id: createId(), name: 'PRD', docType: 'spec' }, { id: createId(), name: 'User Stories', docType: 'spec' }] }),
            makeStep('estimation', 'Effort Estimation', 'Estimate development effort for each feature', 'calculator', [pm.id, dev.id], { method: 'tshirt', value: 'M', breakdown: [] }),
          ]),
          makePhase('Design', 'Architecture & UI', '#bae6fd', '#0f172a', [
            makeStep('standard', 'System Architecture', 'Design technical architecture and data models', 'cpu', [dev.id]),
            makeStep('collaboration', 'Design Review', 'Review designs with team members', 'refresh-cw', [pm.id, dev.id], { participants: [{ roleId: pm.id, action: 'Review' }, { roleId: dev.id, action: 'Present' }], iterative: true, finalActionTitle: 'Approved Design', finalItems: [] }),
            makeStep('decision', 'Tech Stack Decision', 'Choose frameworks and tools', 'scale', [dev.id], { criteria: ['Performance', 'Scalability', 'Team familiarity'], outcome: 'pending' }),
          ]),
          makePhase('Development', 'Build & Iterate', '#7dd3fc', '#0f172a', [
            makeStep('parallel', 'Feature Development', 'Develop features in parallel tracks', 'columns-2', [dev.id], { tracks: [{ id: createId(), label: 'Frontend', description: 'UI components', roleIds: [dev.id], items: [] }, { id: createId(), label: 'Backend', description: 'API & services', roleIds: [dev.id], items: [] }] }),
            makeStep('checklist', 'Code Review Checklist', 'Review code quality and standards', 'list-checks', [dev.id], { items: [{ id: createId(), text: 'Unit tests written', checked: false }, { id: createId(), text: 'Code review approved', checked: false }, { id: createId(), text: 'Documentation updated', checked: false }] }),
          ]),
          makePhase('Testing', 'Quality Assurance', '#38bdf8', '#0f172a', [
            makeStep('checklist', 'Test Execution', 'Run test suites and validate', 'list-checks', [qa.id], { items: [{ id: createId(), text: 'Unit tests pass', checked: false }, { id: createId(), text: 'Integration tests pass', checked: false }, { id: createId(), text: 'E2E tests pass', checked: false }] }),
            makeStep('risk', 'Risk Assessment', 'Identify and mitigate release risks', 'alert-triangle', [qa.id, pm.id], { severity: 'medium', risks: [{ id: createId(), text: 'Performance regression', mitigation: 'Load testing' }] }),
            makeStep('milestone', 'Release Candidate', 'RC sign-off', 'flag', [pm.id, qa.id], { status: 'not-started', deliverables: ['RC Build', 'Test Report'] }),
          ]),
          makePhase('Deploy', 'Release & Monitor', '#0ea5e9', '#ffffff', [
            makeStep('handoff', 'Deploy to Production', 'Hand off build to DevOps for deployment', 'arrow-right-left', [dev.id, devops.id], { fromTeam: 'Development', toTeam: 'DevOps', artifacts: ['Docker Image', 'Migration Scripts'] }),
            makeStep('metrics', 'Post-Deploy Monitoring', 'Track key performance indicators', 'bar-chart-3', [devops.id], { metrics: [{ id: createId(), label: 'Uptime', value: 99.9, target: 99.95, unit: '%', format: 'number' }, { id: createId(), label: 'Error Rate', value: 0.1, target: 0.5, unit: '%', format: 'number' }] }),
          ]),
        ],
        layout: { ...defaultLayout },
        backgroundColor: '#f0f9ff',
        connectors: [],
      };
    },
  },

  // ── Marketing Campaign ──
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute a multi-channel marketing campaign.',
    category: 'marketing',
    icon: 'megaphone',
    themeId: 'sunset-glow',
    build: (projectName, subtitle) => {
      const strategist = { id: createId(), name: 'Strategist', color: '#e11d48', textColor: '#ffffff' };
      const designer = { id: createId(), name: 'Designer', color: '#f59e0b', textColor: '#ffffff' };
      const writer = { id: createId(), name: 'Content Writer', color: '#8b5cf6', textColor: '#ffffff' };
      const analyst = { id: createId(), name: 'Analyst', color: '#0ea5e9', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#7f1d1d', textColor: '#fef2f2', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Poppins', sans-serif`, subtitleFontFamily: `'Open Sans', sans-serif` },
        roles: [strategist, designer, writer, analyst],
        phases: [
          makePhase('Strategy', 'Research & Planning', '#fef08a', '#450a0a', [
            makeStep('standard', 'Market Research', 'Analyze target audience and competitors', 'search', [strategist.id, analyst.id]),
            makeStep('decision', 'Channel Selection', 'Decide on marketing channels', 'scale', [strategist.id], { criteria: ['Budget', 'Reach', 'ROI potential'], outcome: 'pending' }),
            makeStep('timeline', 'Campaign Timeline', 'Map key dates and milestones', 'gantt-chart', [strategist.id], { entries: [{ id: createId(), label: 'Content Creation', startDate: '2025-01-01', endDate: '2025-01-20', color: '#f59e0b' }, { id: createId(), label: 'Launch', startDate: '2025-01-21', endDate: '2025-02-01', color: '#e11d48' }] }),
          ]),
          makePhase('Create', 'Content & Assets', '#fbbf24', '#450a0a', [
            makeStep('parallel', 'Content Production', 'Create assets in parallel', 'columns-2', [designer.id, writer.id], { tracks: [{ id: createId(), label: 'Visual Assets', description: 'Graphics, videos', roleIds: [designer.id], items: [] }, { id: createId(), label: 'Copy', description: 'Blog posts, ads, emails', roleIds: [writer.id], items: [] }] }),
            makeStep('collaboration', 'Creative Review', 'Review and iterate on content', 'refresh-cw', [strategist.id, designer.id, writer.id], { participants: [{ roleId: designer.id, action: 'Present' }, { roleId: strategist.id, action: 'Approve' }], iterative: true, finalActionTitle: 'Final Assets', finalItems: [] }),
          ]),
          makePhase('Launch', 'Execute Campaign', '#f59e0b', '#450a0a', [
            makeStep('checklist', 'Pre-Launch Checklist', 'Verify everything is ready', 'list-checks', [strategist.id], { items: [{ id: createId(), text: 'Landing page live', checked: false }, { id: createId(), text: 'Tracking pixels installed', checked: false }, { id: createId(), text: 'Email sequences scheduled', checked: false }] }),
            makeStep('milestone', 'Campaign Launch', 'Go live with the campaign', 'flag', [strategist.id], { status: 'not-started', deliverables: ['Live Ads', 'Email Blast'] }),
          ]),
          makePhase('Measure', 'Analytics & Optimize', '#ea580c', '#ffffff', [
            makeStep('metrics', 'Campaign KPIs', 'Track campaign performance', 'bar-chart-3', [analyst.id], { metrics: [{ id: createId(), label: 'CTR', value: 2.5, target: 3, unit: '%', format: 'number' }, { id: createId(), label: 'Conversions', value: 150, target: 500, unit: '', format: 'number' }, { id: createId(), label: 'ROI', value: 180, target: 300, unit: '%', format: 'number' }] }),
            makeStep('document', 'Campaign Report', 'Document results and learnings', 'file-text', [analyst.id, strategist.id], { documents: [{ id: createId(), name: 'Performance Report', docType: 'report' }, { id: createId(), name: 'Lessons Learned', docType: 'doc' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Poppins', sans-serif`, cardTitleFontFamily: `'Poppins', sans-serif`, cardContentFontFamily: `'Open Sans', sans-serif` },
        backgroundColor: '#fffbeb',
        connectors: [],
      };
    },
  },

  // ── HR Onboarding ──
  {
    id: 'hr-onboarding',
    name: 'Employee Onboarding',
    description: 'Structured onboarding process for new hires.',
    category: 'hr',
    icon: 'user-plus',
    themeId: 'forest-canopy',
    build: (projectName, subtitle) => {
      const hr = { id: createId(), name: 'HR Manager', color: '#22c55e', textColor: '#ffffff' };
      const manager = { id: createId(), name: 'Hiring Manager', color: '#3b82f6', textColor: '#ffffff' };
      const it = { id: createId(), name: 'IT Support', color: '#f59e0b', textColor: '#ffffff' };
      const buddy = { id: createId(), name: 'Buddy', color: '#ec4899', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#14532d', textColor: '#f0fdf4', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Merriweather', serif`, subtitleFontFamily: `'Lato', sans-serif` },
        roles: [hr, manager, it, buddy],
        phases: [
          makePhase('Pre-boarding', 'Before Day 1', '#dcfce7', '#064e3b', [
            makeStep('checklist', 'Admin Setup', 'Complete pre-arrival paperwork', 'list-checks', [hr.id], { items: [{ id: createId(), text: 'Offer letter signed', checked: false }, { id: createId(), text: 'Background check complete', checked: false }, { id: createId(), text: 'Benefits enrollment', checked: false }] }),
            makeStep('standard', 'Workspace Preparation', 'Set up desk, equipment, and access', 'monitor', [it.id, manager.id]),
            makeStep('document', 'Welcome Package', 'Prepare onboarding materials', 'file-text', [hr.id], { documents: [{ id: createId(), name: 'Employee Handbook', docType: 'doc' }, { id: createId(), name: 'Team Directory', docType: 'doc' }] }),
          ]),
          makePhase('Week 1', 'Orientation & Setup', '#bbf7d0', '#064e3b', [
            makeStep('meeting', 'Welcome Meeting', 'Introduction to team and company', 'calendar', [hr.id, manager.id], { agendaItems: ['Company overview', 'Team introductions', 'Tools walkthrough'], facilitator: hr.id, duration: '2 hours' }),
            makeStep('handoff', 'Buddy Assignment', 'Pair new hire with an onboarding buddy', 'arrow-right-left', [hr.id, buddy.id], { fromTeam: 'HR', toTeam: 'Team Buddy', artifacts: ['Buddy Guide'] }),
            makeStep('checklist', 'Day 1 Checklist', 'Essential first-day tasks', 'list-checks', [hr.id, it.id], { items: [{ id: createId(), text: 'Email account set up', checked: false }, { id: createId(), text: 'VPN access configured', checked: false }, { id: createId(), text: 'Slack channels joined', checked: false }, { id: createId(), text: 'First standup attended', checked: false }] }),
          ]),
          makePhase('Month 1', 'Ramp Up', '#86efac', '#064e3b', [
            makeStep('standard', 'Role-specific Training', 'Deep dive into job responsibilities', 'book-open', [manager.id]),
            makeStep('milestone', '30-Day Check-in', 'First formal review', 'flag', [manager.id, hr.id], { status: 'not-started', deliverables: ['30-Day Feedback Form'] }),
            makeStep('collaboration', 'Team Integration', 'Active participation in team activities', 'refresh-cw', [buddy.id, manager.id], { participants: [{ roleId: buddy.id, action: 'Guide' }, { roleId: manager.id, action: 'Evaluate' }], iterative: true, finalActionTitle: 'Integration Complete', finalItems: [] }),
          ]),
          makePhase('Month 3', 'Full Integration', '#4ade80', '#064e3b', [
            makeStep('milestone', '90-Day Review', 'Probation completion review', 'flag', [manager.id, hr.id], { status: 'not-started', deliverables: ['Performance Review', 'Goals Document'] }),
            makeStep('metrics', 'Onboarding Success', 'Measure onboarding effectiveness', 'bar-chart-3', [hr.id], { metrics: [{ id: createId(), label: 'Training Completion', value: 85, target: 100, unit: '%', format: 'progress' }, { id: createId(), label: 'Satisfaction Score', value: 4.2, target: 5, unit: '/5', format: 'number' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Merriweather', serif`, cardTitleFontFamily: `'Merriweather', serif`, cardContentFontFamily: `'Lato', sans-serif` },
        backgroundColor: '#f0fdf4',
        connectors: [],
      };
    },
  },

  // ── Product Launch ──
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'End-to-end product launch with go-to-market strategy.',
    category: 'operations',
    icon: 'rocket',
    themeId: 'corporate-clean',
    build: (projectName, subtitle) => {
      const pm = { id: createId(), name: 'Product Lead', color: '#6929c4', textColor: '#ffffff' };
      const eng = { id: createId(), name: 'Engineering', color: '#1192e8', textColor: '#ffffff' };
      const mkt = { id: createId(), name: 'Marketing', color: '#9f1853', textColor: '#ffffff' };
      const sales = { id: createId(), name: 'Sales', color: '#198038', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#161616', textColor: '#ffffff', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Montserrat', sans-serif`, subtitleFontFamily: `'Roboto', sans-serif` },
        roles: [pm, eng, mkt, sales],
        phases: [
          makePhase('Validate', 'Market Validation', '#6929c4', '#ffffff', [
            makeStep('standard', 'Customer Discovery', 'Interview potential customers', 'users', [pm.id]),
            makeStep('decision', 'Go / No-Go', 'Decide whether to proceed with launch', 'scale', [pm.id], { criteria: ['Market demand', 'Feasibility', 'Competition'], outcome: 'pending' }),
            makeStep('risk', 'Launch Risks', 'Identify potential risks', 'alert-triangle', [pm.id], { severity: 'medium', risks: [{ id: createId(), text: 'Market timing risk', mitigation: 'Competitive analysis' }, { id: createId(), text: 'Technical readiness', mitigation: 'Feature freeze deadline' }] }),
          ]),
          makePhase('Build', 'Product Development', '#1192e8', '#ffffff', [
            makeStep('parallel', 'Development Tracks', 'Build core features', 'columns-2', [eng.id], { tracks: [{ id: createId(), label: 'Core Product', description: 'MVP features', roleIds: [eng.id], items: [] }, { id: createId(), label: 'Launch Tools', description: 'Analytics, onboarding', roleIds: [eng.id], items: [] }] }),
            makeStep('milestone', 'Feature Freeze', 'Lock features for launch', 'flag', [pm.id, eng.id], { status: 'not-started', deliverables: ['Feature-complete build'] }),
          ]),
          makePhase('Prepare', 'Go-to-Market', '#9f1853', '#ffffff', [
            makeStep('parallel', 'GTM Preparation', 'Prepare marketing and sales materials', 'columns-2', [mkt.id, sales.id], { tracks: [{ id: createId(), label: 'Marketing', description: 'Launch assets', roleIds: [mkt.id], items: [] }, { id: createId(), label: 'Sales', description: 'Enablement materials', roleIds: [sales.id], items: [] }] }),
            makeStep('checklist', 'Launch Readiness', 'Final checks before launch', 'list-checks', [pm.id], { items: [{ id: createId(), text: 'Press release approved', checked: false }, { id: createId(), text: 'Pricing finalized', checked: false }, { id: createId(), text: 'Support team briefed', checked: false }, { id: createId(), text: 'Launch email ready', checked: false }] }),
          ]),
          makePhase('Launch', 'Go Live', '#198038', '#ffffff', [
            makeStep('milestone', 'Product Launch Day', 'Execute the launch', 'flag', [pm.id, mkt.id, sales.id], { status: 'not-started', deliverables: ['Live Product', 'Press Coverage'] }),
            makeStep('metrics', 'Launch Metrics', 'Track launch performance', 'bar-chart-3', [pm.id, mkt.id], { metrics: [{ id: createId(), label: 'Sign-ups', value: 0, target: 1000, unit: '', format: 'number' }, { id: createId(), label: 'Activation Rate', value: 0, target: 60, unit: '%', format: 'progress' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Montserrat', sans-serif`, cardTitleFontFamily: `'Montserrat', sans-serif`, cardContentFontFamily: `'Roboto', sans-serif` },
        backgroundColor: '#f4f4f4',
        connectors: [],
      };
    },
  },

  // ── Event Planning ──
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Organize and execute a successful event from concept to wrap-up.',
    category: 'operations',
    icon: 'calendar-days',
    themeId: 'berry-blast',
    build: (projectName, subtitle) => {
      const coordinator = { id: createId(), name: 'Event Coordinator', color: '#ec4899', textColor: '#ffffff' };
      const vendor = { id: createId(), name: 'Vendor Manager', color: '#f59e0b', textColor: '#ffffff' };
      const comms = { id: createId(), name: 'Communications', color: '#8b5cf6', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#831843', textColor: '#fdf2f8', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Poppins', sans-serif`, subtitleFontFamily: `'Open Sans', sans-serif` },
        roles: [coordinator, vendor, comms],
        phases: [
          makePhase('Concept', 'Vision & Budget', '#fce7f3', '#500724', [
            makeStep('standard', 'Event Brief', 'Define event goals, audience, and theme', 'lightbulb', [coordinator.id]),
            makeStep('estimation', 'Budget Estimation', 'Estimate costs for venue, catering, speakers', 'calculator', [coordinator.id], { method: 'hours', value: '', breakdown: [{ label: 'Venue', value: '' }, { label: 'Catering', value: '' }, { label: 'A/V', value: '' }] }),
          ]),
          makePhase('Plan', 'Logistics & Vendors', '#fbcfe8', '#500724', [
            makeStep('checklist', 'Vendor Booking', 'Book all required vendors', 'list-checks', [vendor.id], { items: [{ id: createId(), text: 'Venue confirmed', checked: false }, { id: createId(), text: 'Catering booked', checked: false }, { id: createId(), text: 'A/V setup arranged', checked: false }] }),
            makeStep('timeline', 'Event Timeline', 'Day-of schedule', 'gantt-chart', [coordinator.id], { entries: [{ id: createId(), label: 'Setup', startDate: '2025-03-01', endDate: '2025-03-01', color: '#ec4899' }, { id: createId(), label: 'Main Event', startDate: '2025-03-01', endDate: '2025-03-01', color: '#8b5cf6' }] }),
          ]),
          makePhase('Promote', 'Marketing & Registration', '#f9a8d4', '#500724', [
            makeStep('parallel', 'Promotion Channels', 'Spread the word', 'columns-2', [comms.id], { tracks: [{ id: createId(), label: 'Social Media', description: 'Posts and ads', roleIds: [comms.id], items: [] }, { id: createId(), label: 'Email Outreach', description: 'Invitations', roleIds: [comms.id], items: [] }] }),
            makeStep('metrics', 'Registration Tracking', 'Monitor sign-ups', 'bar-chart-3', [comms.id], { metrics: [{ id: createId(), label: 'Registrations', value: 0, target: 200, unit: '', format: 'number' }, { id: createId(), label: 'Capacity', value: 0, target: 100, unit: '%', format: 'progress' }] }),
          ]),
          makePhase('Execute', 'Event Day & Follow-up', '#f472b6', '#500724', [
            makeStep('milestone', 'Event Day', 'Execute the event', 'flag', [coordinator.id, vendor.id, comms.id], { status: 'not-started', deliverables: ['Successful Event'] }),
            makeStep('document', 'Post-Event Report', 'Document results and feedback', 'file-text', [coordinator.id], { documents: [{ id: createId(), name: 'Attendee Feedback', docType: 'report' }, { id: createId(), name: 'Budget Reconciliation', docType: 'report' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Poppins', sans-serif`, cardTitleFontFamily: `'Poppins', sans-serif`, cardContentFontFamily: `'Open Sans', sans-serif` },
        backgroundColor: '#fdf2f8',
        connectors: [],
      };
    },
  },

  // ── Design Sprint ──
  {
    id: 'design-sprint',
    name: 'Design Sprint',
    description: 'Five-day design sprint framework for rapid prototyping.',
    category: 'creative',
    icon: 'sparkles',
    themeId: 'midnight-neon',
    build: (projectName, subtitle) => {
      const facilitator = { id: createId(), name: 'Facilitator', color: '#818cf8', textColor: '#ffffff' };
      const designer = { id: createId(), name: 'Designer', color: '#a78bfa', textColor: '#ffffff' };
      const eng = { id: createId(), name: 'Engineer', color: '#6366f1', textColor: '#ffffff' };
      const researcher = { id: createId(), name: 'Researcher', color: '#c084fc', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#0f0a2e', textColor: '#e0e7ff', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Outfit', sans-serif`, subtitleFontFamily: `'Space Grotesk', sans-serif` },
        roles: [facilitator, designer, eng, researcher],
        phases: [
          makePhase('Day 1: Understand', 'Map & Define', '#312e81', '#ffffff', [
            makeStep('meeting', 'Expert Interviews', 'Learn from domain experts', 'calendar', [facilitator.id, researcher.id], { agendaItems: ['Problem space overview', 'User pain points', 'Business goals'], facilitator: facilitator.id, duration: '3 hours' }),
            makeStep('standard', 'Problem Mapping', 'Create a map of the problem space', 'map', [facilitator.id]),
          ]),
          makePhase('Day 2: Diverge', 'Sketch Solutions', '#4338ca', '#ffffff', [
            makeStep('standard', 'Lightning Demos', 'Review inspiring solutions from other products', 'zap', [facilitator.id]),
            makeStep('collaboration', 'Crazy 8s Sketching', 'Rapid sketching exercise', 'refresh-cw', [designer.id, eng.id], { participants: [{ roleId: designer.id, action: 'Sketch' }, { roleId: eng.id, action: 'Sketch' }], iterative: false, finalActionTitle: 'Solution Sketches', finalItems: [] }),
          ]),
          makePhase('Day 3: Decide', 'Vote & Storyboard', '#6366f1', '#ffffff', [
            makeStep('decision', 'Solution Vote', 'Vote on the best solution', 'scale', [facilitator.id, designer.id, eng.id], { criteria: ['Feasibility', 'Impact', 'User value'], outcome: 'pending' }),
            makeStep('standard', 'Storyboard', 'Create a detailed storyboard of chosen solution', 'layout', [designer.id]),
          ]),
          makePhase('Day 4: Prototype', 'Build It', '#818cf8', '#ffffff', [
            makeStep('parallel', 'Prototype Tracks', 'Build a realistic prototype', 'columns-2', [designer.id, eng.id], { tracks: [{ id: createId(), label: 'UI Prototype', description: 'High-fidelity mockups', roleIds: [designer.id], items: [] }, { id: createId(), label: 'Content', description: 'Realistic copy and data', roleIds: [eng.id], items: [] }] }),
          ]),
          makePhase('Day 5: Test', 'User Validation', '#a5b4fc', '#312e81', [
            makeStep('meeting', 'User Testing', 'Test prototype with real users', 'calendar', [researcher.id], { agendaItems: ['5 user interviews', 'Record observations', 'Note patterns'], facilitator: researcher.id, duration: 'Full day' }),
            makeStep('document', 'Sprint Results', 'Document findings and next steps', 'file-text', [facilitator.id, researcher.id], { documents: [{ id: createId(), name: 'Test Results', docType: 'report' }, { id: createId(), name: 'Next Steps', docType: 'doc' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Outfit', sans-serif`, cardTitleFontFamily: `'Outfit', sans-serif`, cardContentFontFamily: `'Space Grotesk', sans-serif` },
        backgroundColor: '#1e1b4b',
        connectors: [],
      };
    },
  },

  // ── Content Pipeline ──
  {
    id: 'content-pipeline',
    name: 'Content Pipeline',
    description: 'Manage content creation from ideation to publication.',
    category: 'creative',
    icon: 'pen-tool',
    themeId: 'warm-earth',
    build: (projectName, subtitle) => {
      const editor = { id: createId(), name: 'Editor', color: '#b45309', textColor: '#ffffff' };
      const writer = { id: createId(), name: 'Writer', color: '#d97706', textColor: '#ffffff' };
      const designer = { id: createId(), name: 'Designer', color: '#f59e0b', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#451a03', textColor: '#fef3c7', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Playfair Display', serif`, subtitleFontFamily: `'Lato', sans-serif` },
        roles: [editor, writer, designer],
        phases: [
          makePhase('Ideation', 'Content Planning', '#fef3c7', '#451a03', [
            makeStep('standard', 'Content Calendar', 'Plan topics and publication dates', 'calendar', [editor.id]),
            makeStep('standard', 'Keyword Research', 'Identify target keywords and topics', 'search', [writer.id]),
          ]),
          makePhase('Create', 'Writing & Design', '#fde68a', '#451a03', [
            makeStep('standard', 'Draft Writing', 'Create first draft of content', 'pen-tool', [writer.id]),
            makeStep('standard', 'Visual Assets', 'Create supporting graphics', 'image', [designer.id]),
            makeStep('collaboration', 'Editorial Review', 'Review and refine content', 'refresh-cw', [editor.id, writer.id], { participants: [{ roleId: editor.id, action: 'Review' }, { roleId: writer.id, action: 'Revise' }], iterative: true, finalActionTitle: 'Approved Content', finalItems: [] }),
          ]),
          makePhase('Publish', 'Distribution', '#fcd34d', '#451a03', [
            makeStep('checklist', 'Publish Checklist', 'Final checks before publishing', 'list-checks', [editor.id], { items: [{ id: createId(), text: 'SEO meta tags set', checked: false }, { id: createId(), text: 'Social previews checked', checked: false }, { id: createId(), text: 'Links verified', checked: false }] }),
            makeStep('milestone', 'Go Live', 'Publish content', 'flag', [editor.id], { status: 'not-started', deliverables: ['Published Article'] }),
          ]),
          makePhase('Measure', 'Performance', '#f59e0b', '#451a03', [
            makeStep('metrics', 'Content Metrics', 'Track content performance', 'bar-chart-3', [editor.id], { metrics: [{ id: createId(), label: 'Page Views', value: 0, target: 5000, unit: '', format: 'number' }, { id: createId(), label: 'Engagement', value: 0, target: 10, unit: '%', format: 'progress' }] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Playfair Display', serif`, cardTitleFontFamily: `'Playfair Display', serif`, cardContentFontFamily: `'Lato', sans-serif` },
        backgroundColor: '#fffbeb',
        connectors: [],
      };
    },
  },

  // ── Bug Triage ──
  {
    id: 'bug-triage',
    name: 'Bug Triage & Resolution',
    description: 'Systematic bug tracking from report to resolution.',
    category: 'software',
    icon: 'bug',
    themeId: 'monochrome-slate',
    build: (projectName, subtitle) => {
      const reporter = { id: createId(), name: 'Reporter', color: '#64748b', textColor: '#ffffff' };
      const triager = { id: createId(), name: 'Triager', color: '#6366f1', textColor: '#ffffff' };
      const dev = { id: createId(), name: 'Developer', color: '#3b82f6', textColor: '#ffffff' };
      const qa = { id: createId(), name: 'QA', color: '#22c55e', textColor: '#ffffff' };
      return {
        id: createId(),
        titleBar: { text: projectName, subtitle, backgroundColor: '#1e293b', textColor: '#f1f5f9', fontSize: 24, subtitleFontSize: 14, alignment: 'center', logoUrl: '', titleFontFamily: `'Space Grotesk', sans-serif`, subtitleFontFamily: `'Inter', sans-serif` },
        roles: [reporter, triager, dev, qa],
        phases: [
          makePhase('Report', 'Bug Discovery', '#f1f5f9', '#0f172a', [
            makeStep('standard', 'Bug Report', 'Document the issue with steps to reproduce', 'bug', [reporter.id]),
            makeStep('document', 'Evidence', 'Attach screenshots and logs', 'file-text', [reporter.id], { documents: [{ id: createId(), name: 'Screenshot', docType: 'image' }, { id: createId(), name: 'Error Log', docType: 'log' }] }),
          ]),
          makePhase('Triage', 'Prioritize & Assign', '#e2e8f0', '#0f172a', [
            makeStep('risk', 'Severity Assessment', 'Determine impact and urgency', 'alert-triangle', [triager.id], { severity: 'medium', risks: [{ id: createId(), text: 'User-facing impact', mitigation: '' }] }),
            makeStep('decision', 'Priority Assignment', 'Decide fix priority', 'scale', [triager.id], { criteria: ['Severity', 'User impact', 'Fix complexity'], outcome: 'pending' }),
            makeStep('handoff', 'Assign to Developer', 'Hand off to engineering', 'arrow-right-left', [triager.id, dev.id], { fromTeam: 'Triage', toTeam: 'Engineering', artifacts: ['Bug Report'] }),
          ]),
          makePhase('Fix', 'Development & Test', '#cbd5e1', '#0f172a', [
            makeStep('standard', 'Root Cause Analysis', 'Identify the underlying issue', 'search', [dev.id]),
            makeStep('standard', 'Implement Fix', 'Write and submit the fix', 'code-2', [dev.id]),
            makeStep('checklist', 'Verification', 'Verify the fix works', 'list-checks', [qa.id], { items: [{ id: createId(), text: 'Bug no longer reproducible', checked: false }, { id: createId(), text: 'No regression introduced', checked: false }, { id: createId(), text: 'Edge cases tested', checked: false }] }),
          ]),
          makePhase('Close', 'Deploy & Verify', '#94a3b8', '#0f172a', [
            makeStep('milestone', 'Deployed', 'Fix deployed to production', 'flag', [dev.id], { status: 'not-started', deliverables: ['Hotfix Release'] }),
          ]),
        ],
        layout: { ...defaultLayout, phaseTitleFontFamily: `'Space Grotesk', sans-serif`, cardTitleFontFamily: `'Space Grotesk', sans-serif`, cardContentFontFamily: `'Inter', sans-serif` },
        backgroundColor: '#f8fafc',
        connectors: [],
      };
    },
  },
];
