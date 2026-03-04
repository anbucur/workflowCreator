import React from 'react';
import type { Step, RoleDefinition, HandoffData } from '../../../types';

interface Props {
  step: Step & { type: 'handoff'; data: HandoffData };
  roles: RoleDefinition[];
}

export const HandoffContent: React.FC<Props> = ({ step }) => {
  const { fromTeam, toTeam, artifacts } = step.data;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 card-text font-semibold mt-1">
        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{fromTeam}</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">{toTeam}</span>
      </div>
      {artifacts.length > 0 && (
        <ul className="space-y-0.5 ml-1 mt-1">
          {artifacts.map((a, i) => (
            <li key={i} className="card-text">📦 {a}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
