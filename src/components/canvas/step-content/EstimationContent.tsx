import React from 'react';
import type { Step, RoleDefinition, EstimationData } from '../../../types';

const TSHIRT_COLORS: Record<string, { backgroundColor: string; color: string }> = {
  XS: { backgroundColor: '#dbeafe', color: '#1e40af' },
  S: { backgroundColor: '#d1fae5', color: '#065f46' },
  M: { backgroundColor: '#fef3c7', color: '#92400e' },
  L: { backgroundColor: '#fed7aa', color: '#9a3412' },
  XL: { backgroundColor: '#fecaca', color: '#991b1b' },
  XXL: { backgroundColor: '#e9d5ff', color: '#6b21a8' },
};

interface Props {
  step: Step & { type: 'estimation'; data: EstimationData };
  roles: RoleDefinition[];
}

export const EstimationContent: React.FC<Props> = ({ step }) => {
  const { method, value, breakdown } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      {value && method === 'tshirt' && (
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1"
          style={TSHIRT_COLORS[value.toUpperCase()] || { backgroundColor: '#e2e8f0', color: '#475569' }}
        >
          {value.toUpperCase()}
        </span>
      )}
      {value && method !== 'tshirt' && (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 mt-1">
          {value} {method === 'points' ? 'pts' : method === 'hours' ? 'hrs' : ''}
        </span>
      )}
      {breakdown && breakdown.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {breakdown.map((b, i) => (
            <div key={i} className="flex justify-between text-[8px]">
              <span className="opacity-70">{b.label}</span>
              <span
                className="font-semibold px-1 rounded"
                style={
                  method === 'tshirt'
                    ? TSHIRT_COLORS[b.value.toUpperCase()] || { backgroundColor: '#e2e8f0', color: '#475569' }
                    : { backgroundColor: '#e2e8f0', color: '#475569' }
                }
              >
                {b.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
