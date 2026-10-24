import { delay, http, HttpResponse } from 'msw';

import type { CalculationDate } from '@/entities/calculation-date';

import { readMockScenario } from '../scenario';

/**
 * Сценарии /settings/calculation-date — по макету «Настройки — другое»: /settings?mock=…
 * main                      — дата зафиксирована на 19.10.2026, 15:00 UTC (по умолчанию)
 * calculation-date-error    — дата не загрузилась
 * calculation-date-save-error — сервер не принимает сохранение
 */
export const CALCULATION_DATE_SCENARIOS = [
  'main',
  'calculation-date-error',
  'calculation-date-save-error',
] as const;

/** Как в макете: «Зафиксировать», 19.10.2026, 15:00 UTC. */
export const INITIAL_CALCULATION_DATE: CalculationDate = {
  mode: 'fixed',
  fixedAt: '2026-10-19T15:00:00.000Z',
};

let current = INITIAL_CALCULATION_DATE;

export const resetCalculationDateMock = () => {
  current = INITIAL_CALCULATION_DATE;
};

const scenario = () => readMockScenario(CALCULATION_DATE_SCENARIOS, 'main');

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

export const calculationDateHandlers = [
  http.get('*/settings/calculation-date', async () => {
    await delay();
    return scenario() === 'calculation-date-error'
      ? serverUnavailable()
      : HttpResponse.json(current);
  }),

  http.put('*/settings/calculation-date', async ({ request }) => {
    await delay();
    if (scenario() === 'calculation-date-save-error') {
      return serverUnavailable();
    }

    const next = (await request.json()) as CalculationDate;
    if (next.mode === 'fixed' && !next.fixedAt) {
      return HttpResponse.json({ message: 'Укажите дату расчёта' }, { status: 422 });
    }
    current = next;
    return HttpResponse.json(current);
  }),
];
