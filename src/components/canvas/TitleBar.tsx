import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';

export const TitleBar: React.FC = () => {
  const titleBar = useInfographicStore((s) => s.titleBar);
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);

  const isSelected = selectedElement?.type === 'titleBar';

  return (
    <div
      className="w-full cursor-pointer transition-all border-b border-slate-200"
      style={{
        backgroundColor: titleBar.backgroundColor,
        color: titleBar.textColor,
        padding: '24px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'titleBar' });
      }}
      data-selection-ring={isSelected}
    >
      <div
        className={`transition-all ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
      >
        <h2 className="text-xl font-bold tracking-tight">
          {titleBar.text}
        </h2>
        {titleBar.subtitle && (
          <p className="text-xs uppercase tracking-widest mt-1 opacity-80">{titleBar.subtitle}</p>
        )}
      </div>
    </div>
  );
};
