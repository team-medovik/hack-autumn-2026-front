import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getMockPassword, resetAccountMock } from '@/app/mocks/account';
import { resetDataSourceMock } from '@/app/mocks/data-source';
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
    resetDataSourceMock();
    useSessionStore.getState().setUser({
      id: '1',
      login: 'admin',
      role: 'ADMIN',
      createdAt: '2026-10-01T00:00:00Z',
    });
  });

  afterEach(() => {
    useSessionStore.getState().clearSession();
    server.events.removeAllListeners();
    window.history.replaceState(null, '', '/');
  });

  describe('источник данных', () => {
    const sourceCard = () => screen.getByRole('region', { name: 'Источник данных' });
    const speedButton = (name: string) =>
      within(screen.getByRole('group', { name: 'Скорость симуляции' })).getByRole('button', {
        name,
      });
    const setScenario = (scenario: string) =>
      window.history.replaceState(null, '', `/settings?mock=${scenario}`);

    it('панель на JSON-снимке — генератор всё равно виден и управляется', async () => {
      setScenario('json-source');
      renderWidget();

      const card = sourceCard();
      expect(
        await within(card).findByText(
          'Панель сейчас считается по JSON-снимку — симуляция идёт в фоне',
        ),
      ).toBeInTheDocument();
      expect(within(card).getByText('Симуляция · работает')).toBeInTheDocument();
      expect(speedButton('×60')).toHaveAttribute('aria-pressed', 'true');
      expect(within(card).getByText('Данные симуляции синтетические')).toBeInTheDocument();
    });

    it('живая симуляция — состояние, виртуальное время со скоростью и сноска', async () => {
      renderWidget();

      const card = sourceCard();
      expect(await within(card).findByText('Симуляция · работает')).toBeInTheDocument();
      expect(
        within(card).getByText(/^Виртуальное время 06\.02\.2026, \d{2}:\d{2} · 1 минута = 1 час$/),
      ).toBeInTheDocument();
      expect(
        within(card).getByText(
          'Данные генерируются синтетически. Загрузка снимка остановит симуляцию',
        ),
      ).toBeInTheDocument();
      expect(speedButton('×60')).toHaveAttribute('aria-pressed', 'true');
      // Паузы, перезапуска и переключения источника в контракте пока нет
      expect(within(card).queryByRole('button', { name: 'Пауза' })).not.toBeInTheDocument();
      expect(within(card).queryByRole('button', { name: 'Перезапустить' })).not.toBeInTheDocument();
    });

    it('меняет скорость и показывает сохранённую сервером', async () => {
      const user = userEvent.setup();
      const requests: unknown[] = [];
      server.events.on('request:start', async ({ request }) => {
        if (request.method === 'PATCH' && request.url.endsWith('/admin/simulation/speed')) {
          requests.push(await request.clone().json());
        }
      });
      renderWidget();
      await within(sourceCard()).findByText('Симуляция · работает');

      await user.click(speedButton('×10'));

      // Скорость из ответа сервера — и в подписи, и в нажатой кнопке
      expect(await within(sourceCard()).findByText(/· 1 минута = 10 минут$/)).toBeInTheDocument();
      expect(speedButton('×10')).toHaveAttribute('aria-pressed', 'true');
      expect(speedButton('×60')).toHaveAttribute('aria-pressed', 'false');
      expect(requests).toEqual([{ runId: '6f5fb823-01c2-4c8a-a8d9-a20871bf09c3', timeScale: 10 }]);
    });

    it('симуляцию перезапустили (409) — скорость не меняется, состояние перечитываем', async () => {
      const user = userEvent.setup();
      server.use(
        http.patch('*/api/v1/admin/simulation/speed', () =>
          HttpResponse.json({ message: 'run changed' }, { status: 409 }),
        ),
      );
      renderWidget();
      await within(sourceCard()).findByText('Симуляция · работает');

      await user.click(speedButton('×1'));

      // Ответа нет — кнопки снова доступны, нажата прежняя скорость
      await waitFor(() => expect(speedButton('×1')).toBeEnabled());
      expect(speedButton('×60')).toHaveAttribute('aria-pressed', 'true');
      expect(within(sourceCard()).getByText(/· 1 минута = 1 час$/)).toBeInTheDocument();
    });

    it.each([
      ['simulation-paused', 'Симуляция · пауза'],
      ['simulation-finished', 'Симуляция · завершена'],
      ['simulation-starting', 'Симуляция · запускается'],
    ])('%s — «%s»', async (scenario, status) => {
      setScenario(scenario);
      renderWidget();

      expect(await within(sourceCard()).findByText(status)).toBeInTheDocument();
    });

    it('ошибка генератора — статус и доставка событий словами, с временем повтора', async () => {
      setScenario('simulation-error');
      renderWidget();

      expect(await within(sourceCard()).findByText('Симуляция · ошибка')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        /^Не получилось забрать события генератора\. Повтор в \d{2}:\d{2}$/,
      );
    });

    it('генератор не отвечает — не выдаём прошлое за работающую симуляцию', async () => {
      setScenario('simulation-unavailable');
      renderWidget();

      expect(
        await within(sourceCard()).findByText(
          'Генератор не отвечает — состояние симуляции неизвестно',
        ),
      ).toBeInTheDocument();
      expect(within(sourceCard()).queryByText(/^Симуляция ·/)).not.toBeInTheDocument();
      expect(
        within(sourceCard()).queryByRole('group', { name: 'Скорость симуляции' }),
      ).not.toBeInTheDocument();
    });

    it('сотруднику без роли ADMIN блок не показываем — контракт отдаёт его только админу', async () => {
      useSessionStore.getState().setUser({
        id: '2',
        login: 'analyst',
        role: 'EMPLOYEE',
        createdAt: '2026-10-20T09:00:00Z',
      });
      renderWidget();

      expect(await screen.findByRole('region', { name: 'Тема' })).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Источник данных' })).not.toBeInTheDocument();
    });
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
