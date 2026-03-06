/**
 * Security validation utilities
 */

/**
 * Validates that a logo URL is safe to use.
 * Only allows data URLs (base64 encoded images) and blocks dangerous protocols.
 */
export const isValidLogoUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Allow data URLs (base64 encoded images)
  if (url.startsWith('data:image/')) {
    const validTypes = [
      'data:image/png',
      'data:image/jpeg',
      'data:image/jpg',
    ];
    return validTypes.some((type) => url.startsWith(type));
  }

  // Block dangerous protocols that could lead to XSS
  const dangerousProtocols = /^(javascript|data:text|vbscript|file|about|chrome|resource):/i;
  if (dangerousProtocols.test(url)) {
    return false;
  }

  // For this application, we only accept data URLs for logos
  // This prevents external URL-based attacks
  return false;
};

/**
 * Sanitizes infographic data before loading to prevent XSS attacks.
 */
export const sanitizeInfographicData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data } as Record<string, unknown>;

  // Sanitize logoUrl in titleBar
  if (sanitized.titleBar && typeof sanitized.titleBar === 'object') {
    const titleBar = { ...sanitized.titleBar } as Record<string, unknown>;
    if (titleBar.logoUrl && !isValidLogoUrl(titleBar.logoUrl as string)) {
      titleBar.logoUrl = '';
    }
    sanitized.titleBar = titleBar;
  }

  return sanitized;
};
