import Constants from 'expo-constants';
import { Platform } from 'react-native';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
};

type ExpoConstantsShape = {
  expoConfig?: {
    hostUri?: string;
  };
  expoGoConfig?: {
    debuggerHost?: string;
  };
};

const constants = Constants as ExpoConstantsShape;
const localHostFromExpo =
  constants.expoConfig?.hostUri?.split(':')[0] ??
  constants.expoGoConfig?.debuggerHost?.split(':')[0];
const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  `http://${localHostFromExpo ?? fallbackHost}:8000/api`;

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(`${API_BASE_URL.replace(/\/$/, '')}/${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, query, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail?: string }).detail)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
