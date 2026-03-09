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
