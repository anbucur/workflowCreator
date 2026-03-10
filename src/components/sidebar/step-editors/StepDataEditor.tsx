import React from 'react';
import type { Step } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { useThemeStore } from '../../../store/useThemeStore';
import {
    MeetingEditor,
    DecisionEditor,
    ParallelEditor,
    ChecklistEditor,
    HandoffEditor,
    MilestoneEditor,
    DocumentEditor,
    CollaborationEditor,
    TimelineEditor,
    RiskEditor,
    MetricsEditor,
    EstimationEditor,
    KanbanEditor,
    SprintEditor,
    RoadmapEditor,
} from './editors';

interface Props {
    step: Step;
    phaseId: string;
}

export const StepDataEditor: React.FC<Props> = ({ step, phaseId }) => {
    const updateStep = useInfographicStore((s) => s.updateStep);
    const isDarkMode = useThemeStore((s) => s.isDarkMode);

    const updateData = (newData: any) => {
        updateStep(phaseId, step.id, { data: { ...(step as any).data, ...newData } } as any);
    };

    const renderEditor = () => {
        const commonProps = { step, phaseId, updateData };

        switch (step.type) {
            case 'meeting':
                return <MeetingEditor {...commonProps} />;
            case 'decision':
                return <DecisionEditor {...commonProps} />;
            case 'parallel':
                return <ParallelEditor {...commonProps} />;
            case 'checklist':
                return <ChecklistEditor {...commonProps} />;
            case 'handoff':
                return <HandoffEditor {...commonProps} />;
            case 'milestone':
                return <MilestoneEditor {...commonProps} />;
            case 'document':
                return <DocumentEditor {...commonProps} />;
            case 'collaboration':
                return <CollaborationEditor {...commonProps} />;
            case 'timeline':
                return <TimelineEditor {...commonProps} />;
            case 'risk':
                return <RiskEditor {...commonProps} />;
            case 'metrics':
                return <MetricsEditor {...commonProps} />;
            case 'estimation':
                return <EstimationEditor {...commonProps} />;
            case 'kanban':
                return <KanbanEditor {...commonProps} />;
            case 'sprint':
                return <SprintEditor {...commonProps} />;
            case 'roadmap':
                return <RoadmapEditor {...commonProps} />;
            default:
                return null;
        }
    };

    const editor = renderEditor();

    if (!editor) return null;

    return (
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
            <h3 className={`text-sm font-semibold capitalize transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {step.type} Data
            </h3>
            {editor}
        </div>
    );
};
