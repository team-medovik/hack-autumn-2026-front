import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { resetUsersMock } from '@/app/mocks/users';
import { useSessionStore } from '@/entities/session';

import { UsersSettings } from '../ui';

const renderWidget = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <UsersSettings />
    </QueryClientProvider>,
  );
};

const GENERATED_PASSWORD = /^[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

const usersTable = () => screen.getByRole('table', { name: 'Пользователи' });
const rowOf = (login: string) =>
  within(usersTable())
    .getAllByRole('row')
    .find((row) => within(row).queryByText(login, { exact: true }));
const loginField = () => screen.getByLabelText('Логин');
const createButton = () => screen.getByRole('button', { name: 'Создать' });

/** Список загружен — видна строка аналитика. */
const waitForUsers = () => screen.findByText('analyst');

describe('UsersSettings', () => {
  beforeEach(() => {
    resetUsersMock();
    useSessionStore.getState().setUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      login: 'admin',
      role: 'ADMIN',
      createdAt: '2026-10-01T00:00:00Z',
    });
  });

  afterEach(() => {
    useSessionStore.getState().clearSession();
    server.events.removeAllListeners();
  });

  it('показывает учётки: себя без удаления, остальных — с ролью, датой и корзиной', async () => {
    renderWidget();
    await waitForUsers();

    const admin = rowOf('admin (вы)');
    expect(admin).toBeDefined();
    expect(within(admin!).getByText('Администратор')).toBeInTheDocument();
    expect(within(admin!).queryByRole('button')).not.toBeInTheDocument();

    const analyst = rowOf('analyst')!;
    expect(within(analyst).getByText('Пользователь')).toBeInTheDocument();
    expect(within(analyst).getByText('20.10.2026')).toBeInTheDocument();
    expect(within(analyst).getByRole('button', { name: 'Удалить analyst' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Удалить manager' })).toBeInTheDocument();
    expect(createButton()).toBeDisabled();
  });

  it('создаёт пользователя, показывает выданный сервером пароль и даёт скопировать данные', async () => {
    let body: unknown;
    server.events.on('request:start', async ({ request }) => {
      if (request.method === 'POST') {
        body = await request.clone().json();
      }
    });
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'manager2');
    await user.click(createButton());

    expect(await screen.findByText('Пользователь создан')).toBeInTheDocument();
    expect(body).toEqual({ login: 'manager2', role: 'EMPLOYEE', status: 'ACTIVE' });
    expect(loginField()).toHaveValue('manager2');
    const passwordField = screen.getByLabelText('Временный пароль');
    const password = (passwordField as HTMLInputElement).value;
    expect(password).toMatch(GENERATED_PASSWORD);
    expect(passwordField).toHaveAttribute('readonly');
    await waitFor(() => expect(rowOf('manager2')).toBeDefined());

    const copyButton = screen.getByRole('button', { name: 'Скопировать логин и пароль' });
    expect(copyButton).toHaveFocus();
    await user.click(copyButton);
    expect(await navigator.clipboard.readText()).toBe(`Логин: manager2\nПароль: ${password}`);
    expect(await screen.findByRole('button', { name: 'Скопировано' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Готово' }));

    expect(screen.getByText('Новый пользователь')).toBeInTheDocument();
    expect(loginField()).toHaveValue('');
    expect(loginField()).toHaveFocus();
    expect(screen.queryByLabelText('Временный пароль')).not.toBeInTheDocument();
  });

  it('не даёт создать с коротким логином', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'ab');
    await user.tab();

    expect(screen.getByText('Логин — от 3 символов')).toBeInTheDocument();
    expect(createButton()).toBeDisabled();

    await user.type(loginField(), 'c');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(createButton()).toBeEnabled();
  });

  it('подсвечивает занятый логин, пока его не поменяют', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'Analyst');
    await user.click(createButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Логин Analyst уже занят');
    expect(loginField()).toHaveAttribute('aria-invalid', 'true');
    expect(createButton()).toBeDisabled();

    await user.type(loginField(), '2');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(createButton()).toBeEnabled();
  });

  it('удаляет пользователя после подтверждения', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.click(screen.getByRole('button', { name: 'Удалить analyst' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Удалить пользователя analyst?' });
    expect(dialog).toHaveTextContent('Он сразу потеряет доступ к панели');
    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));

    await waitFor(() => expect(rowOf('analyst')).toBeUndefined());
    expect(rowOf('manager')).toBeDefined();
  });

  it('не удаляет, если передумали', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.click(screen.getByRole('button', { name: 'Удалить analyst' }));
    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(rowOf('analyst')).toBeDefined();
  });

  it('при ошибке загрузки показывает сообщение и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/api/v1/admin/users', () => {
        requests += 1;
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
      }),
    );
    const user = userEvent.setup();
    renderWidget();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить пользователей',
    );

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(requests).toBe(2);
  });
});
