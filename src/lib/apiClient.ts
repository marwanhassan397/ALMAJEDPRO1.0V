import { APP_BASE_PATH } from './basePath';

/**
 * IMPORTANT:
 * - Uses Vite BASE_URL so the same codebase works on:
 *   - ROOT (/)  -> BASE_URL="/"
 *   - Subfolder (/almajd/) -> BASE_URL="/almajd/"
 *
 * Note:
 * - In production, index.html writes a correct <base href="..."> at runtime, so even when
 *   BASE_URL is relative ("./"), relative fetch URLs resolve to the app root.
 */
export const API_BASE = `${import.meta.env.BASE_URL}api`;

/** Ensure we don't accidentally create double slashes. */
const joinUrl = (base: string, path: string) => {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
};

/**
 * Build an API URL.
 * `path` can be:
 * - "login.php"
 * - "/admin/profiles.php"
 */
export const apiUrl = (path: string) => joinUrl(API_BASE, path);

/**
 * Base fetch wrapper:
 * - ALWAYS sends cookies: credentials: "include"
 * - Adds JSON headers when sending a JSON body
 */
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);

  const init: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  // Auto JSON stringify plain objects
  if (
    init.body &&
    typeof init.body === 'object' &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof ArrayBuffer)
  ) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    init.body = JSON.stringify(init.body);
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return fetch(apiUrl(path), init);
};

const readJsonSafely = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const apiJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await apiFetch(path, options);
  const data = await readJsonSafely(res);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && String((data as any).message)) ||
      (data && typeof data === 'object' && 'error' in data && String((data as any).error)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
};

/**
 * Build a frontend (non-API) URL that respects the app base path.
 * Useful when the site is deployed inside a subfolder.
 */
export const appUrl = (path: string) => {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  // APP_BASE_PATH is always absolute and ends with "/"
  return `${APP_BASE_PATH}${clean}`;
};
