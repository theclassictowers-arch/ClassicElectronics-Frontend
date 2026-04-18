const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

const normalizedApiUrl = rawApiUrl ? trimTrailingSlash(rawApiUrl) : '';
const normalizedBackendUrl = rawBackendUrl ? trimTrailingSlash(rawBackendUrl) : '';

export const API_URL = normalizedApiUrl
  ? normalizedApiUrl
  : normalizedBackendUrl
    ? `${normalizedBackendUrl}/api`
    : 'http://127.0.0.1:5001/api';

export const SERVER_BASE = API_URL.replace(/\/api\/?$/, '');
