import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getMockPassword, resetAccountMock } from '@/app/mocks/account';
import { server } from '@/app/mocks/server';
import { resetCalculationDateMock } from '@/app/mocks/settings';
import { useSessionStore } from '@/entities/session';

import { OtherSettings } from '../ui';

const renderWidget = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OtherSettings />
    </QueryClientProvider>,
  );
};

const dateField = () => screen.getByRole('textbox', { name: 'Дата и время, UTC' });

const replaceText = async (user: UserEvent, field: HTMLElement, text: string) => {
  await user.clear(field);
  await user.type(field, text);
};

const openPasswordDialog = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Сменить пароль' }));
  return screen.getByRole('dialog', { name: 'Сменить пароль' });
};

describe('OtherSettings', () => {
  beforeEach(() => {
    resetCalculationDateMock();
    resetAccountMock();
    useSessionStore.getState().setUser({
      id: '1',
      email: 'admin',
      role: 'ADMIN',
      createdAt: '2026-10-01T00:00:00Z',
    });
  });

  afterEach(() => {
    useSessionStore.getState().clearSession();
    server.events.removeAllListeners();
  });

  it('показывает тему, дату расчёта и аккаунт', async () => {
    renderWidget();

    expect(await screen.findByRole('button', { name: 'Зафиксировать' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(dateField()).toHaveValue('19.10.2026, 15:00');
    expect(screen.getByText('admin (вы)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Тема' })).getByRole('button', {
        name: 'Как в системе',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('переключает тему', async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(screen.getByRole('button', { name: 'Тёмная' }));

    expect(screen.getByRole('button', { name: 'Тёмная' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    // Тема хранится в сторе между тестами — возвращаем по умолчанию
    await user.click(screen.getByRole('button', { name: 'Как в системе' }));
  });

  it('сохраняет новую дату расчёта и помнит её при переключении на текущую', async () => {
    const saved: unknown[] = [];
    server.events.on('request:start', async ({ request }) => {
      if (request.method === 'PUT') {
        saved.push(await request.clone().json());
      }
    });
    const user = userEvent.setup();
    renderWidget();
    await screen.findByRole('button', { name: 'Зафиксировать' });

    await replaceText(user, dateField(), '20.10.2026, 12:30');
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(saved).toEqual([{ mode: 'fixed', fixedAt: '2026-10-20T12:30:00.000Z' }]),
    );

    await user.click(screen.getByRole('button', { name: 'Текущая' }));
    expect(screen.queryByRole('textbox', { name: 'Дата и время, UTC' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Зафиксировать' }));
    expect(await screen.findByRole('textbox', { name: 'Дата и время, UTC' })).toHaveValue(
      '20.10.2026, 12:30',
    );
  });

  it('не сохраняет дату в неверном формате', async () => {
    let puts = 0;
    server.events.on('request:start', ({ request }) => {
      puts += request.method === 'PUT' ? 1 : 0;
    });
    const user = userEvent.setup();
    renderWidget();
    await screen.findByRole('button', { name: 'Зафиксировать' });

    await replaceText(user, dateField(), '31.02.2026, 12:00');
    await user.tab();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Введите дату и время как 19.10.2026, 15:00',
    );
    expect(puts).toBe(0);
  });

  it('меняет пароль на сгенерированный и сообщает об этом', async () => {
    const user = userEvent.setup();
    renderWidget();

    const dialog = await openPasswordDialog(user);
    const submit = within(dialog).getByRole('button', { name: 'Сменить' });
    expect(submit).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Текущий пароль'), 'Admin123');
    await user.click(within(dialog).getByRole('button', { name: 'Сгенерировать пароль' }));

    const next = within(dialog).getByLabelText('Новый пароль');
    const repeat = within(dialog).getByLabelText('Повторите новый пароль');
    expect(next).toHaveAttribute('type', 'text');
    expect((next as HTMLInputElement).value).toBe((repeat as HTMLInputElement).value);
    const generated = (next as HTMLInputElement).value;

    await user.click(submit);

    const done = await screen.findByRole('alertdialog', { name: 'Пароль изменён' });
    expect(screen.queryByRole('dialog', { name: 'Сменить пароль' })).not.toBeInTheDocument();
    expect(getMockPassword()).toBe(generated);
    await user.click(within(done).getByRole('button', { name: 'Понятно' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('подсвечивает неверный текущий пароль и несовпадение новых', async () => {
    const user = userEvent.setup();
    renderWidget();

    const dialog = await openPasswordDialog(user);
    await user.type(within(dialog).getByLabelText('Текущий пароль'), 'Wrong1234');
    await user.type(within(dialog).getByLabelText('Новый пароль'), 'Secret123');
    await user.type(within(dialog).getByLabelText('Повторите новый пароль'), 'Secret12');
    await user.tab();

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Пароли не совпадают');
    expect(within(dialog).getByRole('button', { name: 'Сменить' })).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Повторите новый пароль'), '3');
    await user.click(within(dialog).getByRole('button', { name: 'Сменить' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Неверный текущий пароль');
    expect(getMockPassword()).toBe('Admin123');
  });

  it('при отмене не хранит введённое', async () => {
    const user = userEvent.setup();
    renderWidget();

    let dialog = await openPasswordDialog(user);
    await user.type(within(dialog).getByLabelText('Текущий пароль'), 'Admin123');
    await user.click(within(dialog).getByRole('button', { name: 'Отмена' }));

    dialog = await openPasswordDialog(user);
    expect(within(dialog).getByLabelText('Текущий пароль')).toHaveValue('');
  });
});
