import React from 'react';
import type { Step, RoleDefinition, MeetingData } from '../../../types';

interface Props {
  step: Step & { type: 'meeting'; data: MeetingData };
  roles: RoleDefinition[];
}

export const MeetingContent: React.FC<Props> = ({ step }) => {
  const { agendaItems, facilitator, duration } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      {agendaItems.length > 0 && (
        <ol className="list-decimal list-inside text-[9px] space-y-0.5 ml-1 opacity-70">
          {agendaItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      )}
      <div className="flex gap-1 flex-wrap mt-1">
        {facilitator && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
            👤 {facilitator}
          </span>
        )}
        {duration && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            ⏱ {duration}
          </span>
        )}
      </div>
    </div>
  );
};
