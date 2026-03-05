import React from 'react';
import type { Step, RoleDefinition, ParallelData } from '../../../types';
import { RoleBadge } from '../RoleBadge';
import { GitBranch } from 'lucide-react';

interface Props {
  step: Step & { type: 'parallel'; data: ParallelData };
  roles: RoleDefinition[];
}

const TRACK_PALETTES = [
  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', icon: '#8b5cf6', text: '#6d28d9' },
  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6', text: '#1d4ed8' },
  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '#10b981', text: '#047857' },
  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '#f59e0b', text: '#b45309' },
  { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: '#ef4444', text: '#b91c1c' },
];

export const ParallelContent: React.FC<Props> = ({ step, roles }) => {
  const { tracks } = step.data;
  return (
    <div className="flex gap-2">
      {tracks.map((track, idx) => {
        const palette = TRACK_PALETTES[idx % TRACK_PALETTES.length];
        const items = track.items ?? [];
        return (
          <div
            key={track.id}
            className="flex-1 rounded-lg overflow-hidden border shadow-sm"
            style={{ borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            {/* Header */}
            <div
              className="px-1.5 py-1 flex items-center gap-1"
              style={{ backgroundColor: palette.bg }}
            >
              <GitBranch size={8} style={{ color: palette.icon }} />
              <span
                className="text-[9px] font-bold uppercase tracking-wider truncate"
                style={{ color: palette.text }}
                title={track.label}
              >
                {track.label}
              </span>
            </div>

            {/* Items */}
            <div className="px-1.5 py-1 space-y-0.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-1 card-text">
                  <span
                    className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: palette.icon }}
                  />
                  <span className="leading-tight">{item}</span>
                </div>
              ))}

              {track.roleIds.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {track.roleIds.map((rid) => {
                    const role = roles.find((r) => r.id === rid);
                    return role ? (
                      <RoleBadge key={rid} name={role.name} color={role.color} textColor={role.textColor} size="sm" />
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
