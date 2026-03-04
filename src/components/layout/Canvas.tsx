import React, { useRef, useEffect } from 'react';
import { InfographicRenderer } from '../canvas/InfographicRenderer';
import { useExportStore } from '../../store/useExportStore';

export const Canvas: React.FC = () => {
    const setInfographicRef = useExportStore((s) => s.setInfographicRef);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInfographicRef(canvasRef);
    }, [setInfographicRef]);

    return (
        <div
            ref={canvasRef}
            className="transform-origin-top-center transition-transform duration-200 mx-auto mt-4 mb-16"
        >
            <InfographicRenderer />
        </div>
    );
};
