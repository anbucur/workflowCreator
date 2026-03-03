import React from 'react';
import { InfographicRenderer } from '../canvas/InfographicRenderer';

export const Canvas: React.FC = () => {
    return (
        <div className="w-full h-full p-8 overflow-auto flex items-start justify-center">
            <div className="transform-origin-top-center transition-transform duration-200">
                <InfographicRenderer />
            </div>
        </div>
    );
};
