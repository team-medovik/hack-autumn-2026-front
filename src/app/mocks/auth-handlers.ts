import { delay, http, HttpResponse } from 'msw';

import type { AuthenticationResponse, CurrentUserResponse } from '@/shared/api';

// Фейковый бэк авторизации с состоянием — работает, когда включены моки (по умолчанию в dev).
// Сгенерированные orval моки отдают случайные данные (refresh всегда «успешен»),
// поэтому вход/выход/восстановление сессии на них не проверить.
//
// Учётка: логин `admin`, пароль `Admin123` (под правила формы: заглавная, строчная, цифра, 8+).
// HttpOnly-cookie refresh_token имитируется ключом в localStorage — сессия переживает F5.

const MOCK_LOGIN = 'admin';
const MOCK_PASSWORD = 'Admin123';
const SESSION_KEY = 'msw:auth-session';
const ACCESS_TOKEN_TTL_SEC = 15 * 60;

const MOCK_USER: CurrentUserResponse = {
  id: '1',
  email: MOCK_LOGIN,
  role: 'ADMIN',
  createdAt: '2026-10-01T00:00:00Z',
};

const hasSession = () => {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const setSession = (active: boolean) => {
  try {
    if (active) {
      localStorage.setItem(SESSION_KEY, '1');
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Хранилище недоступно (приватный режим) — сессия просто не переживёт F5
  }
};

const issueTokens = (): AuthenticationResponse => ({
  accessToken: `mock-access-${Date.now()}`,
  expiresIn: ACCESS_TOKEN_TTL_SEC,
  user: MOCK_USER,
});

const unauthorized = (message: string) =>
  HttpResponse.json({ status: 401, error: 'Unauthorized', message }, { status: 401 });

export const authHandlers = [
  http.post('*/api/v1/auth/login', async ({ request }) => {
    await delay(600); // чтобы увидеть состояние «вход выполняется»
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email !== MOCK_LOGIN || body.password !== MOCK_PASSWORD) {
      return unauthorized('Неверный логин или пароль');
    }

    setSession(true);
    return HttpResponse.json(issueTokens());
  }),

  http.post('*/api/v1/auth/refresh', async () => {
    await delay(300);
    if (!hasSession()) {
      return unauthorized('Сессия не найдена');
    }
    return HttpResponse.json(issueTokens());
  }),

  http.post('*/api/v1/auth/logout', () => {
    setSession(false);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/api/v1/auth/me', ({ request }) => {
    if (!request.headers.get('Authorization')?.startsWith('Bearer mock-access-')) {
      return unauthorized('Нет access-токена');
    }
    return HttpResponse.json(MOCK_USER);
  }),
];
