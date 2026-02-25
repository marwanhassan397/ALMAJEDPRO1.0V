/**
 * Base path helpers
 *
 * Goal:
 * - Work when deployed at ROOT (/) or inside a subfolder like (/almajd/)
 * - Avoid broken links / API calls on deep SPA routes
 *
 * Implementation:
 * - index.html writes <base href="..."> at runtime into <head> (see index.html).
 * - We read that via document.baseURI (or window.__APP_BASE_PATH__ fallback).
 */

declare global {
  interface Window {
    __APP_BASE_PATH__?: string;
  }
}

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

export const APP_BASE_PATH = (() => {
  // SSR-safe default
  if (typeof window === 'undefined') {
    return ensureTrailingSlash(import.meta.env.BASE_URL || '/');
  }

  if (typeof window.__APP_BASE_PATH__ === 'string' && window.__APP_BASE_PATH__.trim()) {
    return ensureTrailingSlash(window.__APP_BASE_PATH__.trim());
  }

  try {
    // Resolve Vite BASE_URL against the document base (affected by <base href="...">).
    const resolved = new URL(import.meta.env.BASE_URL || '/', document.baseURI);
    return ensureTrailingSlash(resolved.pathname || '/');
  } catch {
    return ensureTrailingSlash(import.meta.env.BASE_URL || '/');
  }
})();

export const withBase = (path: string) => {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${APP_BASE_PATH}${clean}`;
};

export const stripBase = (pathname: string) => {
  const base = APP_BASE_PATH.replace(/\/+$/, ''); // no trailing slash
  if (!base || base === '/') return pathname;
  if (pathname === base) return '/';
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
  return pathname;
};
