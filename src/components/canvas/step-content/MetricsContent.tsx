import React from 'react';
import type { Step, RoleDefinition, MetricsData } from '../../../types';

interface Props {
  step: Step & { type: 'metrics'; data: MetricsData };
  roles: RoleDefinition[];
}

export const MetricsContent: React.FC<Props> = ({ step }) => {
  const { metrics } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="space-y-1.5 mt-1">
        {metrics.map((m) => {
          const pct = m.target ? Math.min((m.value / m.target) * 100, 100) : 0;
          return (
            <div key={m.id}>
              <div className="flex justify-between text-[9px]">
                <span className="opacity-70">{m.label}</span>
                <span className="font-semibold">
                  {m.value}{m.target ? `/${m.target}` : ''} {m.unit}
                </span>
              </div>
              {m.format === 'progress' && m.target && (
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              )}
              {m.format === 'badge' && (
                <span
                  className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    backgroundColor: pct >= 80 ? '#d1fae5' : pct >= 50 ? '#fef3c7' : '#fecaca',
                    color: pct >= 80 ? '#065f46' : pct >= 50 ? '#92400e' : '#991b1b',
                  }}
                >
                  {m.value} {m.unit}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
