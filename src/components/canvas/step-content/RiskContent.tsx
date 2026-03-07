import React from 'react';
import type { Step, RoleDefinition, RiskData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';

const SEVERITY_STYLES = {
  low: { bg: '#d1fae5', text: '#065f46', label: 'Low' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
  high: { bg: '#fed7aa', text: '#9a3412', label: 'High' },
  critical: { bg: '#fecaca', text: '#991b1b', label: 'Critical' },
};

interface Props {
  step: Step & { type: 'risk'; data: RiskData };
  roles: RoleDefinition[];
}

export const RiskContent: React.FC<Props> = ({ step }) => {
  const { severity, risks } = step.data;
  const style = SEVERITY_STYLES[severity];
  const layout = useInfographicStore((s) => s.layout);
  const subtextFontFamily = layout.cardSubtextFontFamily || "'Inter', sans-serif";
  const subtextFontSize = layout.cardSubtextFontSize || 9;
  const subtextColor = layout.cardSubtextColor || '#64748b';

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span
          className="font-semibold px-1.5 py-0.5 rounded uppercase"
          style={{ backgroundColor: style.bg, color: style.text, fontSize: `${subtextFontSize}px`, fontFamily: subtextFontFamily }}
        >
          ⚠ {style.label}
        </span>
      </div>
      <ul className="space-y-0.5 mt-1">
        {risks.map((risk) => (
          <li key={risk.id}>
            <span className="card-text font-medium">• {risk.text}</span>
            {risk.mitigation && (
              <div
                className="ml-2 italic"
                style={{ fontFamily: subtextFontFamily, fontSize: `${subtextFontSize}px`, color: subtextColor }}
              >
                ↳ {risk.mitigation}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
