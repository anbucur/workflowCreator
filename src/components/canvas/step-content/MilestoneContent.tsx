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
  const statusStyle = STATUS_STYLES[status];
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <span
          className="text-[8px] font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
        {targetDate && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            📅 {targetDate}
          </span>
        )}
      </div>
      {deliverables.length > 0 && (
        <ul className="text-[9px] space-y-0.5 ml-1 mt-1 opacity-70">
          {deliverables.map((d, i) => (
            <li key={i}>✓ {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
