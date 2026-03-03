import React from 'react';
import type { Step, RoleDefinition, CollaborationData } from '../../../types';
import { RoleBadge } from '../RoleBadge';

interface Props {
  step: Step & { type: 'collaboration'; data: CollaborationData };
  roles: RoleDefinition[];
}

export const CollaborationContent: React.FC<Props> = ({ step, roles }) => {
  const { participants, iterative } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <div className="space-y-1 mt-1">
        {participants.map((p, i) => {
          const role = roles.find((r) => r.id === p.roleId);
          return (
            <div key={i} className="flex items-center gap-1.5 text-[9px]">
              {role && <RoleBadge name={role.name} color={role.color} textColor={role.textColor} size="sm" />}
              <span className="opacity-80">{p.action}</span>
              {i < participants.length - 1 && (
                <span className="text-[8px] opacity-40 ml-auto">{iterative ? '↻' : '→'}</span>
              )}
            </div>
          );
        })}
      </div>
      {iterative && (
        <div className="text-[8px] text-center opacity-50 mt-1 border-t border-current/10 pt-0.5">
          ↻ Iterative Cycle
        </div>
      )}
    </div>
  );
};
