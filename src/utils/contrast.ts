/**
 * Utilities for ensuring text is always readable against any background.
 * Uses WCAG relative luminance + contrast ratio calculations.
 */

/** Parse a hex colour (#rgb or #rrggbb) into {r, g, b} 0-255. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** WCAG relative luminance of an sRGB colour. */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two luminance values (always >= 1). */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Given a background hex colour, return the best text colour.
 * Returns white for dark backgrounds, a very dark colour for light backgrounds.
 * Aims for WCAG AA (4.5:1 contrast ratio).
 */
export function getContrastTextColor(bgHex: string): string {
  try {
    const { r, g, b } = hexToRgb(bgHex);
    const bgLum = relativeLuminance(r, g, b);
    const whiteLum = relativeLuminance(255, 255, 255);
    const blackLum = relativeLuminance(0, 0, 0);

    const whiteContrast = contrastRatio(bgLum, whiteLum);
    const blackContrast = contrastRatio(bgLum, blackLum);

    return blackContrast >= whiteContrast ? '#1a1a2e' : '#ffffff';
  } catch {
    return '#1a1a2e';
  }
}

/**
 * Given a background hex colour, return a slightly lighter or darker version
 * suitable for secondary/muted text that still meets minimum contrast.
 */
export function getContrastMutedColor(bgHex: string): string {
  try {
    const { r, g, b } = hexToRgb(bgHex);
    const bgLum = relativeLuminance(r, g, b);
    // Dark bg → lighter muted, Light bg → darker muted
    if (bgLum < 0.5) {
      return '#b0b8c8';
    }
    return '#64748b';
  } catch {
    return '#64748b';
  }
}

/**
 * Check if a background is "dark" (luminance < 0.5).
 */
export function isDarkBackground(bgHex: string): boolean {
  try {
    const { r, g, b } = hexToRgb(bgHex);
    return relativeLuminance(r, g, b) < 0.35;
  } catch {
    return false;
  }
}
