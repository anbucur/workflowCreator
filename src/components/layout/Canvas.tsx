import React, { useRef, useEffect } from 'react';
import { InfographicRenderer } from '../canvas/InfographicRenderer';
import { useExportStore } from '../../store/useExportStore';
import { useUiStore } from '../../store/useUiStore';

export const Canvas: React.FC = () => {
    const setInfographicRef = useExportStore((s) => s.setInfographicRef);
    const canvasRef = useRef<HTMLDivElement>(null);
    const zoom = useUiStore((s) => s.zoom);

    useEffect(() => {
        setInfographicRef(canvasRef);
    }, [setInfographicRef]);

    return (
        <div
            ref={canvasRef}
            className="transform-origin-top-center transition-transform duration-200 mx-auto mt-4 mb-16"
            style={{ transform: `scale(${zoom})` }}
        >
            <InfographicRenderer />
        </div>
    );
};
