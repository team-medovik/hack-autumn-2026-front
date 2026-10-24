import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { api, setAccessTokenGetter } from '@/shared/api';

import { getAccessToken, useSessionStore } from '..';

const USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  login: 'admin',
  role: 'ADMIN',
  createdAt: '2026-10-01T00:00:00Z',
} as const;

/** Ответ /login или /refresh с этим токеном. */
const session = (accessToken: string) => ({ accessToken, expiresIn: 900, user: USER });

describe('session store', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getInitialState(), true);
  });

  it('стартует в статусе unknown без токена', () => {
    expect(useSessionStore.getState().status).toBe('unknown');
    expect(getAccessToken()).toBeNull();
  });

  it('setSession сохраняет токен, пользователя и срок жизни', () => {
    const before = Date.now();
    useSessionStore.getState().setSession({
      accessToken: 'token-1',
      expiresIn: 60,
      user: USER,
    });

    const state = useSessionStore.getState();
    expect(state.status).toBe('authenticated');
    expect(getAccessToken()).toBe('token-1');
    expect(state.user?.login).toBe('admin');
    expect(state.expiresAt).toBeGreaterThanOrEqual(before + 60_000);
  });

  it('clearSession сбрасывает сессию в anonymous', () => {
    useSessionStore.getState().setSession(session('token-1'));
    useSessionStore.getState().clearSession();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(getAccessToken()).toBeNull();
  });

  it('axios отправляет токен из стора в Authorization', async () => {
    let authHeader: string | null = null;
    server.use(
      http.get('*/ping', ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );
    setAccessTokenGetter(getAccessToken);
    useSessionStore.getState().setSession(session('token-2'));

    await api.get('/ping');

    expect(authHeader).toBe('Bearer token-2');
  });
});
