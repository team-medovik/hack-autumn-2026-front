import { delay, http, HttpResponse } from 'msw';

import type { DashboardResponse } from '@/entities/dashboard';

import {
  MAIN_DASHBOARD,
  NO_SNAPSHOT_DASHBOARD,
  OPTIMISTIC_DASHBOARD,
  QUIET_DASHBOARD,
} from './fixtures';
import { readMockScenario } from '../scenario';

/**
 * Сценарии GET /analytics/summary — по одному на макет «Дом (…)». Выбираются параметром страницы:
 *   /?mock=optimistic
 * main        — основной экран (по умолчанию)
 * optimistic  — высокого риска нет
 * quiet       — пустые виджеты: снимок есть, рисковать некем
 * no-data     — снимков ещё не загружали
 * loading     — запрос висит, видны скелетоны
 * error       — сервер не отвечает с самого начала
 * offline     — первый ответ успешный, дальше сервер не отвечает (навбар: «переподключаемся…»)
 */
export const DASHBOARD_SCENARIOS = [
  'main',
  'optimistic',
  'quiet',
  'no-data',
  'loading',
  'error',
  'offline',
] as const;

type DashboardScenario = (typeof DASHBOARD_SCENARIOS)[number];

const RESPONSES: Partial<Record<DashboardScenario, DashboardResponse>> = {
  main: MAIN_DASHBOARD,
  optimistic: OPTIMISTIC_DASHBOARD,
  quiet: QUIET_DASHBOARD,
  'no-data': NO_SNAPSHOT_DASHBOARD,
};

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

let offlineRequests = 0;

export const dashboardHandlers = [
  http.get('*/api/v1/analytics/summary', async () => {
    const scenario = readMockScenario(DASHBOARD_SCENARIOS, 'main');

    if (scenario === 'loading') {
      await delay('infinite');
    }

    // Небольшая задержка, чтобы в dev были видны скелетоны; в тестах — без неё
    await delay();

    if (scenario === 'error') {
      return serverUnavailable();
    }
    if (scenario === 'offline') {
      offlineRequests += 1;
      return offlineRequests === 1 ? HttpResponse.json(MAIN_DASHBOARD) : serverUnavailable();
    }

    return HttpResponse.json(RESPONSES[scenario]);
  }),
];
