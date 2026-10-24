import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAccessToken } from '@/entities/session';
import { refreshSession } from '@/features/auth';
import { api, setAccessTokenGetter } from '@/shared/api';

// Связываем axios (shared) с сессией (entities/features). Слой app может импортировать всё,
// поэтому связка живёт здесь.

// 1. Каждый запрос получает Bearer-токен из стора сессии
setAccessTokenGetter(getAccessToken);

// 2. 401 → один раз обновляем токен через /refresh и повторяем запрос.
//    Не получилось — refreshSession сбросит сессию, RequireAuth уведёт на /login.
type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

// Свой 401 у этих эндпоинтов означает «неверные данные» / «сессии нет», а не «токен протух»
const NO_REFRESH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'];

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }

  const config = error.config as RetriableConfig;
  const url = config.url ?? '';
  if (config._authRetried || NO_REFRESH_URLS.some((path) => url.includes(path))) {
    throw error;
  }

  const token = await refreshSession();
  if (!token) {
    throw error;
  }

  config._authRetried = true;
  config.headers.Authorization = `Bearer ${token}`;
  return api(config);
});
