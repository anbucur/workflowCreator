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
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <ul className="text-[9px] space-y-0.5 ml-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-1">
            <span>{item.checked ? '☑' : '☐'}</span>
            <span className={item.checked ? 'line-through opacity-50' : ''}>{item.text}</span>
          </li>
        ))}
      </ul>
      <div className="text-[8px] opacity-60 mt-0.5">{completed}/{items.length} complete</div>
    </div>
  );
};
