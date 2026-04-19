const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

const normalizedApiUrl = rawApiUrl ? trimTrailingSlash(rawApiUrl) : '';
const normalizedBackendUrl = rawBackendUrl ? trimTrailingSlash(rawBackendUrl) : '';

export const API_URL = normalizedApiUrl
  ? normalizedApiUrl
  : normalizedBackendUrl
    ? `${normalizedBackendUrl}/api`
    : process.env.NODE_ENV === 'production'
      ? '/api'
      : 'http://127.0.0.1:5001/api';

export const SERVER_BASE = API_URL.replace(/\/api\/?$/, '');

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const resolveAssetUrl = (value?: string | null): string => {
  const url = value?.trim();

  if (!url) return '';
  if (ABSOLUTE_URL_PATTERN.test(url)) return url;

  // Agar / se shuru ho raha hai to base URL ke sath concatenate karein
  // Agar pehle se http se shuru ho raha hai to wahi rehne dein
  if (url.startsWith('/')) {
    return `${SERVER_BASE}${url}`;
  }
  
  return `${SERVER_BASE}/${url}`;
};
