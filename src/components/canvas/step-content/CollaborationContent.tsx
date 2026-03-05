import React from 'react';
import type { Step, RoleDefinition, CollaborationData } from '../../../types';
import { ArrowDown, Flag, RefreshCw } from 'lucide-react';

interface Props {
  step: Step & { type: 'collaboration'; data: CollaborationData };
  roles: RoleDefinition[];
}

export const CollaborationContent: React.FC<Props> = ({ step, roles }) => {
  const { participants, iterative, finalActionTitle, finalItems } = step.data;
  const hasGoal = finalItems && finalItems.length > 0;

  // Group participants by roleId
  const grouped: { role: RoleDefinition | undefined; actions: string[] }[] = [];
  for (const p of participants) {
    const role = roles.find((r) => r.id === p.roleId);
    const existing = grouped.find((g) => g.role?.id === role?.id);
    if (existing) {
      existing.actions.push(p.action);
    } else {
      grouped.push({ role, actions: [p.action] });
    }
  }

  return (
    <div className="space-y-2">
      {participants.length > 0 && (
        <div className={`rounded-lg shadow-sm border border-slate-100 ${iterative ? 'bg-indigo-50/30' : 'bg-white/40'}`}>
          {/* Inner header — same pattern as AGENDA label */}
          {iterative && (
            <p className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 uppercase tracking-wider px-2 pt-2 pb-0.5">
              <RefreshCw size={8} className="text-indigo-400" />
              Iterative Loop
            </p>
          )}

          <ul className="space-y-1.5 p-2">
            {grouped.map((group, gi) => (
              <div key={gi} className="space-y-0.5">
                {group.actions.map((action, ai) => (
                  <div key={ai} className="flex items-start gap-1.5 card-text">
                    {ai === 0 ? (
                      group.role ? (
                        <span
                          className="inline-flex items-center justify-center font-bold rounded text-[8px] px-1.5 py-0.5 shrink-0 mt-0.5"
                          style={{ backgroundColor: group.role.color, color: group.role.textColor || '#fff' }}
                        >
                          {group.role.name.substring(0, 3).toUpperCase()}
                        </span>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                      )
                    ) : (
                      <span className="flex items-center gap-1.5 ml-[calc(1.5rem+2px)]">
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                      </span>
                    )}
                    <span className="leading-tight text-slate-700">{action}</span>
                  </div>
                ))}
              </div>
            ))}
          </ul>
        </div>
      )}

      {hasGoal && (
        <>
          <div className="flex justify-center">
            <ArrowDown size={12} className="text-slate-300" />
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 overflow-hidden">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100/60 border-b border-emerald-200">
              <Flag size={9} className="text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                {finalActionTitle || 'Goal / Output'}
              </span>
            </div>
            <ul className="px-2 py-1.5 space-y-1">
              {finalItems.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 card-text">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span className="leading-tight text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
