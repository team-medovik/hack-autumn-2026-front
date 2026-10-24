import { delay, http, HttpResponse } from 'msw';

import { CLIENTS } from './fixtures';
import { queryClients } from './query-clients';
import { readMockScenario } from '../scenario';

/**
 * Сценарии GET /clients — по одному на макет «Сводная таблица (…)». Выбираются параметром
 * страницы, общим с дашбордом: /clients?mock=no-data
 * main     — 42 клиента (по умолчанию); «ничего не найдено» — просто поиск, например client99
 * no-data  — снимков ещё не загружали
 * loading  — запрос висит, видны скелетоны
 * error    — сервер не отвечает
 */
export const CLIENTS_SCENARIOS = ['main', 'no-data', 'loading', 'error'] as const;

export const clientsHandlers = [
  http.get('*/clients', async ({ request }) => {
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
];
