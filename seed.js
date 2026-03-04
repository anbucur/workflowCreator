import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'workflow.sqlite');

const db = new sqlite3.Database(dbPath);

// From defaults.ts
function createId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function createRole(name, color, textColor = '#ffffff') {
    return { id: createId(), name, color, textColor };
}

function getDefaultStepData(type) {
    switch (type) {
        case 'standard': return undefined;
        case 'meeting': return { agendaItems: ['Agenda item 1'], facilitator: '', duration: '1 hour' };
        case 'decision': return { criteria: ['Criteria 1'], outcome: 'pending' };
        case 'parallel': return { tracks: [{ id: createId(), label: 'Track A', description: 'Description', roleIds: [] }, { id: createId(), label: 'Track B', description: 'Description', roleIds: [] }] };
        case 'checklist': return { items: [{ id: createId(), text: 'Item 1', checked: false }] };
        case 'handoff': return { fromTeam: 'Team A', toTeam: 'Team B', artifacts: ['Deliverable 1'] };
        case 'milestone': return { status: 'not-started', deliverables: ['Deliverable 1'] };
        case 'document': return { documents: [{ id: createId(), name: 'Document 1', docType: 'spec' }] };
        case 'estimation': return { method: 'tshirt', value: 'M', breakdown: [] };
        case 'collaboration': return { participants: [{ roleId: '', action: 'Action 1' }], iterative: true };
        case 'timeline': return { entries: [{ id: createId(), label: 'Task 1', startDate: '2025-01-01', endDate: '2025-01-15', color: '#3b82f6' }] };
        case 'risk': return { severity: 'medium', risks: [{ id: createId(), text: 'Risk 1', mitigation: '' }] };
        case 'metrics': return { metrics: [{ id: createId(), label: 'Metric 1', value: 50, target: 100, unit: '%' }] };
    }
}

function createStep(type = 'standard', overrides) {
    const icons = { meeting: 'calendar', decision: 'scale', parallel: 'columns-2', checklist: 'list-checks', handoff: 'arrow-right-left', milestone: 'flag', document: 'file-text', estimation: 'calculator', collaboration: 'refresh-cw', timeline: 'gantt-chart', risk: 'alert-triangle', metrics: 'bar-chart-3' };
    const base = {
        id: createId(),
        title: 'New Step',
        description: 'Step description',
        iconName: type === 'standard' ? 'circle-dot' : icons[type] || 'circle-dot',
        roleIds: [],
        type,
        ...overrides,
    };
    const data = getDefaultStepData(type);
    if (data) Object.assign(base, { data });
    return base;
}

function createPhase(overrides) {
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

const ba = createRole('BA', '#6366f1');
const dev = createRole('DEV', '#22c55e');
const qa = createRole('QA', '#f97316');

const data = {
    id: createId(),
    titleBar: {
        text: 'The SDLC Collaboration Framework',
        subtitle: 'A 4-Phase Roadmap for BA, DEV, and QA',
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
        fontSize: 24,
    },
    roles: [ba, dev, qa],
    backgroundColor: '#f8fafc',
    layout: { direction: 'horizontal', phaseGap: 12, stepGap: 10, padding: 20, phaseMinWidth: 280, cornerRadius: 12 },
    phases: [
        createPhase({
            title: 'Phase 1: Pre-Dev Alignment & Scoping',
            subtitle: 'Establishing the Business Need & High-Level Planning',
            backgroundColor: '#fef3c7',
            textColor: '#92400e',
            steps: [
                createStep('meeting', { title: 'Establishing the Business Need', description: 'The BA hosts a session to present the feature while Developers and QA ask clarifying questions to ensure the scope and business rules are fully understood before technical planning.', roleIds: [ba.id, dev.id, qa.id], data: { agendaItems: ['Feature presentation by BA', 'Scope clarification Q&A', 'Business rules review'], facilitator: 'BA', duration: '1 hour' } }),
                createStep('estimation', { title: 'T-Shirt Sizing & Release Strategy', description: 'The team performs T-shirt sizing to estimate effort and determines if the work is a non-release item or if it requires a specific fix version.', roleIds: [dev.id, qa.id], data: { method: 'tshirt', value: '', breakdown: [{ label: 'Dev Effort', value: 'M' }, { label: 'QA Effort', value: 'S' }] } }),
                createStep('decision', { title: 'DRR Check', description: 'Design Readiness Review checkpoint.', roleIds: [ba.id, dev.id, qa.id], data: { criteria: ['Requirements documented', 'Scope agreed', 'Estimates complete'], outcome: 'pending' } }),
                createStep('standard', { title: 'Resource Allocation', description: 'Assignment of the feature to Dev and QA resources. In the case of complex features, multiple resources can be assigned.', roleIds: [dev.id, qa.id] }),
            ],
        }),
        createPhase({
            title: 'Phase 2: Technical Design & QA Planning',
            subtitle: 'Deep-Dive Technical & Test Design (Parallel Tracks)',
            backgroundColor: '#d1fae5',
            textColor: '#065f46',
            steps: [
                createStep('meeting', { title: 'Technical Review', description: 'Developers and QA review requirements, actively clarifying business requirements with the BA team to ensure technical plans align with business needs.', roleIds: [ba.id, dev.id, qa.id], data: { agendaItems: ['Requirements walkthrough', 'Technical feasibility', 'Integration points'], facilitator: 'DEV Lead', duration: '1.5 hours' } }),
                createStep('parallel', { title: 'Parallel Execution Tracks', description: 'Development and QA work simultaneously on their respective tracks.', roleIds: [dev.id, qa.id], data: { tracks: [{ id: createId(), label: 'DEV Track', description: 'User story creation — Developers create User Stories and technical designs.', roleIds: [dev.id] }, { id: createId(), label: 'QA Track', description: 'Test scenario & estimation — QA builds Test Scenarios and estimations.', roleIds: [qa.id] }] } }),
                createStep('decision', { title: 'DRR Check', description: 'Design Readiness Review after technical design.', roleIds: [ba.id, dev.id, qa.id], data: { criteria: ['Technical design approved', 'Test scenarios ready', 'Estimates finalized'], outcome: 'pending' } }),
            ],
        }),
        createPhase({
            title: 'Phase 3: Backlog Readiness',
            subtitle: 'Refinement & Shared Understanding',
            backgroundColor: '#dbeafe',
            textColor: '#1e40af',
            steps: [
                createStep('checklist', { title: 'Technical Refinement', description: 'Dev Cross-Check and Final Estimation — Developers review the created user stories and refine technical details to finalize estimations.', roleIds: [dev.id], data: { items: [{ id: createId(), text: 'Review user stories', checked: false }, { id: createId(), text: 'Refine technical details', checked: false }, { id: createId(), text: 'Finalize estimations', checked: false }] } }),
                createStep('decision', { title: 'DRR Check', description: 'Final design readiness review before sprint planning.', roleIds: [ba.id, dev.id, qa.id], data: { criteria: ['Stories refined', 'Estimations final', 'Dependencies identified'], outcome: 'pending' } }),
                createStep('meeting', { title: 'Planning Session', description: 'Planning work for next sprint — A critical meeting where BA, DEV, and QA collaborate to plan and define the work going into the next Sprint backlog.', roleIds: [ba.id, dev.id, qa.id], data: { agendaItems: ['Sprint capacity review', 'Story prioritization', 'Commitment discussion', 'Sprint goal definition'], facilitator: 'Scrum Master', duration: '2 hours' } }),
            ],
        }),
        createPhase({
            title: 'Phase 4: Build Phase',
            subtitle: 'Execution, Validation, & Final Hand-off',
            backgroundColor: '#fce7f3',
            textColor: '#9d174d',
            steps: [
                createStep('standard', { title: 'Development', description: 'Developers write the code and build the feature according to the refined stories and technical designs.', roleIds: [dev.id] }),
                createStep('collaboration', { title: 'QA Testing and Bug Resolution', description: 'QA executes planned scenarios against the build, engaging in active back-and-forth collaboration with developers to resolve any identified bugs.', roleIds: [dev.id, qa.id], data: { participants: [{ roleId: qa.id, action: 'Executes test scenarios' }, { roleId: dev.id, action: 'Resolves identified bugs' }], iterative: true } }),
                createStep('milestone', { title: '"Done" Status', description: 'Once the feature passes all tests and meets the shared understanding of the team, it is marked as completed.', roleIds: [qa.id], data: { status: 'not-started', deliverables: ['Feature passes all tests', 'Meets acceptance criteria', 'Team sign-off complete'] } }),
            ],
        }),
    ],
};

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, data TEXT)`);
    db.run(
        `INSERT INTO workflows (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
        ['main', JSON.stringify(data)],
        (err) => {
            if (err) console.error(err);
            else console.log("Mock data inserted successfully into DB");
            db.close();
        }
    );
});
