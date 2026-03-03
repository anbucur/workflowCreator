import React from 'react';
import type { Step, RoleDefinition } from '../../../types';

interface Props {
  step: Step & { type: 'standard' };
  roles: RoleDefinition[];
}

export const StandardContent: React.FC<Props> = ({ step }) => {
  return (
    <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
  );
};
