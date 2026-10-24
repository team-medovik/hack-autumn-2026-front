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
const passwordField = () => screen.getByLabelText('Пароль');
const createButton = () => screen.getByRole('button', { name: 'Создать' });

/** Список загружен — видна строка аналитика. */
const waitForUsers = () => screen.findByText('analyst');

describe('UsersSettings', () => {
  beforeEach(() => {
    resetUsersMock();
    useSessionStore.getState().setUser({
      id: '1',
      login: 'admin',
      role: 'ADMIN',
      createdAt: '2026-10-01T00:00:00Z',
    });
  });

  afterEach(() => {
    useSessionStore.getState().clearSession();
  });

  it('показывает учётки: себя без удаления, остальных — с датой, автором и корзиной', async () => {
    renderWidget();
    await waitForUsers();

    const admin = rowOf('admin (вы)');
    expect(admin).toBeDefined();
    expect(within(admin!).getByText('Администратор')).toBeInTheDocument();
    expect(within(admin!).getByText('из конфигурации')).toBeInTheDocument();
    expect(within(admin!).queryByRole('button')).not.toBeInTheDocument();

    const analyst = rowOf('analyst')!;
    expect(within(analyst).getByText('Пользователь')).toBeInTheDocument();
    expect(within(analyst).getByText('20.10.2026')).toBeInTheDocument();
    expect(within(analyst).getByText('admin')).toBeInTheDocument();
    expect(within(analyst).getByRole('button', { name: 'Удалить analyst' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Удалить manager' })).toBeInTheDocument();
    expect(createButton()).toBeDisabled();
  });

  it('создаёт пользователя со сгенерированным паролем и даёт скопировать данные', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'manager2');
    await user.click(screen.getByRole('button', { name: 'Сгенерировать пароль' }));

    expect(passwordField()).toHaveAttribute('type', 'password');
    expect((passwordField() as HTMLInputElement).value).toMatch(GENERATED_PASSWORD);
    expect(screen.queryByRole('button', { name: 'Сгенерировать пароль' })).not.toBeInTheDocument();
    expect(createButton()).toHaveFocus();

    await user.click(createButton());

    expect(await screen.findByText('Пользователь создан')).toBeInTheDocument();
    expect(loginField()).toHaveValue('manager2');
    const password = (passwordField() as HTMLInputElement).value;
    expect(password).toMatch(GENERATED_PASSWORD);
    expect(passwordField()).toHaveAttribute('readonly');
    expect(rowOf('manager2')).toBeDefined();

    const copyButton = screen.getByRole('button', { name: 'Скопировать логин и пароль' });
    expect(copyButton).toHaveFocus();
    await user.click(copyButton);
    expect(await navigator.clipboard.readText()).toBe(`Логин: manager2\nПароль: ${password}`);
    expect(await screen.findByRole('button', { name: 'Скопировано' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Готово' }));

    expect(screen.getByText('Новый пользователь')).toBeInTheDocument();
    expect(loginField()).toHaveValue('');
    expect(loginField()).toHaveFocus();
    expect(passwordField()).toHaveValue('');
  });

  it('не даёт создать с коротким логином или слабым паролем', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'ab');
    await user.type(passwordField(), 'secret12');
    await user.tab();

    expect(screen.getByText('Логин — от 3 символов')).toBeInTheDocument();
    expect(
      screen.getByText('От 8 символов: строчная и заглавная буквы и цифра'),
    ).toBeInTheDocument();
    expect(createButton()).toBeDisabled();

    await user.type(loginField(), 'c');
    await user.clear(passwordField());
    await user.type(passwordField(), 'Secret12');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(createButton()).toBeEnabled();
  });

  it('подсвечивает занятый логин, пока его не поменяют', async () => {
    const user = userEvent.setup();
    renderWidget();
    await waitForUsers();

    await user.type(loginField(), 'Analyst');
    await user.type(passwordField(), 'Secret123');
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
      http.get('*/api/v1/users', () => {
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
