import type { ChurnWeek, DashboardResponse, RiskBucket } from '@/entities/dashboard';

// Данные повторяют макеты Figma «Дом» (основной экран) и «Дом (оптимистично)».

/** Снимок «на 22:10» в часовом поясе пользователя. */
const SNAPSHOT = {
  id: 'snapshot-2026-10-23',
  takenAt: new Date(2026, 9, 23, 22, 10).toISOString(),
};

/** Дата без времени, как в контракте: «2026-08-31». */
const toDateOnly = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');

/** Недели с понедельника 31.08: сначала факт, потом прогноз. */
const churnWeeks = (fact: number[], forecast: number[]): ChurnWeek[] =>
  [...fact, ...forecast].map((services, index) => ({
    weekStart: toDateOnly(new Date(2026, 7, 31 + index * 7)),
    kind: index < fact.length ? 'fact' : 'forecast',
    services,
  }));

const buckets = (
  high: [number, number],
  medium: [number, number],
  low: [number, number],
  none: number,
  changed: RiskBucket['level'][] = [],
): RiskBucket[] => [
  { level: 'high', clients: high[0], monthlyLoss: high[1], changed: changed.includes('high') },
  {
    level: 'medium',
    clients: medium[0],
    monthlyLoss: medium[1],
    changed: changed.includes('medium'),
  },
  { level: 'low', clients: low[0], monthlyLoss: low[1], changed: changed.includes('low') },
  { level: 'none', clients: none, monthlyLoss: null, changed: false },
];

export const MAIN_DASHBOARD: DashboardResponse = {
  snapshot: SNAPSHOT,
  monthlyLoss: 1296.9,
  riskBuckets: buckets([13, 854.5], [14, 356.2], [9, 86.2], 6, ['high']),
  topRisk: {
    id: '1321245',
    email: 'client5@mail.ru',
    score: 100,
    level: 'high',
    reason: 'Ожидает оплаты, удалят завтра',
    monthlyLoss: 14.4,
    lossChanged: false,
    factors: [
      { id: 'awaiting-payment', label: 'Ожидает оплаты, удалят завтра', points: 70 },
      { id: 'low-balance', label: 'На счёте не хватает 28,80 € на продление', points: 40 },
    ],
    balance: { available: 0, required: 28.8 },
  },
  riskQueue: {
    total: 42,
    items: [
      {
        id: '1321245',
        email: 'client5@mail.ru',
        score: 100,
        level: 'high',
        reason: 'Ожидает оплаты, удалят завтра',
        monthlyLoss: 14.4,
        lossChanged: false,
      },
      {
        id: '1321746',
        email: 'client17@mail.ru',
        score: 94.2,
        level: 'high',
        reason: 'Ожидает оплаты, удалят 21.10',
        monthlyLoss: 9.05,
        lossChanged: true,
      },
      {
        id: '242323',
        email: 'client22@mail.ru',
        score: 88,
        level: 'high',
        reason: 'Ожидает оплаты, удалят 22.10',
        monthlyLoss: 8.45,
        lossChanged: false,
      },
      {
        id: '132145',
        email: 'client10@mail.ru',
        score: 85.5,
        level: 'high',
        reason: 'Ожидает оплаты, удалят 22.10',
        monthlyLoss: 12.31,
        lossChanged: false,
      },
      {
        id: '8364644',
        email: 'client31@mail.ru',
        score: 65,
        level: 'medium',
        reason: 'Не хватает средств на продление',
        monthlyLoss: 5.76,
        lossChanged: false,
      },
    ],
  },
  lossReasons: [
    {
      id: 'awaiting-payment',
      label: 'Ожидает оплаты',
      level: 'high',
      clients: 16,
      monthlyLoss: 612.4,
    },
    {
      id: 'low-balance',
      label: 'Не хватает средств на продление',
      level: 'medium',
      clients: 9,
      monthlyLoss: 331.7,
    },
    {
      id: 'no-autorenew',
      label: 'Истекает без автопродления',
      level: 'medium',
      clients: 8,
      monthlyLoss: 268.1,
    },
    { id: 'disabled', label: 'Выключена клиентом', level: 'low', clients: 3, monthlyLoss: 72.3 },
  ],
  churn: {
    atRiskServices: 58,
    weeks: churnWeeks([9, 12, 7, 10, 14, 8, 11, 10], [18, 12, 7, 5]),
  },
};

export const OPTIMISTIC_DASHBOARD: DashboardResponse = {
  snapshot: SNAPSHOT,
  monthlyLoss: 18.4,
  riskBuckets: buckets([0, 0], [2, 6.52], [34, 11.88], 6),
  topRisk: {
    id: '1087745',
    email: 'client12@mail.ru',
    score: 52,
    level: 'medium',
    reason: 'Истекает без автопродления',
    monthlyLoss: 3.35,
    lossChanged: false,
    factors: [
      {
        id: 'no-autorenew',
        label: 'Истекает через 1 дн., автопродление выключено',
        points: 40,
      },
      { id: 'low-balance', label: 'На счёте 6,93 € из нужных 9,90 €', points: 12 },
    ],
    balance: { available: 6.93, required: 9.9 },
  },
  riskQueue: {
    total: 42,
    items: [
      {
        id: '1087745',
        email: 'client12@mail.ru',
        score: 52,
        level: 'medium',
        reason: 'Истекает без автопродления',
        monthlyLoss: 3.35,
        lossChanged: false,
      },
      {
        id: '3920571',
        email: 'client35@mail.ru',
        score: 44,
        level: 'medium',
        reason: 'Истекает без автопродления',
        monthlyLoss: 3.17,
        lossChanged: false,
      },
      {
        id: '2214087',
        email: 'client8@mail.ru',
        score: 31,
        level: 'low',
        reason: 'Не хватает средств на продление',
        monthlyLoss: 1.12,
        lossChanged: false,
      },
      {
        id: '1190432',
        email: 'client27@mail.ru',
        score: 24,
        level: 'low',
        reason: 'Выключена клиентом',
        monthlyLoss: 0.74,
        lossChanged: false,
      },
      {
        id: '3381920',
        email: 'client3@mail.ru',
        score: 18,
        level: 'low',
        reason: 'Выключена клиентом',
        monthlyLoss: 0.61,
        lossChanged: false,
      },
    ],
  },
  lossReasons: [
    {
      id: 'no-autorenew',
      label: 'Истекает без автопродления',
      level: 'medium',
      clients: 9,
      monthlyLoss: 8.1,
    },
    {
      id: 'low-balance',
      label: 'Не хватает средств на продление',
      level: 'low',
      clients: 14,
      monthlyLoss: 6.2,
    },
    { id: 'disabled', label: 'Выключена клиентом', level: 'low', clients: 13, monthlyLoss: 4.1 },
  ],
  churn: {
    atRiskServices: 11,
    weeks: churnWeeks([9, 8, 7, 7, 5, 4, 4, 3], [2, 2, 1, 1]),
  },
};

/** «Дом (пустые виджеты)»: снимок есть, но рисковать некем. */
export const QUIET_DASHBOARD: DashboardResponse = {
  snapshot: SNAPSHOT,
  monthlyLoss: 0,
  riskBuckets: buckets([0, 0], [0, 0], [42, 0], 0),
  topRisk: null,
  riskQueue: { total: 42, items: [] },
  lossReasons: [],
  churn: { atRiskServices: 0, weeks: [] },
};

/** «Дом (без данных)»: снимков ещё нет — по контракту остальные поля пустые. */
export const NO_SNAPSHOT_DASHBOARD = {
  ...QUIET_DASHBOARD,
  snapshot: null,
  riskBuckets: buckets([0, 0], [0, 0], [0, 0], 0),
  riskQueue: { total: 0, items: [] },
} satisfies DashboardResponse;
