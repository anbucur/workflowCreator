import React from 'react';
import type { Step, RoleDefinition, DocumentData } from '../../../types';

const DOC_TYPE_ICONS: Record<string, string> = {
  spec: '📋', template: '📄', report: '📊', diagram: '📐', code: '💻', design: '🎨', default: '📁',
};

interface Props {
  step: Step & { type: 'document'; data: DocumentData };
  roles: RoleDefinition[];
}

export const DocumentContent: React.FC<Props> = ({ step }) => {
  const { documents } = step.data;
  return (
    <div className="space-y-1">
      <p className="text-[10px] leading-snug opacity-80">{step.description}</p>
      <ul className="text-[9px] space-y-0.5 mt-1">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-1">
            <span>{DOC_TYPE_ICONS[doc.docType] || DOC_TYPE_ICONS.default}</span>
            <span>{doc.name}</span>
            <span className="text-[7px] opacity-50 uppercase">{doc.docType}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
