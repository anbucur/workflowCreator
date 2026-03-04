import React from 'react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useUiStore } from '../../store/useUiStore';

export const TitleBar: React.FC = () => {
  const titleBar = useInfographicStore((s) => s.titleBar);
  const selectedElement = useUiStore((s) => s.selectedElement);
  const setSelectedElement = useUiStore((s) => s.setSelectedElement);

  const isSelected = selectedElement?.type === 'titleBar';

  const alignmentClass = titleBar.alignment === 'left' ? 'items-start text-left' : titleBar.alignment === 'right' ? 'items-end text-right' : 'items-center text-center';

  return (
    <div
      className="w-full cursor-pointer transition-all border-b border-slate-200 p-6"
      style={{
        backgroundColor: titleBar.backgroundColor,
        color: titleBar.textColor,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'titleBar' });
      }}
      data-selection-ring={isSelected}
    >
      <div
        className={`transition-all w-full flex flex-col ${alignmentClass} ${isSelected ? 'selection-ring z-10 rounded-md' : ''}`}
      >
        {titleBar.logoUrl && (
          <img
            src={titleBar.logoUrl}
            alt="Project Logo"
            className="mb-4 max-h-24 max-w-[250px] object-contain rounded-md shadow-sm"
          />
        )}
        <h2
          className="font-bold tracking-tight leading-tight"
          style={{
            fontSize: titleBar.fontSize ? `${titleBar.fontSize}px` : '24px',
            fontFamily: titleBar.titleFontFamily || `'Inter', sans-serif`
          }}
        >
          {titleBar.text}
        </h2>
        {titleBar.subtitle && (
          <p
            className="uppercase tracking-widest mt-2 opacity-80"
            style={{
              fontSize: titleBar.subtitleFontSize ? `${titleBar.subtitleFontSize}px` : '14px',
              fontFamily: titleBar.subtitleFontFamily || `'Inter', sans-serif`
            }}
          >
            {titleBar.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
