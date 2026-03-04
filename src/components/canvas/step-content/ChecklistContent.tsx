import React from 'react';
import type { Step, RoleDefinition, ChecklistData } from '../../../types';

interface Props {
  step: Step & { type: 'checklist'; data: ChecklistData };
  roles: RoleDefinition[];
}

export const ChecklistContent: React.FC<Props> = ({ step }) => {
  const { items } = step.data;
  const completed = items.filter((i) => i.checked).length;
  return (
    <div className="space-y-1">
      <ul className="space-y-0.5 ml-1">
        {items.map((item) => (
          <li key={item.id} className={`flex items-center gap-1 card-text ${item.checked ? 'line-through opacity-50' : ''}`}>
            <span>{item.checked ? '☑' : '☐'}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <div className="text-[9px] text-slate-500 mt-0.5">{completed}/{items.length} complete</div>
    </div>
  );
};
