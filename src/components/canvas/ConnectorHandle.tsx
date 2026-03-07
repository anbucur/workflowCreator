import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { useInfographicStore } from '../../store/useInfographicStore';
import type { ConnectorHandlePosition } from '../../types';

interface Props {
    stepId: string;
    position: ConnectorHandlePosition;
}

const positionStyles: Record<ConnectorHandlePosition, React.CSSProperties> = {
    top: { top: -4, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
    left: { left: -4, top: '50%', transform: 'translateY(-50%)' },
    right: { right: -4, top: '50%', transform: 'translateY(-50%)' },
};

export const ConnectorHandle: React.FC<Props> = ({ stepId, position }) => {
    const connectMode = useUiStore((s) => s.connectMode);
    const connectingFrom = useUiStore((s) => s.connectingFrom);
    const setConnectingFrom = useUiStore((s) => s.setConnectingFrom);
    const addConnector = useInfographicStore((s) => s.addConnector);
    const setSelectedElement = useUiStore((s) => s.setSelectedElement);

    const isSource = connectingFrom?.stepId === stepId && connectingFrom?.handle === position;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!connectingFrom) {
            // Start drawing
            setConnectingFrom({ stepId, handle: position });
        } else {
            // Complete connection
            if (connectingFrom.stepId !== stepId || connectingFrom.handle !== position) {
                // Determine connector type: self-loop if same step
                const type = connectingFrom.stepId === stepId ? 'loop' : 'curved';
                addConnector(connectingFrom.stepId, connectingFrom.handle, stepId, position, type);
            }
            setConnectingFrom(null);
            setSelectedElement(null);
        }
    };

    return (
        <div
            data-connector-handle={`${stepId}-${position}`}
            className={`connector-handle absolute z-30 w-3 h-3 rounded-full border-2 border-white cursor-crosshair transition-all duration-150 ${connectMode || connectingFrom ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'
                } ${isSource ? 'ring-2 ring-indigo-400 bg-indigo-500' : 'bg-indigo-400 hover:bg-indigo-500'}`}
            style={positionStyles[position]}
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // prevent dnd-kit drag activation
            title={`Connect from ${position}`}
        />
    );
};
