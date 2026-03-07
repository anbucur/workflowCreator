import React from 'react';
import type { Step, RoleDefinition, MeetingData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { CheckSquare, Scale } from 'lucide-react';

interface Props {
  step: Step & { type: 'meeting'; data: MeetingData };
  roles: RoleDefinition[];
}

export const MeetingContent: React.FC<Props> = ({ step }) => {
  const { agendaItems, hasDecision, decision } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const subcontentTitleFontFamily = layout.subcontentTitleFontFamily || "'Inter', sans-serif";
  const subcontentTitleFontSize = layout.subcontentTitleFontSize || 9;
  const subcontentTitleColor = layout.subcontentTitleColor || '#94a3b8';
  
  return (
    <div className="space-y-2">
      {agendaItems && agendaItems.length > 0 && (
        <div className="bg-white/50 rounded-lg p-2 border border-slate-100 shadow-sm">
          <p 
            className="font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"
            style={{ fontFamily: subcontentTitleFontFamily, fontSize: `${subcontentTitleFontSize}px`, color: subcontentTitleColor }}
          >
            <CheckSquare size={9} className="text-blue-400" /> Agenda
          </p>
          <ul className="space-y-1">
            {agendaItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 card-text">
                <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasDecision && decision && (
        <div className="bg-amber-50/50 rounded-lg p-2 border border-amber-100/50 shadow-sm">
          <p 
            className="font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"
            style={{ fontFamily: subcontentTitleFontFamily, fontSize: `${subcontentTitleFontSize}px`, color: subcontentTitleColor }}
          >
            <Scale size={9} className="text-amber-500" /> Decision Gate
          </p>
          <ul className="space-y-1 mb-1.5">
            {(decision.criteria || []).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 card-text">
                <span className="w-1 h-1 rounded-sm bg-amber-400 shrink-0 mt-1.5" />
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${decision.outcome === 'approved' ? 'bg-emerald-100 text-emerald-700' :
              decision.outcome === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
            }`}>
            {decision.outcome === 'approved' ? '✓ Approved' : decision.outcome === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
          </span>
        </div>
      )}
    </div>
  );
};
