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
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="flex items-center gap-1 text-[10px] font-semibold mt-1">
        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{fromTeam}</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">{toTeam}</span>
      </div>
      {artifacts.length > 0 && (
        <ul className="text-[9px] space-y-0.5 ml-1 mt-1 opacity-70">
          {artifacts.map((a, i) => (
            <li key={i}>📦 {a}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
