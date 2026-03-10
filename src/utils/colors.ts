export const PHASE_PRESETS = [
  { name: 'Warm Beige', bg: '#fef3c7', text: '#92400e' },
  { name: 'Soft Green', bg: '#d1fae5', text: '#065f46' },
  { name: 'Light Blue', bg: '#dbeafe', text: '#1e40af' },
  { name: 'Soft Pink', bg: '#fce7f3', text: '#9d174d' },
  { name: 'Lavender', bg: '#e0e7ff', text: '#3730a3' },
  { name: 'Light Purple', bg: '#f3e8ff', text: '#6b21a8' },
  { name: 'Mint', bg: '#d1fae5', text: '#047857' },
  { name: 'Peach', bg: '#fed7aa', text: '#9a3412' },
  { name: 'Slate', bg: '#e2e8f0', text: '#334155' },
  { name: 'Sky', bg: '#e0f2fe', text: '#0369a1' },
];

export const BADGE_PRESETS = [
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Cyan', color: '#06b6d4' },
];

export const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: '#d1fae5', text: '#065f46' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  high: { bg: '#fed7aa', text: '#9a3412' },
  critical: { bg: '#fecaca', text: '#991b1b' },
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'not-started': { bg: '#e2e8f0', text: '#475569' },
  'in-progress': { bg: '#dbeafe', text: '#1e40af' },
  'completed': { bg: '#d1fae5', text: '#065f46' },
  'pending': { bg: '#fef3c7', text: '#92400e' },
  'approved': { bg: '#d1fae5', text: '#065f46' },
  'rejected': { bg: '#fecaca', text: '#991b1b' },
};

export const TSHIRT_COLORS: Record<string, { bg: string; text: string }> = {
  'XS': { bg: '#dbeafe', text: '#1e40af' },
  'S': { bg: '#d1fae5', text: '#065f46' },
  'M': { bg: '#fef3c7', text: '#92400e' },
  'L': { bg: '#fed7aa', text: '#9a3412' },
  'XL': { bg: '#fecaca', text: '#991b1b' },
  'XXL': { bg: '#e9d5ff', text: '#6b21a8' },
};

/**
 * Darken a hex color by a fraction (0–1)
 */
export function darkenColor(hex: string, amount = 0.25): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(g * (1 - amount)).toString(16).padStart(2, '0')}${Math.round(b * (1 - amount)).toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex color to HSL
 * Returns h (0-360), s (0-100), l (0-100)
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 * Takes h (0-360), s (0-100), l (0-100)
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust brightness and saturation of a hex color
 * @param hex - The hex color to adjust
 * @param brightness - Brightness adjustment (-100 to 100), 0 = no change
 * @param saturation - Saturation adjustment (-100 to 100), 0 = no change
 */
export function adjustColor(hex: string, brightness: number = 0, saturation: number = 0): string {
  const hsl = hexToHsl(hex);
  
  // Adjust lightness (brightness)
  let newL = hsl.l + brightness;
  newL = Math.max(0, Math.min(100, newL));
  
  // Adjust saturation
  let newS = hsl.s + saturation;
  newS = Math.max(0, Math.min(100, newS));
  
  return hslToHex(hsl.h, newS, newL);
}

/**
 * Lighten a hex color by a fraction (0–1)
 */
export function lightenColor(hex: string, amount = 0.25): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r + (255 - r) * amount).toString(16).padStart(2, '0')}${Math.round(g + (255 - g) * amount).toString(16).padStart(2, '0')}${Math.round(b + (255 - b) * amount).toString(16).padStart(2, '0')}`;
}

/**
 * Get Tailwind shadow class based on shadow type
 */
export function getShadowClass(shadow: string): string {
  switch (shadow) {
    case 'none': return 'shadow-none';
    case 'soft': return 'shadow-sm shadow-slate-900/5';
    case 'medium': return 'shadow-md shadow-slate-900/10';
    case 'hard': return 'shadow-xl shadow-slate-900/20';
    case 'neon': return ''; // Handle via inline styles
    default: return 'shadow-sm shadow-slate-900/5';
  }
}
