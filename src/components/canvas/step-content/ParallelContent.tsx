import React from 'react';
import type { Step, RoleDefinition, ParallelData } from '../../../types';
import { RoleBadge } from '../RoleBadge';
import { GitBranch } from 'lucide-react';

interface Props {
  step: Step & { type: 'parallel'; data: ParallelData };
  roles: RoleDefinition[];
}

export const ParallelContent: React.FC<Props> = ({ step, roles }) => {
  const { tracks } = step.data;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 mb-1">
        <GitBranch size={9} className="text-violet-400" />
        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Parallel Tracks</span>
      </div>
      <div className="flex gap-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex-1 rounded-lg p-1.5 border border-current/10 shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
          >
            <div className="card-text font-bold mb-0.5 text-center truncate" title={track.label}>{track.label}</div>
            <p className="card-text leading-tight text-center text-slate-600">{track.description}</p>
            {track.roleIds.length > 0 && (
              <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center">
                {track.roleIds.map((rid) => {
                  const role = roles.find((r) => r.id === rid);
                  return role ? (
                    <RoleBadge key={rid} name={role.name} color={role.color} textColor={role.textColor} size="sm" />
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
