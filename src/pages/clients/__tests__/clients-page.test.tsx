import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';

import { ClientsPage } from '../ui';

const ClientCardStub = () => <p>Карточка {useParams().clientId}</p>;

const renderClientsPage = (url = '/clients') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:clientId" element={<ClientCardStub />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const getTable = () => screen.getByRole('table', { name: 'Клиенты' });

/** Строки данных без шапки. */
const getBodyRows = () => within(getTable()).getAllByRole('row').slice(1);

/** Первая страница загрузилась. */
const waitForFirstPage = () => screen.findByText('1–12 из 42');

describe('ClientsPage', () => {
  it('показывает первую страницу по убыванию риска и счётчики фильтров', async () => {
    renderClientsPage();

    expect(await screen.findByText('1–12 из 42')).toBeInTheDocument();
    const rows = getBodyRows();
    expect(rows).toHaveLength(12);
    expect(within(rows[0]).getByText('client5@mail.ru')).toBeInTheDocument();

    const levels = screen.getByRole('group', { name: 'Уровень риска' });
    expect(within(levels).getByRole('button', { name: 'Все · 42' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(levels).getByRole('button', { name: 'Высокий · 13' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Риски' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('фильтрует по уровню риска', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await user.click(await screen.findByRole('button', { name: 'Средний · 14' }));

    expect(await screen.findByText('1–12 из 14')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Средний · 14' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(getBodyRows()[0]).getByText('client31@mail.ru')).toBeInTheDocument();
  });

  it('переключает страницы', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await user.click(await screen.findByRole('button', { name: 'Страница 4' }));

    expect(await screen.findByText('37–42 из 42')).toBeInTheDocument();
    expect(getBodyRows()).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Дальше' })).toBeDisabled();
  });

  it('сортирует по клику на заголовок', async () => {
    const user = userEvent.setup();
    renderClientsPage();
    await waitForFirstPage();

    await user.click(screen.getByRole('button', { name: 'Email' }));

    expect(screen.getByRole('columnheader', { name: 'Email' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(await within(getTable()).findByText('client1@mail.ru')).toBeInTheDocument();
    expect(within(getBodyRows()[0]).getByText('client1@mail.ru')).toBeInTheDocument();
  });

  it('ищет по email и сбрасывает поиск', async () => {
    const user = userEvent.setup();
    renderClientsPage();
    await waitForFirstPage();

    await user.type(screen.getByRole('searchbox', { name: 'Поиск по email или ID' }), 'client99');

    expect(await screen.findByText('По запросу «client99» ничего не нашлось')).toBeInTheDocument();
    expect(
      screen.getByText('Проверьте email или ID. Поиск идёт по всем 42 клиентам, без учёта фильтра'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить поиск' }));

    expect(await screen.findByText('1–12 из 42')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Поиск по email или ID' })).toHaveValue('');
  });

  it('открывает карточку клиента по клику на строку', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await user.click(await screen.findByText('client17@mail.ru'));

    expect(await screen.findByText('Карточка 1321746')).toBeInTheDocument();
  });

  it('при ошибке показывает сообщение и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/api/v1/customers', () => {
        requests += 1;
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
      }),
    );
    const user = userEvent.setup();
    renderClientsPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить клиентов');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(requests).toBe(2);
  });

  it('без снимка предлагает загрузить снимок и выключает пустые фильтры', async () => {
    server.use(
      http.get('*/api/v1/customers', () =>
        HttpResponse.json({
          items: [],
          page: 1,
          pageSize: 12,
          total: 0,
          levelCounts: { high: 0, medium: 0, low: 0, none: 0 },
        }),
      ),
    );
    renderClientsPage();

    expect(await screen.findByText('Клиентов пока нет')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Загрузить снимок' })).toHaveAttribute(
      'href',
      '/snapshot',
    );
    expect(screen.getByRole('button', { name: 'Все · 0' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Высокий · 0' })).toBeDisabled();
    expect(screen.queryByRole('navigation', { name: 'Страницы' })).not.toBeInTheDocument();
  });
});
