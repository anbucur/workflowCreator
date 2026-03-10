import type { Request, Response, NextFunction } from 'express';

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);

  next();
}

/**
 * Validates that a domain is a safe external Atlassian domain (not localhost/private IPs).
 * Used for Jira and Confluence proxy requests.
 */
export function isSafeJiraDomain(domain: string): boolean {
  if (!domain) return false;
  const trimmed = domain.trim();
  if (trimmed.includes('://') || trimmed.includes('/') || trimmed.includes('\\')) {
    return false;
  }
  try {
    const url = new URL(`https://${trimmed}`);
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return false;
    }
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(host)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
