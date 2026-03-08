import React from 'react';
import type { Step, RoleDefinition, RoadmapData, RoadmapItemStatus } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';

interface Props {
  step: Step & { type: 'roadmap'; data: RoadmapData };
  roles: RoleDefinition[];
}

const STATUS_COLORS: Record<RoadmapItemStatus, { bg: string; text: string; label: string }> = {
  planned: { bg: '#e2e8f0', text: '#64748b', label: 'Planned' },
  in_progress: { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
  completed: { bg: '#dcfce7', text: '#15803d', label: 'Done' },
  cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
};

const TYPE_COLORS: Record<string, string> = {
  feature: '#8b5cf6',
  epic: '#3b82f6',
  initiative: '#f59e0b',
  release: '#ec4899',
  milestone: '#10b981',
};

export const RoadmapContent: React.FC<Props> = ({ step }) => {
  const { items, quarters } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const contentFontFamily = layout.cardContentFontFamily || "'Inter', sans-serif";
  const contentFontSize = layout.cardContentFontSize || 13;
  const contentColor = layout.cardContentColor || '#334155';

  // Group items by quarter
  const byQuarter: Record<string, typeof items> = {};
  for (const q of quarters) byQuarter[q] = [];
  for (const item of items) {
    if (!byQuarter[item.quarter]) byQuarter[item.quarter] = [];
    byQuarter[item.quarter].push(item);
  }

  return (
    <div className="mt-1 overflow-x-auto pb-1">
      <div className="flex gap-2" style={{ minWidth: `${quarters.length * 120}px` }}>
        {quarters.map((q) => {
          const qItems = byQuarter[q] || [];
          return (
            <div key={q} className="flex-1 min-w-[110px]">
              <div
                className="text-center font-bold mb-1 pb-1 border-b border-black/10"
                style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 1}px`, color: contentColor }}
              >
                {q}
              </div>
              <div className="space-y-1">
                {qItems.map((item) => {
                  const s = STATUS_COLORS[item.status];
                  const typeColor = TYPE_COLORS[item.type] || '#94a3b8';
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg px-2 py-1.5 border border-black/5"
                      style={{ backgroundColor: s.bg }}
                    >
                      <div className="flex items-start gap-1 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: typeColor }} />
                        <span
                          className="leading-tight font-medium"
                          style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 2}px`, color: contentColor }}
                        >
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span style={{ fontSize: '9px', color: s.text, fontWeight: 600 }}>{s.label}</span>
                        {item.progress !== undefined && item.progress > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-1 bg-black/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-current" style={{ width: `${item.progress}%`, color: s.text }} />
                            </div>
                            <span style={{ fontSize: '8px', color: s.text }}>{item.progress}%</span>
                          </div>
                        )}
                      </div>
                      {item.team && (
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: contentFontFamily }}>{item.team}</div>
                      )}
                    </div>
                  );
                })}
                {qItems.length === 0 && (
                  <div
                    className="rounded-lg border-2 border-dashed border-black/10 px-2 py-3 text-center"
                    style={{ fontSize: '9px', color: '#94a3b8' }}
                  >
                    Nothing planned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
