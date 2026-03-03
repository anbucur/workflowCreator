import React from 'react';

interface RoleBadgeProps {
  name: string;
  color: string;
  textColor: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ name, color, textColor, size = 'sm' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-md ${
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5 min-w-[28px]' : 'text-[11px] px-2 py-0.5 min-w-[32px]'
      }`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {name}
    </span>
  );
};
