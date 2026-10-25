import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAccessToken } from '@/entities/session';
import { refreshSession } from '@/features/auth';
import { api, isPublicAuthUrl, setAccessTokenGetter } from '@/shared/api';

// Связываем axios (shared) с сессией (entities/features). Слой app может импортировать всё,
// поэтому связка живёт здесь.

// 1. Каждый запрос получает Bearer-токен из стора сессии
setAccessTokenGetter(getAccessToken);

// 2. 401 → один раз обновляем токен через /refresh и повторяем запрос.
//    Не получилось — refreshSession сбросит сессию, RequireAuth уведёт на /login.
type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }

  // Свой 401 у публичных auth-эндпоинтов означает «неверные данные» / «сессии нет», а не «токен протух»
  const config = error.config as RetriableConfig;
  if (config._authRetried || isPublicAuthUrl(config.url)) {
    throw error;
  }

  // Запрос ушёл со старым токеном, а пока летел, сессию уже обновили — просто повторяем.
  // Лишний /refresh здесь ротировал бы cookie впустую.
  const sentToken = String(config.headers.Authorization ?? '').replace(/^Bearer /, '');
  const currentToken = getAccessToken();
  const token = currentToken && currentToken !== sentToken ? currentToken : await refreshSession();
  if (!token) {
    throw error;
  }

  config._authRetried = true;
  config.headers.Authorization = `Bearer ${token}`;
  return api(config);
});
