import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';

import { ClientCardPage } from '../ui';

const ClientsStub = () => {
  const { pathname, search } = useLocation();
  return <p>Таблица {pathname + search}</p>;
};

const renderCard = (url: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/clients" element={<ClientsStub />} />
          <Route path="/clients/:clientId" element={<ClientCardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const getCard = () => screen.getByRole('dialog', { name: /client17@mail.ru/ });

/** Текст элемента без учёта вида пробелов: Intl отделяет «€» и «%» неразрывным пробелом. */
const plainText = (text: string) => (_: string, element: Element | null) =>
  element?.textContent?.replace(/\s/g, ' ') === text;

describe('ClientCardPage', () => {
  it('показывает риск, причины, деньги, услуги и место в таблице', async () => {
    renderCard('/clients/1321746');

    expect(await screen.findByRole('heading', { name: 'client17@mail.ru' })).toBeInTheDocument();
    const card = getCard();
    expect(within(card).getByText('ID 1321746')).toBeInTheDocument();
    expect(within(card).getAllByRole('meter', { name: 'Риск' })[0]).toHaveAttribute(
      'aria-valuenow',
      '94.2',
    );

    const factors = within(card).getByRole('list', { name: 'Почему высокий риск' });
    expect(within(factors).getAllByRole('listitem')).toHaveLength(3);
    expect(within(factors).getByText('+13,8')).toBeInTheDocument();

    const balance = within(card).getByLabelText('Баланс клиента');
    expect(within(balance).getByText(plainText('3,42 €'))).toBeInTheDocument();
    expect(within(balance).getByText(plainText('6,77 €'))).toBeInTheDocument();
    // Доступно на продления — по настройкам модели; бонусы и реферальный — справочно
    expect(within(balance).getByText('Доступно')).toBeInTheDocument();
    expect(within(balance).getByText('Бонусы')).toBeInTheDocument();
    expect(within(balance).getByText(plainText('2,00 €'))).toBeInTheDocument();
    expect(within(balance).getByText('Реф. баланс')).toBeInTheDocument();

    expect(within(card).getByRole('heading', { name: 'Услуги · 2' })).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /Ожидает оплаты/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(card).getByText('удалят 21.10, автопродление выкл.')).toBeInTheDocument();

    expect(await within(card).findByText('2 из 42')).toBeInTheDocument();
  });

  it('листает соседей по таблице с её фильтром и сохраняет его в ссылке', async () => {
    const user = userEvent.setup();
    renderCard('/clients/1321746?level=high');

    await screen.findByText('2 из 13');
    await user.click(screen.getByRole('link', { name: 'Следующий' }));

    expect(await screen.findByRole('heading', { name: 'client22@mail.ru' })).toBeInTheDocument();
    expect(await screen.findByText('3 из 13')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(await screen.findByText('Таблица /clients?level=high')).toBeInTheDocument();
  });

  it('объясняет, как посчитана потеря', async () => {
    const user = userEvent.setup();
    renderCard('/clients/1321746');

    await user.click(await screen.findByRole('button', { name: 'Как посчитано' }));

    const dialog = screen.getByRole('alertdialog', {
      name: /Как посчитана потеря 6,77\s€ в месяц/,
    });
    expect(within(dialog).getByText(/^Нужно на продления за 5\sдн\.$/)).toBeInTheDocument();
    expect(within(dialog).getByText('(9,90 − 6,48) / 9,90')).toBeInTheDocument();
    expect(within(dialog).getByText(plainText('35 %'))).toBeInTheDocument();
    expect(
      within(dialog).getByText(plainText('9,90 € × 0,942 × (0,5 + 0,5 × 0,35)')),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(plainText('6,27 €'))).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Понятно' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(getCard()).toBeInTheDocument();
  });

  it('без оценки — пояснение, прочерки и свёрнутые мёртвые услуги', async () => {
    renderCard('/clients/5101442');

    expect(await screen.findByText(/Оценки нет: у клиента не осталось живых услуг/)).toBeVisible();
    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Удалены/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: /Заблокирована/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('несуществующий клиент — «не найден»', async () => {
    renderCard('/clients/0');

    expect(await screen.findByText('Клиент не найден')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Карточка клиента' })).toBeInTheDocument();
  });

  it('при ошибке показывает сообщение и повторяет запрос', async () => {
    let requests = 0;
    server.use(
      http.get('*/api/v1/customers/:id', () => {
        requests += 1;
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
      }),
    );
    const user = userEvent.setup();
    renderCard('/clients/1321746');

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить карточку');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(requests).toBe(2);
  });
});
