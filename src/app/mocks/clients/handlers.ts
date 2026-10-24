import { delay, http, HttpResponse } from 'msw';

import { CLIENT_CARDS } from './card-fixtures';
import { getClientPosition } from './client-position';
import { CLIENTS } from './fixtures';
import { queryClients } from './query-clients';
import { readMockScenario } from '../scenario';

/**
 * Сценарии GET /customers — по одному на макет «Сводная таблица (…)». Выбираются параметром
 * страницы, общим с дашбордом: /clients?mock=no-data
 * main     — 42 клиента (по умолчанию); «ничего не найдено» — просто поиск, например client99
 * no-data  — снимков ещё не загружали
 * loading  — запрос висит, видны скелетоны
 * error    — сервер не отвечает
 */
export const CLIENTS_SCENARIOS = ['main', 'no-data', 'loading', 'error'] as const;

/**
 * Сценарии карточки клиента — по макетам «Карточка клиента (…)»: /clients/1321746?mock=card-loading
 * main          — данные; «без оценки» — любой клиент без оценки, например /clients/5101442
 * card-loading  — карточка грузится (место в списке — сразу, как в макете)
 * card-error    — сервер не отвечает
 * «Клиент не найден» — несуществующий ID, например /clients/0
 */
export const CLIENT_CARD_SCENARIOS = ['main', 'card-loading', 'card-error'] as const;

const notFound = () => HttpResponse.json({ message: 'Client not found' }, { status: 404 });

export const clientsHandlers = [
  http.get('*/api/v1/customers', async ({ request }) => {
    const scenario = readMockScenario(CLIENTS_SCENARIOS, 'main');

    if (scenario === 'loading') {
      await delay('infinite');
    }

    // Небольшая задержка, чтобы в dev были видны скелетоны; в тестах — без неё
    await delay();

    if (scenario === 'error') {
      return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
    }

    const clients = scenario === 'no-data' ? [] : CLIENTS;
    return HttpResponse.json(queryClients(clients, new URL(request.url).searchParams));
  }),

  http.get<{ id: string }>('*/api/v1/customers/:id/position', async ({ params, request }) => {
    await delay();

    if (!CLIENT_CARDS.has(params.id)) {
      return notFound();
    }
    return HttpResponse.json(
      getClientPosition(CLIENTS, params.id, new URL(request.url).searchParams),
    );
  }),

  http.get<{ id: string }>('*/api/v1/customers/:id', async ({ params }) => {
    const scenario = readMockScenario(CLIENT_CARD_SCENARIOS, 'main');

    if (scenario === 'card-loading') {
      await delay('infinite');
    }

    await delay();

    if (scenario === 'card-error') {
      return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
    }

    const card = CLIENT_CARDS.get(params.id);
    return card ? HttpResponse.json(card) : notFound();
  }),
];
