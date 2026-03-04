import React from 'react';
import type { Step, RoleDefinition, DecisionData } from '../../../types';

const STATUS_STYLES = {
  pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  approved: { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
  rejected: { bg: '#fecaca', text: '#991b1b', label: 'Rejected' },
};

interface Props {
  step: Step & { type: 'decision'; data: DecisionData };
  roles: RoleDefinition[];
}

export const DecisionContent: React.FC<Props> = ({ step }) => {
  const { criteria, outcome } = step.data;
  const status = outcome ? STATUS_STYLES[outcome] : STATUS_STYLES.pending;
  return (
    <div className="space-y-1">
      {criteria.length > 0 && (
        <ul className="space-y-0.5 ml-1">
          {criteria.map((c, i) => (
            <li key={i} className="flex items-center gap-1 card-text">
              <span className="opacity-50">☐</span> {c}
            </li>
          ))}
        </ul>
      )}
      {outcome && (
        <span
          className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          {status.label}
        </span>
      )}
    </div>
  );
};
