import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { PhaseEditor } from '../sidebar/PhaseEditor';
import { StepEditor } from '../sidebar/StepEditor';
import { InfographicSettings } from '../sidebar/InfographicSettings';

export const Sidebar: React.FC = () => {
    const selectedElement = useUiStore((state) => state.selectedElement);

    return (
        <div className="h-full flex flex-col p-4">
            {selectedElement?.type === 'phase' && <PhaseEditor />}
            {selectedElement?.type === 'step' && <StepEditor />}
            {!selectedElement && <InfographicSettings />}
        </div>
    );
};
