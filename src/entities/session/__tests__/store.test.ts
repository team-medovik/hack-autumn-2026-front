import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { api, setAccessTokenGetter } from '@/shared/api';

import { getAccessToken, useSessionStore } from '..';

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
      user: { id: '1', email: 'a@b.c' },
    });

    const state = useSessionStore.getState();
    expect(state.status).toBe('authenticated');
    expect(getAccessToken()).toBe('token-1');
    expect(state.user?.email).toBe('a@b.c');
    expect(state.expiresAt).toBeGreaterThanOrEqual(before + 60_000);
  });

  it('clearSession сбрасывает сессию в anonymous', () => {
    useSessionStore.getState().setSession({ accessToken: 'token-1' });
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
    useSessionStore.getState().setSession({ accessToken: 'token-2' });

    await api.get('/ping');

    expect(authHeader).toBe('Bearer token-2');
  });
});
