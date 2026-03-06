import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';
import type { Connector, ConnectorHandlePosition, ConnectorType } from '../../types';
import { Trash2 } from 'lucide-react';

interface Point { x: number; y: number; }

/** Look up the centre of a connector handle relative to container. */
function getHandlePos(container: HTMLElement, stepId: string, handle: ConnectorHandlePosition): Point | null {
    const el = container.querySelector(`[data-connector-handle="${stepId}-${handle}"]`);
    if (!el) return null;
    const cr = el.getBoundingClientRect();
    const pr = container.getBoundingClientRect();
    return { x: cr.left - pr.left + cr.width / 2, y: cr.top - pr.top + cr.height / 2 };
}

/** Get a card's bounding rectangle relative to container. */
function getCardRect(container: HTMLElement, stepId: string, handle: ConnectorHandlePosition): DOMRect | null {
    const el = container.querySelector(`[data-connector-handle="${stepId}-${handle}"]`)?.closest('.glass');
    if (!el) return null;
    const cr = el.getBoundingClientRect();
    const pr = container.getBoundingClientRect();
    return new DOMRect(cr.left - pr.left, cr.top - pr.top, cr.width, cr.height);
}

/**
 * Smart path builder that routes around source/target cards.
 * Uses card bounding rects to push waypoints into clear space.
 */
function buildPath(
    src: Point, tgt: Point,
    type: string,
    sameStep: boolean,
    sh: ConnectorHandlePosition, th: ConnectorHandlePosition,
    srcRect: DOMRect | null, tgtRect: DOMRect | null,
    dynamicGap: number = 20,
    waypoints?: Point[]
): string {
    if (waypoints && waypoints.length > 0) {
        return `M ${src.x},${src.y} ` + waypoints.map(wp => `L ${wp.x},${wp.y}`).join(' ') + ` L ${tgt.x},${tgt.y}`;
    }

    if (type === 'loop' || sameStep) {
        const r = 40;
        // Loop arcs out to the right of the card
        const cx = srcRect ? srcRect.x + srcRect.width + r : src.x + r;
        return `M ${src.x},${src.y} L ${src.x + 10},${src.y} C ${cx},${src.y} ${cx},${tgt.y} ${tgt.x + 10},${tgt.y} L ${tgt.x},${tgt.y}`;
    }

    // Compute exit/entry waypoints clear of card edges
    const wp1 = exitWaypoint(src, sh, srcRect, dynamicGap);
    const wp2 = exitWaypoint(tgt, th, tgtRect, dynamicGap);

    if (type === 'straight') {
        return `M ${src.x},${src.y} L ${tgt.x},${tgt.y}`;
    }

    if (type === 'step') {
        const sR = srcRect || { top: src.y - 40, bottom: src.y + 40, left: src.x - 100, right: src.x + 100 } as DOMRect;
        const tR = tgtRect || { top: tgt.y - 40, bottom: tgt.y + 40, left: tgt.x - 100, right: tgt.x + 100 } as DOMRect;

        const leftClear = Math.min(sR.left, tR.left) - dynamicGap;
        const rightClear = Math.max(sR.right, tR.right) + dynamicGap;
        const topClear = Math.min(sR.top, tR.top) - dynamicGap;
        const bottomClear = Math.max(sR.bottom, tR.bottom) + dynamicGap;

        const vS = sh === 'top' || sh === 'bottom';
        const vT = th === 'top' || th === 'bottom';

        const intersects = (p1: Point, p2: Point, r: DOMRect) => {
            return Math.max(p1.x, p2.x) > r.left && Math.min(p1.x, p2.x) < r.right &&
                Math.max(p1.y, p2.y) > r.top && Math.min(p1.y, p2.y) < r.bottom;
        };

        const tryPath = (...pts: Point[]) => {
            for (let i = 0; i < pts.length - 1; i++) {
                if (intersects(pts[i], pts[i + 1], sR) || intersects(pts[i], pts[i + 1], tR)) return false;
            }
            return true;
        };

        const draw = (...pts: Point[]) => `M ${src.x},${src.y} ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${tgt.x},${tgt.y}`;

        if (vS && vT) {
            const midY = (wp1.y + wp2.y) / 2;
            const pt1a = { x: wp1.x, y: midY };
            const pt1b = { x: wp2.x, y: midY };

            if ((sh === 'bottom' && midY >= wp1.y || sh === 'top' && midY <= wp1.y) &&
                (th === 'bottom' && midY >= wp2.y || th === 'top' && midY <= wp2.y)) {
                if (tryPath(wp1, pt1a, pt1b, wp2)) return draw(wp1, pt1a, pt1b, wp2);
            }

            const safeY = sh === 'bottom' ? bottomClear : topClear;
            const pt2a = { x: wp1.x, y: safeY };
            const pt2b = { x: wp2.x, y: safeY };
            if (tryPath(wp1, pt2a, pt2b, wp2)) return draw(wp1, pt2a, pt2b, wp2);

            const safeX = (wp1.x + wp2.x) / 2 > (leftClear + rightClear) / 2 ? rightClear : leftClear;
            const safeY2 = th === 'bottom' ? bottomClear : topClear;
            return draw(wp1, pt2a, { x: safeX, y: safeY }, { x: safeX, y: safeY2 }, { x: wp2.x, y: safeY2 }, wp2);
        }

        if (!vS && !vT) {
            const midX = (wp1.x + wp2.x) / 2;
            const pt1a = { x: midX, y: wp1.y };
            const pt1b = { x: midX, y: wp2.y };

            if ((sh === 'right' && midX >= wp1.x || sh === 'left' && midX <= wp1.x) &&
                (th === 'right' && midX >= wp2.x || th === 'left' && midX <= wp2.x)) {
                if (tryPath(wp1, pt1a, pt1b, wp2)) return draw(wp1, pt1a, pt1b, wp2);
            }

            const safeX = sh === 'right' ? rightClear : leftClear;
            const pt2a = { x: safeX, y: wp1.y };
            const pt2b = { x: safeX, y: wp2.y };
            if (tryPath(wp1, pt2a, pt2b, wp2)) return draw(wp1, pt2a, pt2b, wp2);

            const safeY = (wp1.y + wp2.y) / 2 > (topClear + bottomClear) / 2 ? bottomClear : topClear;
            const safeX2 = th === 'right' ? rightClear : leftClear;
            return draw(wp1, pt2a, { x: safeX, y: safeY }, { x: safeX2, y: safeY }, { x: safeX2, y: wp2.y }, wp2);
        }

        if (vS && !vT) {
            const pt1a = { x: wp1.x, y: wp2.y };
            if (tryPath(wp1, pt1a, wp2)) return draw(wp1, pt1a, wp2);

            const pt1b = { x: wp2.x, y: wp1.y };
            if (tryPath(wp1, pt1b, wp2)) return draw(wp1, pt1b, wp2);

            const safeY = sh === 'bottom' ? bottomClear : topClear;
            const pt2a = { x: wp1.x, y: safeY };
            const pt2b = { x: wp2.x, y: safeY };
            if (tryPath(wp1, pt2a, pt2b, wp2)) return draw(wp1, pt2a, pt2b, wp2);

            const safeX = th === 'right' ? rightClear : leftClear;
            return draw(wp1, pt2a, { x: safeX, y: safeY }, { x: safeX, y: wp2.y }, wp2);
        }

        if (!vS && vT) {
            const pt1a = { x: wp2.x, y: wp1.y };
            if (tryPath(wp1, pt1a, wp2)) return draw(wp1, pt1a, wp2);

            const pt1b = { x: wp1.x, y: wp2.y };
            if (tryPath(wp1, pt1b, wp2)) return draw(wp1, pt1b, wp2);

            const safeX = sh === 'right' ? rightClear : leftClear;
            const pt2a = { x: safeX, y: wp1.y };
            const pt2b = { x: safeX, y: wp2.y };
            if (tryPath(wp1, pt2a, pt2b, wp2)) return draw(wp1, pt2a, pt2b, wp2);

            const safeY = th === 'bottom' ? bottomClear : topClear;
            return draw(wp1, pt2a, { x: safeX, y: safeY }, { x: wp2.x, y: safeY }, wp2);
        }
    }

    const cpXDist = Math.max(Math.abs(wp1.x - wp2.x) * 0.5, 60);
    const cpYDist = Math.max(Math.abs(wp1.y - wp2.y) * 0.5, 60);
    const ctrl1X = wp1.x + (sh === 'right' ? cpXDist : sh === 'left' ? -cpXDist : 0);
    const ctrl1Y = wp1.y + (sh === 'bottom' ? cpYDist : sh === 'top' ? -cpYDist : 0);
    const ctrl2X = wp2.x + (th === 'right' ? cpXDist : th === 'left' ? -cpXDist : 0);
    const ctrl2Y = wp2.y + (th === 'bottom' ? cpYDist : th === 'top' ? -cpYDist : 0);
    return `M ${src.x},${src.y} L ${wp1.x},${wp1.y} C ${ctrl1X},${ctrl1Y} ${ctrl2X},${ctrl2Y} ${wp2.x},${wp2.y} L ${tgt.x},${tgt.y}`;
}

/** Compute a waypoint just outside the card boundary in the handle's direction. */
function exitWaypoint(p: Point, handle: ConnectorHandlePosition, rect: DOMRect | null, dynamicGap: number = 20): Point {
    if (rect) {
        // For 'top' and 'left', we subtract the gap so it clears the bounding box in the negative direction.
        // For 'bottom' and 'right', we add the gap to clear it in the positive direction.
        switch (handle) {
            case 'top': return { x: p.x, y: rect.top - dynamicGap };
            case 'bottom': return { x: p.x, y: rect.bottom + dynamicGap };
            case 'left': return { x: rect.left - dynamicGap, y: p.y };
            case 'right': return { x: rect.right + dynamicGap, y: p.y };
            default: return p;
        }
    }
    // Fallback if we somehow have no DOMRect
    switch (handle) {
        case 'top': return { x: p.x, y: p.y - dynamicGap };
        case 'bottom': return { x: p.x, y: p.y + dynamicGap };
        case 'left': return { x: p.x - dynamicGap, y: p.y };
        case 'right': return { x: p.x + dynamicGap, y: p.y };
        default: return p;
    }
}

/** Find midpoint of a path for placing the floating toolbar. */
function pathMidpoint(d: string): Point {
    const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    if (nums.length < 4) return { x: 0, y: 0 };
    let sx = 0, sy = 0, n = 0;
    for (let i = 0; i < nums.length - 1; i += 2) { sx += nums[i]; sy += nums[i + 1]; n++; }
    return { x: sx / n, y: sy / n };
}

const TYPE_OPTIONS: { value: ConnectorType; label: string; title: string }[] = [
    { value: 'curved', label: '⌒', title: 'Curved' },
    { value: 'straight', label: '╱', title: 'Straight' },
    { value: 'step', label: '⌐', title: 'Stepped' },
    { value: 'loop', label: '↺', title: 'Loop' },
];

const COLOR_OPTIONS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];
const STYLE_OPTIONS = ['solid', 'dashed', 'dotted'] as const;

export const ConnectorOverlay: React.FC = () => {
    const connectors = useInfographicStore((s) => s.connectors || []);
    const updateConnector = useInfographicStore((s) => s.updateConnector);
    const removeConnector = useInfographicStore((s) => s.removeConnector);
    const addConnectorWaypoint = useInfographicStore((s) => s.addConnectorWaypoint);
    const updateConnectorWaypoint = useInfographicStore((s) => s.updateConnectorWaypoint);
    const removeConnectorWaypoint = useInfographicStore((s) => s.removeConnectorWaypoint);
    const connectingFrom = useUiStore((s) => s.connectingFrom);
    const selectedElement = useUiStore((s) => s.selectedElement);
    const setSelectedElement = useUiStore((s) => s.setSelectedElement);
    const setConnectingFrom = useUiStore((s) => s.setConnectingFrom);

    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<(Connector & { d: string })[]>([]);
    const [drawPath, setDrawPath] = useState<string | null>(null);
    const [draggingWaypoint, setDraggingWaypoint] = useState<{ connectorId: string, index: number } | null>(null);

    const selectedConnectorId = selectedElement?.type === 'connector' ? selectedElement.connectorId : null;

    const computePaths = useCallback(() => {
        const container = svgRef.current?.closest('.infographic-root') as HTMLElement | null;
        if (!container) return;

        const result = connectors.map((c: Connector) => {
            const from = getHandlePos(container, c.sourceStepId, c.sourceHandle);
            const to = getHandlePos(container, c.targetStepId, c.targetHandle);
            if (!from || !to) return null;
            const srcRect = getCardRect(container, c.sourceStepId, c.sourceHandle);
            const tgtRect = getCardRect(container, c.targetStepId, c.targetHandle);
            const sameStep = c.sourceStepId === c.targetStepId;
            const stepGap = useInfographicStore.getState().layout.stepGap ?? 8;
            const dynamicGap = Math.max(4, stepGap);
            return {
                ...c,
                d: buildPath(from, to, c.type, sameStep, c.sourceHandle, c.targetHandle, srcRect, tgtRect, dynamicGap),
            };
        }).filter(Boolean) as (Connector & { d: string })[];
        setPaths(result);
    }, [connectors]);

    useEffect(() => {
        let frameId: number;
        const loop = () => {
            computePaths();
            frameId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(frameId);
    }, [computePaths]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (connectingFrom && svgRef.current) {
                const container = svgRef.current.closest('.infographic-root') as HTMLElement | null;
                if (!container) return;
                const pr = container.getBoundingClientRect();
                const from = getHandlePos(container, connectingFrom.stepId, connectingFrom.handle);
                if (from) setDrawPath(`M ${from.x},${from.y} L ${e.clientX - pr.left},${e.clientY - pr.top}`);
            } else if (draggingWaypoint && svgRef.current) {
                const pr = svgRef.current.getBoundingClientRect();
                const pt = { x: e.clientX - pr.left, y: e.clientY - pr.top };
                updateConnectorWaypoint(draggingWaypoint.connectorId, draggingWaypoint.index, pt);
            }
        };
        const handleMouseUp = () => {
            if (draggingWaypoint) setDraggingWaypoint(null);
        };
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setConnectingFrom(null); };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [connectingFrom, setConnectingFrom, draggingWaypoint, updateConnectorWaypoint]);

    const uniqueColors = Array.from(new Set(paths.map((p) => p.color)));
    const selectedPath = paths.find((p) => p.id === selectedConnectorId);
    const toolbarPos = selectedPath ? pathMidpoint(selectedPath.d) : null;

    return (
        <>
            <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
                <defs>
                    {uniqueColors.map((c) => {
                        const cid = c.replace('#', '');
                        return (
                            <React.Fragment key={c}>
                                {/* Arrow target */}
                                <marker id={`target-arrow-${cid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
                                </marker>
                                {/* Arrow source (reversed) */}
                                <marker id={`source-arrow-${cid}`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M 10 0 L 0 5 L 10 10 z" fill={c} />
                                </marker>
                                {/* Diamond target */}
                                <marker id={`target-diamond-${cid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill={c} />
                                </marker>
                                {/* Diamond source */}
                                <marker id={`source-diamond-${cid}`} viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill={c} />
                                </marker>
                                {/* Circle target */}
                                <marker id={`target-circle-${cid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <circle cx="5" cy="5" r="4" fill={c} />
                                </marker>
                                {/* Circle source */}
                                <marker id={`source-circle-${cid}`} viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <circle cx="5" cy="5" r="4" fill={c} />
                                </marker>
                                {/* Square target */}
                                <marker id={`target-square-${cid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <rect x="1" y="1" width="8" height="8" fill={c} />
                                </marker>
                                {/* Square source */}
                                <marker id={`source-square-${cid}`} viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <rect x="1" y="1" width="8" height="8" fill={c} />
                                </marker>
                            </React.Fragment>
                        );
                    })}
                </defs>
                {paths.map((p) => {
                    const cid = p.color.replace('#', '');
                    const isSelected = selectedConnectorId === p.id;
                    const dash = p.lineStyle === 'dashed' ? '8 6' : p.lineStyle === 'dotted' ? '2 4' : 'none';
                    const sHead = p.sourceHead && p.sourceHead !== 'none' ? `url(#source-${p.sourceHead}-${cid})` : 'none';
                    const tHead = p.targetHead && p.targetHead !== 'none' ? `url(#target-${p.targetHead}-${cid})` : 'none';

                    return (
                        <g key={p.id}>
                            <path d={p.d} fill="none" stroke="transparent" strokeWidth={Math.max(16, (p.strokeWidth || 2) * 3)}
                                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'connector', connectorId: p.id }); }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (svgRef.current) {
                                        const pr = svgRef.current.getBoundingClientRect();
                                        const pt = { x: e.clientX - pr.left, y: e.clientY - pr.top };
                                        addConnectorWaypoint(p.id, p.waypoints?.length || 0, pt);
                                        setSelectedElement({ type: 'connector', connectorId: p.id });
                                    }
                                }}
                            />
                            <path d={p.d} fill="none" stroke={p.color}
                                strokeWidth={p.strokeWidth || 2}
                                strokeDasharray={isSelected ? '6 3' : dash}
                                markerStart={sHead}
                                markerEnd={tHead}
                                style={{ strokeLinecap: p.lineStyle === 'dotted' ? 'round' : 'butt' }}
                                className={`pointer-events-none transition-all ${isSelected ? 'opacity-80' : ''}`}
                            />
                            {isSelected && p.waypoints?.map((wp, i) => (
                                <circle
                                    key={`${p.id}-wp-${i}`}
                                    cx={wp.x} cy={wp.y} r={6}
                                    fill="white" stroke={p.color} strokeWidth={2}
                                    style={{ cursor: 'move', pointerEvents: 'all' }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        setDraggingWaypoint({ connectorId: p.id, index: i });
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        removeConnectorWaypoint(p.id, i);
                                    }}
                                />
                            ))}
                            {p.label && (
                                <>
                                    <path id={`path-${p.id}`} d={p.d} fill="none" stroke="none" />
                                    <text className="pointer-events-none" fontSize="11" fill={p.color} fontWeight="600" textAnchor="middle" dy="-8">
                                        <textPath href={`#path-${p.id}`} startOffset="50%">{p.label}</textPath>
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
                {drawPath && (
                    <path d={drawPath} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" className="pointer-events-none" opacity={0.6} />
                )}
            </svg>

            {selectedPath && toolbarPos && (
                <div
                    className="absolute z-30 flex items-center gap-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: toolbarPos.x, top: toolbarPos.y - 60, transform: 'translateX(-50%)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Style selector */}
                    <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                        {STYLE_OPTIONS.map((st) => (
                            <button key={st} title={`${st} line`}
                                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${selectedPath.lineStyle === st ? 'bg-white border-slate-300 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                onClick={() => updateConnector(selectedPath.id, { lineStyle: st })}
                            >
                                {st === 'solid' && <div className="w-4 h-0.5 bg-current" />}
                                {st === 'dashed' && <div className="flex gap-[2px] w-4"><div className="w-[6px] h-0.5 bg-current" /><div className="w-[6px] h-0.5 bg-current" /></div>}
                                {st === 'dotted' && <div className="flex gap-[2px] w-4 justify-between"><div className="w-[2px] h-[2px] rounded-full bg-current" /><div className="w-[2px] h-[2px] rounded-full bg-current" /><div className="w-[2px] h-[2px] rounded-full bg-current" /></div>}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    {/* Type selector */}
                    <div className="flex gap-1">
                        {TYPE_OPTIONS.map((t) => (
                            <button key={t.value} title={t.title}
                                className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${selectedPath.type === t.value ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                                onClick={() => updateConnector(selectedPath.id, { type: t.value })}
                            >{t.label}</button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    {/* Colors */}
                    <div className="flex gap-1">
                        {COLOR_OPTIONS.slice(0, 4).map((c) => (
                            <button key={c}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${selectedPath.color === c ? 'border-slate-700 scale-110' : 'border-transparent hover:border-slate-300'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => updateConnector(selectedPath.id, { color: c })}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => { removeConnector(selectedPath.id); setSelectedElement(null); }}
                        title="Delete connector"
                    ><Trash2 size={14} /></button>
                </div>
            )}
        </>
    );
};
