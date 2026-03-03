import React from 'react';
import type { Step, RoleDefinition, TimelineData } from '../../../types';

interface Props {
  step: Step & { type: 'timeline'; data: TimelineData };
  roles: RoleDefinition[];
}

export const TimelineContent: React.FC<Props> = ({ step }) => {
  const { entries } = step.data;
  if (entries.length === 0) return <p className="text-[10px] opacity-80">{step.description}</p>;

  // Calculate date range
  const allDates = entries.flatMap((e) => [new Date(e.startDate).getTime(), new Date(e.endDate).getTime()]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const range = maxDate - minDate || 1;

  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="space-y-1 mt-1">
        {entries.map((entry) => {
          const start = ((new Date(entry.startDate).getTime() - minDate) / range) * 100;
          const width = ((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / range) * 100;
          return (
            <div key={entry.id} className="relative">
              <div className="text-[8px] opacity-70 mb-0.5">{entry.label}</div>
              <div className="w-full h-3 bg-gray-100 rounded-sm relative overflow-hidden">
                <div
                  className="absolute h-full rounded-sm"
                  style={{
                    left: `${start}%`,
                    width: `${Math.max(width, 5)}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[7px] opacity-50 mt-0.5">
                <span>{entry.startDate}</span>
                <span>{entry.endDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
