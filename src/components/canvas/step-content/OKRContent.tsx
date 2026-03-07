import React from 'react';
import type { Step, RoleDefinition, OKRData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';

interface Props {
  step: Step & { type: 'okr'; data: OKRData };
  roles: RoleDefinition[];
}

export const OKRContent: React.FC<Props> = ({ step }) => {
  const { objectives } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const contentFontFamily = layout.cardContentFontFamily || "'Inter', sans-serif";
  const contentFontSize = layout.cardContentFontSize || 13;
  const contentColor = layout.cardContentColor || '#334155';

  return (
    <div className="space-y-2 mt-1">
      {objectives.map((obj) => {
        const progress = obj.keyResults.length > 0
          ? Math.round(obj.keyResults.reduce((sum, kr) => sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0), 0) / obj.keyResults.length)
          : 0;
        const progressColor = progress >= 80 ? '#22c55e' : progress >= 50 ? '#f59e0b' : '#ef4444';

        return (
          <div key={obj.id} className="rounded-lg overflow-hidden border border-black/10">
            <div className="px-2 py-1 bg-black/5 flex items-center justify-between gap-2">
              <span
                className="font-semibold truncate"
                style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize}px`, color: contentColor }}
              >
                {obj.title}
              </span>
              <span
                className="font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full text-white text-xs"
                style={{ backgroundColor: progressColor, fontSize: '9px' }}
              >
                {progress}%
              </span>
            </div>
            {/* Overall progress bar */}
            <div className="px-2 pt-1">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
              </div>
            </div>
            {/* Key Results */}
            <div className="px-2 pb-1.5 space-y-0.5 mt-1">
              {obj.keyResults.map((kr) => {
                const krPct = kr.target > 0 ? Math.min((kr.current / kr.target) * 100, 100) : 0;
                return (
                  <div key={kr.id} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: progressColor }} />
                    <span
                      className="flex-1 truncate"
                      style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 2}px`, color: contentColor }}
                    >
                      {kr.text}
                    </span>
                    <span style={{ fontSize: '9px', color: '#94a3b8', flexShrink: 0 }}>
                      {kr.current}/{kr.target} {kr.unit}
                    </span>
                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${krPct}%`, backgroundColor: progressColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
