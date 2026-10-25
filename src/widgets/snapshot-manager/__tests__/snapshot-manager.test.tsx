import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetDataSourceMock } from '@/app/mocks/data-source';
import { server } from '@/app/mocks/server';
import { buildSnapshotFile, resetSnapshotsMock } from '@/app/mocks/snapshots';
import { useSessionStore } from '@/entities/session';

import { SnapshotManager } from '../ui';

const renderWidget = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <SnapshotManager />
    </QueryClientProvider>,
  );
  return container;
};

/** Сценарий моков из ?mock= — как в браузере. */
const setMockScenario = (scenario: string) =>
  window.history.replaceState(null, '', `/snapshot?mock=${scenario}`);

const snapshotFile = (clients: number, services: number, name = 'data-v2.json') =>
  new File([JSON.stringify(buildSnapshotFile({ clients, services }))], name, {
    type: 'application/json',
  });

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]')!;

const history = () => screen.getByRole('table', { name: 'История загрузок' });
const currentSnapshot = () => screen.getByRole('region', { name: 'Текущий снимок' });

/** История загружена — видна последняя загрузка. */
const waitForHistory = () => screen.findByText('23.10.2026, 22:10');

describe('SnapshotManager', () => {
  beforeEach(() => {
    resetSnapshotsMock();
    resetDataSourceMock();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    useSessionStore.getState().clearSession();
    vi.restoreAllMocks();
  });

  describe('источник данных — администратору', () => {
    beforeEach(() => {
      useSessionStore.getState().setUser({
        id: '1',
        login: 'admin',
        role: 'ADMIN',
        createdAt: '2026-10-01T00:00:00Z',
      });
    });

    it('JSON-снимок — пояснение, что AI-прогноз без истории событий недоступен', async () => {
      setMockScenario('json-source');
      renderWidget();
      await waitForHistory();

      expect(
        await within(currentSnapshot()).findByText(/В снимке нет истории событий/),
      ).toBeInTheDocument();
    });

    it('живая симуляция — вместо снимка, загрузка предупреждает об остановке', async () => {
      renderWidget();

      const source = await screen.findByRole('region', { name: 'Источник данных' });
      expect(within(source).getByText('Живая симуляция')).toBeInTheDocument();
      // «Скачать текущие данные» контракт пока не умеет
      expect(within(source).queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Текущий снимок' })).not.toBeInTheDocument();
      expect(
        screen.getByText(/^Симуляция остановится, данные заменятся снимком/),
      ).toBeInTheDocument();
    });

    it('загрузка снимка в живой симуляции спрашивает подтверждение и останавливает её', async () => {
      const user = userEvent.setup();
      const container = renderWidget();
      await screen.findByText('Живая симуляция');

      await user.upload(fileInput(container), snapshotFile(44, 121));
      const dialog = await screen.findByRole('alertdialog', { name: 'Заменить данные?' });
      expect(dialog).toHaveTextContent('Живая симуляция остановится');
      await user.click(within(dialog).getByRole('button', { name: 'Заменить' }));
      await user.click(await screen.findByRole('button', { name: 'Понятно' }));

      expect(
        await within(await screen.findByRole('region', { name: 'Текущий снимок' })).findByText(
          'data-v2.json',
        ),
      ).toBeInTheDocument();
    });
  });

  it('не администратору источник неизвестен — блок снимка без пояснения', async () => {
    renderWidget();
    await waitForHistory();

    expect(within(currentSnapshot()).queryByText(/истории событий/)).not.toBeInTheDocument();
  });

  it('показывает текущий снимок и историю загрузок', async () => {
    renderWidget();
    await waitForHistory();

    expect(within(currentSnapshot()).getByText('data.json')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скачать JSON' })).toBeInTheDocument();

    const rows = within(history()).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent('23.10.2026, 22:10data.json42 клиента, 118 услугanalyst');
    expect(rows[3]).toHaveTextContent('data-old.json40 клиентов, 109 услугanalyst2');
  });

  it('заменяет снимок после подтверждения и показывает итог', async () => {
    const user = userEvent.setup();
    const container = renderWidget();
    await waitForHistory();

    await user.upload(fileInput(container), snapshotFile(44, 121));

    const confirm = await screen.findByRole('alertdialog', { name: 'Заменить данные?' });
    expect(confirm).toHaveTextContent(
      'Файл data-v2.json: 44 клиента, 121 услуга. Текущий снимок data.json заменится полностью',
    );
    await user.click(within(confirm).getByRole('button', { name: 'Заменить' }));

    const done = await screen.findByRole('alertdialog', { name: 'Снимок загружен' });
    expect(done).toHaveTextContent(
      'data-v2.json: 44 клиента, 121 услуга. Риски и потери пересчитаны.',
    );
    await user.click(within(done).getByRole('button', { name: 'Понятно' }));

    await waitFor(() =>
      expect(within(currentSnapshot()).getByText('data-v2.json')).toBeInTheDocument(),
    );
    const rows = within(history()).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(rows[1]).toHaveTextContent('data-v2.json44 клиента, 121 услугаadmin');
    expect(screen.getByRole('button', { name: 'Выбрать файл' })).toBeInTheDocument();
  });

  it('ничего не меняет, если от замены отказались', async () => {
    const user = userEvent.setup();
    const container = renderWidget();
    await waitForHistory();

    await user.upload(fileInput(container), snapshotFile(44, 121));
    await user.click(await screen.findByRole('button', { name: 'Отмена' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(history()).getAllByRole('row')).toHaveLength(4);
    expect(within(currentSnapshot()).getByText('data.json')).toBeInTheDocument();
  });

  it('не принимает файл чужого формата и предлагает выбрать другой', async () => {
    const user = userEvent.setup();
    const container = renderWidget();
    await waitForHistory();

    const wrong = new File([JSON.stringify({ users: [] })], 'users.json', {
      type: 'application/json',
    });
    await user.upload(fileInput(container), wrong);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Файл не загружен');
    expect(alert).toHaveTextContent(
      'Не удалось извлечь данные из JSON: данные не соответствуют ожидаемому формату',
    );
    expect(screen.getByRole('button', { name: 'Выбрать другой файл' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('показывает ошибку, если сервер не принял загрузку', async () => {
    setMockScenario('snapshot-upload-error');
    const user = userEvent.setup();
    const container = renderWidget();
    await waitForHistory();

    await user.upload(fileInput(container), snapshotFile(44, 121));
    await user.click(await screen.findByRole('button', { name: 'Заменить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервер не ответил. Попробуйте загрузить файл ещё раз',
    );
  });

  it('первый снимок загружает без подтверждения', async () => {
    setMockScenario('snapshots-empty');
    const user = userEvent.setup();
    const container = renderWidget();

    expect(await screen.findByText('Ещё не загружали')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Скачать JSON' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.upload(fileInput(container), snapshotFile(2, 3, 'data.json'));

    expect(await screen.findByRole('alertdialog', { name: 'Снимок загружен' })).toHaveTextContent(
      'data.json: 2 клиента, 3 услуги.',
    );
  });

  it('при перетаскивании файла подсказывает отпустить его и принимает файл', async () => {
    renderWidget();
    await waitForHistory();

    const zone = screen.getByRole('region', { name: 'Загрузка снимка' });
    const file = snapshotFile(44, 121);
    const dataTransfer = { types: ['Files'], files: { item: () => file }, dropEffect: 'none' };

    fireEvent.dragEnter(zone, { dataTransfer });
    expect(screen.getByText('Отпустите, чтобы загрузить файл')).toBeInTheDocument();

    fireEvent.drop(zone, { dataTransfer });
    expect(screen.queryByText('Отпустите, чтобы загрузить файл')).not.toBeInTheDocument();
    expect(
      await screen.findByRole('alertdialog', { name: 'Заменить данные?' }),
    ).toBeInTheDocument();
  });

  it('открывает выбор файла по клику в любом месте зоны, по кнопке — один раз', async () => {
    const pick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWidget();
    await waitForHistory();

    await user.click(
      screen.getByText('Текущие данные полностью заменятся, риски и потери пересчитаются сами'),
    );
    expect(pick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Выбрать файл' }));
    expect(pick).toHaveBeenCalledTimes(2);
  });

  it('при перетаскивании и загрузке оставляет приглашение на месте — высота зоны не меняется', async () => {
    renderWidget();
    await waitForHistory();

    const zone = screen.getByRole('region', { name: 'Загрузка снимка' });
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'] } });

    expect(screen.getByText('Отпустите, чтобы загрузить файл')).toBeVisible();
    // Приглашение в разметке, но невидимо: держит высоту
    expect(zone.querySelector('.dropzone__layer--sizer')).toHaveTextContent(
      'Перетащите JSON-файл сюда или выберите на компьютере',
    );
  });

  it('скачивает текущий снимок под его именем', async () => {
    const createObjectURL = vi.fn(() => 'blob:snapshot');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWidget();
    await waitForHistory();

    await user.click(screen.getByRole('button', { name: 'Скачать JSON' }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('data.json');
  });

  it('при ошибке загрузки истории показывает сообщение и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/api/v1/snapshots', () => {
        requests += 1;
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
      }),
    );
    const user = userEvent.setup();
    renderWidget();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить снимки');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(requests).toBe(2);
  });
});
