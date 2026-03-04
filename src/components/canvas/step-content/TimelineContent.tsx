import React from 'react';
import type { Step, RoleDefinition, TimelineData } from '../../../types';

interface Props {
  step: Step & { type: 'timeline'; data: TimelineData };
  roles: RoleDefinition[];
}

export const TimelineContent: React.FC<Props> = ({ step }) => {
  const { entries } = step.data;
  if (entries.length === 0) return null;

  const allDates = entries.flatMap((e) => [new Date(e.startDate).getTime(), new Date(e.endDate).getTime()]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const range = maxDate - minDate || 1;

  return (
    <div className="space-y-1">
      <div className="space-y-1 mt-1">
        {entries.map((entry) => {
          const start = ((new Date(entry.startDate).getTime() - minDate) / range) * 100;
          const width = ((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / range) * 100;
          return (
            <div key={entry.id} className="relative">
              <div className="card-text opacity-70 mb-0.5">{entry.label}</div>
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
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
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
