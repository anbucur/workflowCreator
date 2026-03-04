import React from 'react';
import type { Step, RoleDefinition } from '../../../types';

interface Props {
  step: Step & { type: 'standard' };
  roles: RoleDefinition[];
}

export const StandardContent: React.FC<Props> = () => {
  return null; // description rendered by StepCard
};
