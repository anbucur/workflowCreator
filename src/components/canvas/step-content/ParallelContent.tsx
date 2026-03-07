import React from 'react';
import type { Step, RoleDefinition, ParallelData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
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

// Helper to darken a color by mixing it with black
function darkenColor(color: string, targetColor: string): string {
  // Calculate luminance of target color (0-1)
  const targetRgb = hexToRgb(targetColor);
  if (!targetRgb) return color;
  const targetLuminance = (0.299 * targetRgb.r + 0.587 * targetRgb.g + 0.114 * targetRgb.b) / 255;
  
  // Mix the track color with black based on target luminance
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = Math.round(rgb.r * targetLuminance);
  const g = Math.round(rgb.g * targetLuminance);
  const b = Math.round(rgb.b * targetLuminance);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export const ParallelContent: React.FC<Props> = ({ step, roles }) => {
  const { tracks } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const subcontentTitleFontFamily = layout.subcontentTitleFontFamily || "'Inter', sans-serif";
  const subcontentTitleFontSize = layout.subcontentTitleFontSize || 9;
  const subcontentTitleColor = layout.subcontentTitleColor || '#94a3b8';

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track, idx) => {
        const palette = TRACK_PALETTES[idx % TRACK_PALETTES.length];
        const items = track.items ?? [];
        // Darken the track color to match subcontent title brightness
        const trackTitleColor = darkenColor(palette.text, subcontentTitleColor);
        return (
          <div
            key={track.id}
            className="w-full rounded-lg overflow-hidden border shadow-sm"
            style={{ borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            {/* Header */}
            <div
              className="px-1.5 py-1 flex items-center gap-1"
              style={{ backgroundColor: palette.bg }}
            >
              <GitBranch size={8} style={{ color: trackTitleColor }} />
              <span
                className="font-bold uppercase tracking-wider truncate"
                style={{
                  fontFamily: subcontentTitleFontFamily,
                  fontSize: `${subcontentTitleFontSize}px`,
                  color: trackTitleColor
                }}
                title={track.label}
              >
                {track.label}
              </span>
            </div>

            {/* Items */}
            <div className="px-1.5 py-1 space-y-1">
              {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                  <div key={i} className="flex items-start gap-1 card-text">
                    <span
                      className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: trackTitleColor }}
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
