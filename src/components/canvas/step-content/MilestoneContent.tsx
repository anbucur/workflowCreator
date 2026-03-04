import React from 'react';
import type { Step, RoleDefinition, MilestoneData } from '../../../types';

const STATUS_STYLES = {
  'not-started': { bg: '#e2e8f0', text: '#475569', label: 'Not Started' },
  'in-progress': { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
  'completed': { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
};

interface Props {
  step: Step & { type: 'milestone'; data: MilestoneData };
  roles: RoleDefinition[];
}

export const MilestoneContent: React.FC<Props> = ({ step }) => {
  const { status, targetDate, deliverables } = step.data;

  if (status === 'none' && !targetDate && deliverables.length === 0) {
    return null;
  }

  const statusStyle = status !== 'none' ? STATUS_STYLES[status] : null;

  return (
    <div className="space-y-1">
      {(status !== 'none' || targetDate) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusStyle && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
            >
              {statusStyle.label}
            </span>
          )}
          {targetDate && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              📅 {targetDate}
            </span>
          )}
        </div>
      )}
      {deliverables.length > 0 && (
        <ul className="space-y-0.5 ml-1 mt-1">
          {deliverables.map((d, i) => (
            <li key={i} className="card-text">✓ {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
