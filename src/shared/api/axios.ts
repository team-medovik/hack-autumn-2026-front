import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import { env } from '@/shared/config';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Access-токен ─────────────────────────────────────────────────────────────
// shared не знает о сторе сессии (он в entities), поэтому источник токена
// подключается снаружи — в src/app/setup-api.ts.
let getAccessToken: () => string | null = () => null;

export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter;
};

// Публичные эндпоинты (security: [] в контракте): протухший Bearer на них не шлём,
// иначе JWT-фильтр бэка может ответить 401 на /refresh — и сессия слетит.
const PUBLIC_AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'];

export const isPublicAuthUrl = (url = '') => PUBLIC_AUTH_URLS.some((path) => url.includes(path));

// ─── Request-интерсептор ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !isPublicAuthUrl(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response-интерсептор ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      // Глобальная обработка ошибок по статус-коду
      if (status === 401) {
        // Обработка неавторизованного доступа (например, редирект на логин)
        console.warn('Unauthorized — редирект на логин');
      }

      if (status === 403) {
        console.warn('Forbidden');
      }

      if (status && status >= 500) {
        console.error('Server error', status);
      }
    }

    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => api({ ...config, ...options }).then(({ data }) => data);

export type ErrorType<E> = AxiosError<E>;
export type BodyType<B> = B;
