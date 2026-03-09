/**
 * Thumbnail capture utility for project tabs
 * Captures efficient snapshots of the canvas for preview
 */

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1 for JPEG quality
  backgroundColor?: string;
}

const DEFAULT_OPTIONS: ThumbnailOptions = {
  width: 160,
  height: 90,
  quality: 0.7,
  backgroundColor: '#f8fafc',
};

/**
 * Capture a thumbnail from a DOM element
 */
export async function captureThumbnail(
  element: HTMLElement,
  options: ThumbnailOptions = {}
): Promise<string | null> {
  const { width, height, quality, backgroundColor } = { ...DEFAULT_OPTIONS, ...options };

  if (!element) {
    console.warn('captureThumbnail: No element provided');
    return null;
  }

  try {
    // Use html2canvas if available, otherwise fall back to native canvas
    const canvas = document.createElement('canvas');
    canvas.width = width!;
    canvas.height = height!;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.warn('captureThumbnail: Could not get canvas context');
      return null;
    }

    // Fill background
    ctx.fillStyle = backgroundColor!;
    ctx.fillRect(0, 0, width!, height!);

    // Calculate scale to fit
    const rect = element.getBoundingClientRect();
    const scaleX = width! / rect.width;
    const scaleY = height! / rect.height;
    const scale = Math.min(scaleX, scaleY);

    // Center the content
    const scaledWidth = rect.width * scale;
    const scaledHeight = rect.height * scale;
    const offsetX = (width! - scaledWidth) / 2;
    const offsetY = (height! - scaledHeight) / 2;

    // Try to use native canvas drawing for better performance
    // For SVG-based content, we can use foreignObject
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw the element using drawImage if it contains images/canvas
    // For complex DOM, we need html2canvas
    try {
      // @ts-ignore - html2canvas might be loaded
      if (typeof html2canvas !== 'undefined') {
        // @ts-ignore
        const htmlCanvas = await html2canvas(element, {
          backgroundColor: backgroundColor,
          scale: scale * 0.5, // Lower scale for thumbnail
          logging: false,
          useCORS: true,
        });
        ctx.drawImage(htmlCanvas, 0, 0, scaledWidth, scaledHeight);
      }
    } catch {
      // html2canvas not available or failed
    }

    ctx.restore();

    // Convert to base64 JPEG
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error('captureThumbnail error:', error);
    return null;
  }
}

/**
 * Capture thumbnail from the infographic renderer element
 */
export async function captureInfographicThumbnail(
  containerSelector: string = '.infographic-container'
): Promise<string | null> {
  const element = document.querySelector(containerSelector) as HTMLElement;
  if (!element) {
    console.warn('captureInfographicThumbnail: Container not found');
    return null;
  }

  return captureThumbnail(element, {
    width: 160,
    height: 90,
    quality: 0.6,
  });
}

/**
 * Create a simple placeholder thumbnail with project name
 */
export function createPlaceholderThumbnail(name: string, color: string = '#3b82f6'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 160, 90);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustColor(color, -30));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 160, 90);

  // Project name (truncated)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
  ctx.fillText(displayName, 80, 45);

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Debounced thumbnail capture to avoid performance issues
 */
let thumbnailTimeout: ReturnType<typeof setTimeout> | null = null;

export function debouncedCaptureThumbnail(
  element: HTMLElement,
  callback: (thumbnail: string | null) => void,
  delay: number = 500
): void {
  if (thumbnailTimeout) {
    clearTimeout(thumbnailTimeout);
  }

  thumbnailTimeout = setTimeout(async () => {
    const thumbnail = await captureThumbnail(element);
    callback(thumbnail);
    thumbnailTimeout = null;
  }, delay);
}