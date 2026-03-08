import React from 'react';
import type { Step, RoleDefinition, ExecutiveData } from '../../../types';
import { useInfographicStore } from '../../../store/useInfographicStore';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';

interface Props {
  step: Step & { type: 'executive'; data: ExecutiveData };
  roles: RoleDefinition[];
}

const DEPLOYMENT_STATUS = {
  healthy: { color: '#22c55e', label: 'Healthy', Icon: CheckCircle },
  degraded: { color: '#f59e0b', label: 'Degraded', Icon: AlertTriangle },
  down: { color: '#ef4444', label: 'Down', Icon: XCircle },
  unknown: { color: '#94a3b8', label: 'Unknown', Icon: HelpCircle },
};

export const ExecutiveContent: React.FC<Props> = ({ step }) => {
  const { kpis, summary, deploymentVersion, deploymentStatus } = step.data;
  const layout = useInfographicStore((s) => s.layout);
  const contentFontFamily = layout.cardContentFontFamily || "'Inter', sans-serif";
  const contentFontSize = layout.cardContentFontSize || 13;
  const contentColor = layout.cardContentColor || '#334155';

  return (
    <div className="space-y-2 mt-1">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {kpis.map((kpi) => {
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
          const changeColor = kpi.changeType === 'positive' ? '#22c55e' : kpi.changeType === 'negative' ? '#ef4444' : '#94a3b8';
          return (
            <div
              key={kpi.id}
              className="rounded-xl p-2 border border-black/5"
              style={{ backgroundColor: (kpi.color || '#3b82f6') + '14' }}
            >
              <div
                className="text-xs font-medium truncate mb-0.5"
                style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 3}px`, color: '#94a3b8' }}
              >
                {kpi.label}
              </div>
              <div
                className="font-bold leading-none"
                style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize + 1}px`, color: kpi.color || contentColor }}
              >
                {kpi.value}
              </div>
              {kpi.change && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <TrendIcon size={9} style={{ color: changeColor }} />
                  <span style={{ fontSize: '9px', color: changeColor, fontFamily: contentFontFamily }}>{kpi.change}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {summary && (
        <p
          className="text-xs leading-relaxed"
          style={{ fontFamily: contentFontFamily, fontSize: `${contentFontSize - 2}px`, color: contentColor, opacity: 0.8 }}
        >
          {summary}
        </p>
      )}

      {/* Deployment Status */}
      {deploymentStatus && (
        <div
          className="flex items-center justify-between rounded-lg px-2 py-1.5 border"
          style={{ backgroundColor: DEPLOYMENT_STATUS[deploymentStatus].color + '14', borderColor: DEPLOYMENT_STATUS[deploymentStatus].color + '30' }}
        >
          <div className="flex items-center gap-1.5">
            {React.createElement(DEPLOYMENT_STATUS[deploymentStatus].Icon, {
              size: 12,
              style: { color: DEPLOYMENT_STATUS[deploymentStatus].color },
            })}
            <span style={{ fontSize: '10px', fontFamily: contentFontFamily, color: contentColor }}>
              Production
            </span>
          </div>
          <div className="flex items-center gap-1">
            {deploymentVersion && (
              <span
                className="font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ fontSize: '9px', backgroundColor: DEPLOYMENT_STATUS[deploymentStatus].color + '22', color: DEPLOYMENT_STATUS[deploymentStatus].color }}
              >
                {deploymentVersion}
              </span>
            )}
            <span style={{ fontSize: '10px', color: DEPLOYMENT_STATUS[deploymentStatus].color, fontWeight: 600 }}>
              {DEPLOYMENT_STATUS[deploymentStatus].label}
            </span>
          </div>
        </div>
      )}

      {step.data.liveRefresh && (
        <div className="flex items-center gap-1 opacity-50">
          <RefreshCw size={9} className="animate-spin" />
          <span style={{ fontSize: '9px', fontFamily: contentFontFamily }}>Live</span>
        </div>
      )}
    </div>
  );
};
