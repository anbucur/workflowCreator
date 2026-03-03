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
