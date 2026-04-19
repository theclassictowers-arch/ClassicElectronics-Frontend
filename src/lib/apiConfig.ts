const trimTrailingSlash = (value: string) => value?.trim().replace(/\/+$/, '') || '';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

const normalizedApiUrl = rawApiUrl ? trimTrailingSlash(rawApiUrl) : '';
const normalizedBackendUrl = rawBackendUrl ? trimTrailingSlash(rawBackendUrl) : '';

const DEFAULT_PROD_API = 'https://api.classicelectronics.com.pk/api';
const DEFAULT_DEV_API = 'http://localhost:5001/api';

export const API_URL = normalizedApiUrl || 
                      ((normalizedBackendUrl ? `${normalizedBackendUrl}/api` : 
                      (process.env.NODE_ENV === 'production' ? DEFAULT_PROD_API : DEFAULT_DEV_API)) + '/');

// Ensure SERVER_BASE hamesha domain + protocol ho (e.g., http://localhost:5001)
// Is se browser requests seedha backend par jayengi, Next.js router par nahi.
const baseFromApi = (API_URL && API_URL.startsWith('http')) ? API_URL.split('/api')[0] : '';
export const SERVER_BASE = normalizedBackendUrl || 
                          trimTrailingSlash(baseFromApi) || 
                          (process.env.NODE_ENV === 'production' || typeof window !== 'undefined' && window.location.hostname.includes('classicelectronics.com.pk') ? 'https://api.classicelectronics.com.pk' : 'http://localhost:5001');

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const resolveAssetUrl = (value?: string | null): string => {
  const assetPath = value?.trim();

  if (!assetPath) return '';
  if (ABSOLUTE_URL_PATTERN.test(assetPath)) return assetPath;

  try {
    // Modern URL API handles slashes automatically
    return new URL(assetPath.startsWith('/') ? assetPath.slice(1) : assetPath, `${SERVER_BASE}/`).toString();
  } catch (e) {
    console.error("Error resolving asset URL:", e);
    return assetPath;
  }
};
