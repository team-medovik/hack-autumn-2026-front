import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { MAIN_DASHBOARD, NO_SNAPSHOT_DASHBOARD } from '@/app/mocks/dashboard';
import { server } from '@/app/mocks/server';

import { HomePage } from '../ui';

const renderHomePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('HomePage', () => {
  it('показывает сводку, наивысший риск и очередь', async () => {
    renderHomePage();

    // Карточки видны сразу (со скелетонами) — ждём данные внутри
    const topRisk = screen.getByRole('region', { name: 'Наивысший риск' });
    expect(await within(topRisk).findByText('client5@mail.ru')).toBeInTheDocument();
    expect(within(topRisk).getByRole('link', { name: 'Открыть карточку клиента' })).toHaveAttribute(
      'href',
      '/clients/1321245',
    );

    const queue = screen.getByRole('region', { name: 'Первыми под риском' });
    expect(within(queue).getAllByRole('listitem')).toHaveLength(
      MAIN_DASHBOARD.riskQueue.items.length,
    );
  });

  it('без снимков предлагает загрузить снимок', async () => {
    server.use(
      http.get('*/api/v1/analytics/summary', () => HttpResponse.json(NO_SNAPSHOT_DASHBOARD)),
    );
    renderHomePage();

    expect(await screen.findByRole('heading', { name: 'Данных пока нет' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Загрузить снимок' })).toHaveAttribute(
      'href',
      '/snapshot',
    );
  });

  it('при ошибке показывает экран ошибки и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/api/v1/analytics/summary', () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 })
          : HttpResponse.json(MAIN_DASHBOARD);
      }),
    );
    renderHomePage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить данные');

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    const topRisk = await screen.findByRole('region', { name: 'Наивысший риск' });
    expect(await within(topRisk).findByText('client5@mail.ru')).toBeInTheDocument();
  });
});
