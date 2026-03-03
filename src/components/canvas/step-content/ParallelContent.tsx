import React from 'react';
import type { Step, RoleDefinition, ParallelData } from '../../../types';
import { RoleBadge } from '../RoleBadge';

interface Props {
  step: Step & { type: 'parallel'; data: ParallelData };
  roles: RoleDefinition[];
}

export const ParallelContent: React.FC<Props> = ({ step, roles }) => {
  const { tracks } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="flex gap-2 mt-1">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex-1 rounded p-1.5 border border-current/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          >
            <div className="font-semibold text-[9px] mb-0.5">{track.label}</div>
            <p className="text-[8px] opacity-70 leading-tight">{track.description}</p>
            <div className="flex gap-0.5 mt-1 flex-wrap">
              {track.roleIds.map((rid) => {
                const role = roles.find((r) => r.id === rid);
                return role ? (
                  <RoleBadge key={rid} name={role.name} color={role.color} textColor={role.textColor} size="sm" />
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
