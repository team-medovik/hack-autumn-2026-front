import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { resetSettingsMock } from '@/app/mocks/settings';
import { resetUsersMock } from '@/app/mocks/users';

import { SettingsPage } from '../ui';

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  // Data router — без него не работает блокировка ухода со страницы
  const router = createMemoryRouter(
    [
      { path: '/settings', element: <SettingsPage /> },
      { path: '/', element: <p>Главная</p> },
    ],
    { initialEntries: ['/settings'] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
};

/** Сценарий моков из ?mock= — как в браузере. */
const setMockScenario = (scenario: string) =>
  window.history.replaceState(null, '', `/settings?mock=${scenario}`);

const weightField = () => screen.getByRole('textbox', { name: 'Ожидает оплаты' });
const saveButton = () => screen.getByRole('button', { name: 'Сохранить' });

const typeValue = async (user: UserEvent, field: HTMLElement, value: string) => {
  await user.clear(field);
  await user.type(field, value);
  await user.tab();
};

/** Настройки загружены — видно плашку версии. */
const waitForSettings = () => screen.findByText('23.10.2026, 18:00, analyst');

describe('SettingsPage', () => {
  beforeEach(() => {
    resetSettingsMock();
    resetUsersMock();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    server.events.removeAllListeners();
  });

  it('показывает параметры модели, клиентов по уровням и последнее обновление', async () => {
    renderPage();
    await waitForSettings();

    expect(screen.getByRole('tab', { name: 'Модель' })).toHaveAttribute('aria-selected', 'true');
    expect(weightField()).toHaveValue('70');
    // Описание — в подсказке «?» и описывает поле; «было» не показываем, пока не меняли
    expect(weightField()).toHaveAccessibleDescription(
      'Срок услуги истёк, платформа ждёт оплату 5 дней и потом удаляет услугу. По умолчанию 70',
    );
    expect(screen.queryByText(/^было /)).not.toBeInTheDocument();
    expect(screen.queryByText('Пересчёт прогноза, мин')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Учёт баланса в потере, k' })).toHaveValue('0,5');
    expect(
      screen.getByRole('switch', { name: 'Считать бонусы доступными деньгами' }),
    ).toBeChecked();

    const scale = screen.getByRole('list', { name: 'Клиенты по уровням риска' });
    expect(within(scale).getByText('Низкий 0–39')).toBeInTheDocument();
    expect(within(scale).getByText('9 кл.')).toBeInTheDocument();
    expect(within(scale).getByText('14 кл.')).toBeInTheDocument();
    expect(within(scale).getByText('13 кл.')).toBeInTheDocument();

    expect(saveButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Сбросить по умолчанию' })).toBeDisabled();
  });

  it('сохраняет изменённый вес и показывает, что пересчёт выполнен', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');

    expect(screen.getByRole('slider', { name: 'Ожидает оплаты' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
    expect(screen.getByText('было 70')).toBeInTheDocument();

    await user.click(saveButton());

    expect(await screen.findByText('Сохранено, пересчёт выполнен')).toBeInTheDocument();
    expect(weightField()).toHaveValue('80');
    expect(screen.queryByText('было 70')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('не даёт сохранить высокий порог ниже среднего и пересчитывает шкалу', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, screen.getByRole('textbox', { name: 'Высокий от' }), '35');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Порог высокого должен быть больше порога среднего (40)',
    );
    expect(screen.getByRole('textbox', { name: 'Высокий от' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(saveButton()).toBeDisabled();

    await typeValue(user, screen.getByRole('textbox', { name: 'Высокий от' }), '80');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Высокий 80–100')).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it('отменяет правки и сохраняет черновик при смене вкладки', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');
    await user.click(screen.getByRole('tab', { name: 'Пользователи' }));
    await user.click(screen.getByRole('tab', { name: 'Модель' }));
    expect(weightField()).toHaveValue('80');

    await user.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(weightField()).toHaveValue('70');
    expect(saveButton()).toBeDisabled();
  });

  it('сбрасывает сохранённые настройки по умолчанию после подтверждения', async () => {
    let saves = 0;
    server.events.on('request:start', ({ request }) => {
      saves += request.method === 'PUT' ? 1 : 0;
    });
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');
    await user.click(saveButton());
    await screen.findByText('Сохранено, пересчёт выполнен');

    await user.click(screen.getByRole('button', { name: 'Сбросить по умолчанию' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Сбросить настройки по умолчанию?' });
    await user.click(within(dialog).getByRole('button', { name: 'Сбросить' }));

    await waitFor(() => expect(weightField()).toHaveValue('70'));
    expect(saves).toBe(2);
    expect(screen.getByRole('button', { name: 'Сбросить по умолчанию' })).toBeDisabled();
  });

  it('если сохранены значения по умолчанию, сброс только откатывает правки', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');
    await user.click(screen.getByRole('button', { name: 'Сбросить по умолчанию' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(weightField()).toHaveValue('70');
    expect(screen.getByText('23.10.2026, 18:00, analyst')).toBeInTheDocument();
  });

  it('при чужой версии предлагает загрузить её', async () => {
    setMockScenario('settings-conflict');
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');
    await user.click(saveButton());

    const dialog = await screen.findByRole('alertdialog', { name: 'Настройки уже изменили' });
    expect(dialog).toHaveTextContent('analyst сохранил версию 5 в 08:40, пока вы редактировали');

    await user.click(within(dialog).getByRole('button', { name: 'Загрузить новую' }));

    expect(weightField()).toHaveValue('75');
    expect(screen.getByText('24.10.2026, 08:40, analyst')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('при чужой версии может сохранить свою поверх', async () => {
    setMockScenario('settings-conflict');
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');
    await user.click(saveButton());

    const dialog = await screen.findByRole('alertdialog', { name: 'Настройки уже изменили' });
    await user.click(within(dialog).getByRole('button', { name: 'Сохранить поверх' }));

    expect(await screen.findByText('Сохранено, пересчёт выполнен')).toBeInTheDocument();
    expect(weightField()).toHaveValue('80');
  });

  it('спрашивает перед уходом с несохранёнными правками', async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await waitForSettings();

    await typeValue(user, weightField(), '80');

    await router.navigate('/');
    const dialog = await screen.findByRole('alertdialog', { name: 'Уйти без сохранения?' });
    await user.click(within(dialog).getByRole('button', { name: 'Остаться' }));
    expect(weightField()).toHaveValue('80');

    await router.navigate('/');
    await user.click(await screen.findByRole('button', { name: 'Уйти' }));
    expect(await screen.findByText('Главная')).toBeInTheDocument();
  });

  it('на вкладке «Пользователи» показывает учётки без плашки обновления модели', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }));

    expect(await screen.findByRole('table', { name: 'Пользователи' })).toBeInTheDocument();
    expect(screen.getByText('analyst')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Новый пользователь' })).toBeInTheDocument();
    expect(screen.queryByText('23.10.2026, 18:00, analyst')).not.toBeInTheDocument();
  });

  it('по наведению на «?» показывает подсказку параметра', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitForSettings();

    await user.hover(screen.getAllByRole('button', { name: 'Подсказка' })[0]);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Срок услуги истёк, платформа ждёт оплату 5 дней и потом удаляет услугу. По умолчанию 70',
    );
  });

  it('при ошибке загрузки показывает сообщение и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/settings/model', () => {
        requests += 1;
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
      }),
    );
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить настройки');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(requests).toBe(2);
  });
});
