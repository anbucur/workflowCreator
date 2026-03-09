import React from 'react';
import type { Step, RoleDefinition, ParallelData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { GitBranch } from 'lucide-react';

interface Props {
  step: Step & { type: 'parallel'; data: ParallelData };
  roles: RoleDefinition[];
}

const TRACK_ICON_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const ParallelContent: React.FC<Props> = ({ step, roles }) => {
  const { tracks } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const subcontentTitleFontFamily = layout.subcontentTitleFontFamily || "'Inter', sans-serif";
  const subcontentTitleFontSize = layout.subcontentTitleFontSize || 9;
  const subcontentTitleColor = layout.subcontentTitleColor || '#94a3b8';

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track, idx) => {
        const iconColor = TRACK_ICON_COLORS[idx % TRACK_ICON_COLORS.length];
        const items = track.items ?? [];
        return (
          <div
            key={track.id}
            className="w-full rounded-lg overflow-hidden border border-current/10 shadow-sm"
            style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: 'rgba(128,128,128,0.06)' }}
          >
            {/* Header — agenda style */}
            <div className="px-2 pt-2 pb-0.5">
              <p
                className="font-bold uppercase tracking-wider flex items-center gap-1"
                style={{
                  fontFamily: subcontentTitleFontFamily,
                  fontSize: `${subcontentTitleFontSize}px`,
                  color: subcontentTitleColor,
                }}
              >
                <GitBranch size={9} style={{ color: iconColor }} />
                <span title={track.label}>{track.label}</span>
              </p>
            </div>

            {/* Items */}
            <ul className="px-2 pb-2 pt-1 space-y-1">
              {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                  <li key={i} className="flex items-start gap-1.5 card-text">
                    <span
                      className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: iconColor }}
                    />
                    <span className="leading-tight flex-1">{item}</span>
                    {isLast && track.roleIds.length > 0 && (
                      <div className="flex gap-0.5 ml-1 shrink-0">
                        {track.roleIds.map((rid) => {
                          const role = roles.find((r) => r.id === rid);
                          return role ? (
                            <span
                              key={rid}
                              className="inline-flex items-center justify-center font-bold rounded text-[8px] px-1.5 py-0.5 shrink-0"
                              style={{ backgroundColor: role.color, color: role.textColor || '#fff' }}
                            >
                              {(role.tag || role.name.substring(0, 3)).toUpperCase()}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
