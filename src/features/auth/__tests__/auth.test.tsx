import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { useSessionStore } from '@/entities/session';
import { AuthPage } from '@/pages/auth';
import { api } from '@/shared/api';

import { GuestOnly, refreshSession, RequireAuth } from '..';

const resetSession = () => useSessionStore.setState(useSessionStore.getInitialState(), true);

const USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  login: 'admin',
  role: 'ADMIN',
  createdAt: '2026-10-01T00:00:00Z',
} as const;

/** Ответ /login или /refresh с этим токеном. */
const session = (accessToken: string) => ({ accessToken, expiresIn: 900, user: USER });

describe('refreshSession', () => {
  beforeEach(resetSession);

  it('при пачке вызовов делает один запрос /refresh и сохраняет токен', async () => {
    let calls = 0;
    server.use(
      http.post('*/auth/refresh', () => {
        calls += 1;
        return HttpResponse.json({ accessToken: 'fresh', expiresIn: 60 });
      }),
    );

    const tokens = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(calls).toBe(1);
    expect(tokens).toEqual(['fresh', 'fresh', 'fresh']);
    expect(useSessionStore.getState().status).toBe('authenticated');
  });

  it('при ошибке /refresh сбрасывает сессию в anonymous', async () => {
    server.use(http.post('*/auth/refresh', () => new HttpResponse(null, { status: 401 })));

    await expect(refreshSession()).resolves.toBeNull();
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('при сбое сервера (5xx) не разлогинивает уже вошедшего пользователя', async () => {
    useSessionStore.getState().setSession(session('old'));
    server.use(http.post('*/auth/refresh', () => new HttpResponse(null, { status: 502 })));

    await expect(refreshSession()).resolves.toBeNull();
    expect(useSessionStore.getState().status).toBe('authenticated');
  });

  it('на /refresh не отправляет протухший Bearer', async () => {
    useSessionStore.getState().setSession(session('expired'));
    let authHeader: string | null = 'not-called';
    server.use(
      http.post('*/auth/refresh', ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return HttpResponse.json({ accessToken: 'fresh' });
      }),
    );

    await refreshSession();

    expect(authHeader).toBeNull();
  });
});

describe('401-интерсептор (app/setup-api)', () => {
  beforeAll(async () => {
    // setup-api при импорте восстанавливает сессию — отвечаем «сессии нет»
    server.use(http.post('*/auth/refresh', () => new HttpResponse(null, { status: 401 })));
    await import('@/app/setup-api');
  });

  beforeEach(resetSession);

  it('обновляет токен и повторяет запрос с новым Bearer', async () => {
    useSessionStore.getState().setSession(session('expired'));
    server.use(
      http.post('*/auth/refresh', () => HttpResponse.json({ accessToken: 'fresh' })),
      http.get('*/api/v1/customers', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 }),
      ),
    );

    const { data } = await api.get('/api/v1/customers');

    expect(data).toEqual({ ok: true });
    expect(useSessionStore.getState().accessToken).toBe('fresh');
  });

  it('если токен обновили, пока запрос летел, — повторяет без лишнего /refresh', async () => {
    useSessionStore.getState().setSession(session('old'));
    let refreshCalls = 0;
    server.use(
      http.post('*/auth/refresh', () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: 'other' });
      }),
      http.get('*/api/v1/customers', ({ request }) => {
        if (request.headers.get('Authorization') === 'Bearer new') {
          return HttpResponse.json({ ok: true });
        }
        // Пока запрос со старым токеном «летел», сессию обновил другой запрос
        useSessionStore.getState().setSession(session('new'));
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const { data } = await api.get('/api/v1/customers');

    expect(data).toEqual({ ok: true });
    expect(refreshCalls).toBe(0);
  });

  it('если /refresh не помог — пробрасывает 401 и сбрасывает сессию', async () => {
    useSessionStore.getState().setSession(session('expired'));
    server.use(
      http.post('*/auth/refresh', () => new HttpResponse(null, { status: 401 })),
      http.get('*/api/v1/customers', () => new HttpResponse(null, { status: 401 })),
    );

    await expect(api.get('/api/v1/customers')).rejects.toMatchObject({ response: { status: 401 } });
    expect(useSessionStore.getState().status).toBe('anonymous');
  });
});

describe('вход', () => {
  const renderApp = (initialPath: string) => {
    const router = createMemoryRouter(
      [
        { element: <GuestOnly />, children: [{ path: '/login', element: <AuthPage /> }] },
        {
          element: <RequireAuth />,
          children: [
            { path: '/', element: <p>Главная</p> },
            { path: '/clients', element: <p>Клиенты</p> },
          ],
        },
      ],
      { initialEntries: [initialPath] },
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    resetSession();
    useSessionStore.getState().clearSession();
  });

  it('без сессии уводит на /login', () => {
    renderApp('/clients');
    expect(screen.getByText('вход в админ-панéль')).toBeInTheDocument();
  });

  // Форма входа ничего не проверяет сама: любые логин и пароль уходят на сервер, ответ — его
  it.each([
    ['ab', 'Admin123'],
    ['admin', 'Abc1'],
    ['admin', 'abcdefgh'],
  ])('логин «%s» и пароль «%s» уходят на сервер без проверки', async (login, password) => {
    let body: unknown;
    server.use(
      http.post('*/auth/login', async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 401 });
      }),
    );
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(screen.getByLabelText('логин'), login);
    await user.type(screen.getByLabelText('пароль'), password);
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    expect(await screen.findByText('Неверный логин или пароль')).toBeInTheDocument();
    expect(body).toEqual({ login, password });
  });

  it('при 401 показывает ошибку под паролем и очищает его, логин остаётся', async () => {
    server.use(http.post('*/auth/login', () => new HttpResponse(null, { status: 401 })));
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(screen.getByLabelText('логин'), 'admin');
    await user.type(screen.getByLabelText('пароль'), 'Wrong1234');
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    expect(await screen.findByText('Неверный логин или пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('пароль')).toHaveValue('');
    expect(screen.getByLabelText('логин')).toHaveValue('admin');
  });

  it('после входа возвращает туда, куда шёл пользователь', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ accessToken: 'token', expiresIn: 60, user: { login: 'admin' } }),
      ),
    );
    const user = userEvent.setup();
    renderApp('/clients');

    await user.type(screen.getByLabelText('логин'), 'admin');
    await user.type(screen.getByLabelText('пароль'), 'Secret123');
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    await waitFor(() => expect(screen.getByText('Клиенты')).toBeInTheDocument());
    expect(useSessionStore.getState().accessToken).toBe('token');
  });
});
