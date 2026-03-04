import React from 'react';
import type { Step, RoleDefinition, CollaborationData } from '../../../types';
import { RoleBadge } from '../RoleBadge';

interface Props {
  step: Step & { type: 'collaboration'; data: CollaborationData };
  roles: RoleDefinition[];
}

export const CollaborationContent: React.FC<Props> = ({ step, roles }) => {
  const { participants, iterative, finalActionTitle, finalItems } = step.data;
  return (
    <div className="space-y-1">
      <div className="space-y-1 mt-1">
        {participants.map((p, i) => {
          const role = roles.find((r) => r.id === p.roleId);
          return (
            <div key={i} className="flex items-center gap-1.5 card-text">
              {role && <RoleBadge name={role.name} color={role.color} textColor={role.textColor} size="sm" />}
              <span>{p.action}</span>
              {i < participants.length - 1 && (
                <span className="text-[9px] opacity-40 ml-auto">{iterative ? '↻' : '→'}</span>
              )}
            </div>
          );
        })}
      </div>
      {iterative && (
        <div className="text-[9px] text-center text-slate-400 mt-1 border-t border-current/10 pt-0.5">
          ↻ Iterative Cycle
        </div>
      )}
      {finalItems && finalItems.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/10">
          {finalActionTitle && (
            <div className="text-[10px] font-semibold mb-1 opacity-90">{finalActionTitle}</div>
          )}
          <ul className="list-disc pl-3 space-y-0.5">
            {finalItems.map((item, i) => (
              <li key={i} className="text-[9px] opacity-80 leading-tight">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
