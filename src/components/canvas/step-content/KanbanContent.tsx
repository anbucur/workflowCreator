import React from 'react';
import type { Step, RoleDefinition, KanbanData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';

interface Props {
  step: Step & { type: 'kanban'; data: KanbanData };
  roles: RoleDefinition[];
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const KanbanContent: React.FC<Props> = ({ step }) => {
  const { columns } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const contentFontFamily = layout.cardContentFontFamily || "'Inter', sans-serif";
  const contentFontSize = Math.min(layout.cardContentFontSize || 13, 12);
  const contentColor = layout.cardContentColor || '#334155';

  return (
    <div className="flex gap-2 mt-1 overflow-x-auto pb-1">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ minWidth: '100px', maxWidth: '140px', backgroundColor: col.color || '#f1f5f9' }}
        >
          <div
            className="px-2 py-1 font-bold text-center"
            style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize}px`, color: contentColor }}
          >
            {col.title}
            <span className="ml-1 opacity-60">({col.cards.length})</span>
          </div>
          <div className="flex flex-col gap-1 p-1">
            {col.cards.slice(0, 3).map((card) => (
              <div key={card.id} className="bg-white rounded px-1.5 py-1 shadow-sm border border-white/60">
                <div
                  className="leading-tight"
                  style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 1}px`, color: contentColor }}
                >
                  {card.title}
                </div>
                <div className="flex items-center justify-between mt-0.5 gap-1">
                  {card.assignee && (
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>{card.assignee}</span>
                  )}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLORS[card.priority] || '#94a3b8' }}
                    title={card.priority}
                  />
                </div>
              </div>
            ))}
            {col.cards.length > 3 && (
              <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>
                +{col.cards.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
