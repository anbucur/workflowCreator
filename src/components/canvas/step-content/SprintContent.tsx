import React from 'react';
import type { Step, RoleDefinition, SprintData, SprintStoryStatus } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';

interface Props {
  step: Step & { type: 'sprint'; data: SprintData };
  roles: RoleDefinition[];
}

const STATUS_COLORS: Record<SprintStoryStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  in_review: '#8b5cf6',
  done: '#22c55e',
};

const STATUS_LABELS: Record<SprintStoryStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const SprintContent: React.FC<Props> = ({ step }) => {
  const { sprintName, startDate, endDate, velocityTarget, stories } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const contentFontFamily = layout.cardContentFontFamily || "'Inter', sans-serif";
  const contentFontSize = layout.cardContentFontSize || 13;
  const contentColor = layout.cardContentColor || '#334155';

  const donePoints = stories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.points, 0);
  const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);
  const velocityPct = velocityTarget > 0 ? Math.min((donePoints / velocityTarget) * 100, 100) : 0;

  const statusGroups: Record<SprintStoryStatus, number> = {
    todo: stories.filter(s => s.status === 'todo').length,
    in_progress: stories.filter(s => s.status === 'in_progress').length,
    in_review: stories.filter(s => s.status === 'in_review').length,
    done: stories.filter(s => s.status === 'done').length,
  };

  return (
    <div className="space-y-2 mt-1">
      {/* Sprint header */}
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize}px`, color: contentColor, fontWeight: 600 }}>
          {sprintName}
        </span>
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>
          {startDate} → {endDate}
        </span>
      </div>

      {/* Velocity bar */}
      <div>
        <div className="flex justify-between mb-0.5">
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: contentFontFamily }}>Velocity</span>
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: contentFontFamily }}>{donePoints}/{velocityTarget} pts</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${velocityPct}%` }} />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="flex gap-1 flex-wrap">
        {(Object.keys(statusGroups) as SprintStoryStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] + '22' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
            <span style={{ fontSize: '9px', color: STATUS_COLORS[s], fontFamily: contentFontFamily }}>
              {STATUS_LABELS[s]}: {statusGroups[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Stories list */}
      <div className="space-y-0.5">
        {stories.slice(0, 5).map((story) => (
          <div key={story.id} className="flex items-center gap-1.5 py-0.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[story.status] }} />
            <span
              className="flex-1 truncate"
              style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 1}px`, color: contentColor,
                textDecoration: story.status === 'done' ? 'line-through' : 'none', opacity: story.status === 'done' ? 0.6 : 1 }}
            >
              {story.title}
            </span>
            <span
              className="flex-shrink-0 font-mono font-bold px-1 py-0.5 rounded text-xs"
              style={{ fontSize: '9px', backgroundColor: '#f1f5f9', color: '#64748b' }}
            >
              {story.points}
            </span>
          </div>
        ))}
        {stories.length > 5 && (
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>+{stories.length - 5} more stories</div>
        )}
      </div>

      <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: contentFontFamily }}>
        {totalPoints} total pts · {stories.length} stories
      </div>
    </div>
  );
};
