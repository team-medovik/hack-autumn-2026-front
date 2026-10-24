import type {
  ClientCard,
  ClientFactor,
  ClientListItem,
  ClientService,
  ServiceEventType,
  ServiceStatus,
} from '@/entities/client';

import { CLIENTS } from './fixtures';

// Карточки для всех клиентов сводной таблицы. client17 — как в макете «Карточка клиента»,
// остальные собираются из строки таблицы так, чтобы score, баланс и потеря в месяц совпадали.

/** Доля потери, не зависящая от баланса (k в формуле потери). */
const K = 0.5;

/** Горизонт прогноза из настроек модели — за столько дней считается «нужно на продления». */
const HORIZON_DAYS = 5;

const round2 = (value: number) => Math.round(value * 100) / 100;
const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Бонусы и реферальный баланс — у части клиентов, детерминированно по месту в списке.
 * На потерю не влияют: в продления идёт только основной баланс.
 */
const sideBalances = (index: number) => ({
  bonus: index % 3 === 0 ? 0 : round2(1 + (index % 5) * 1.5),
  referral: index % 4 === 0 ? round2(0.5 + (index % 7) * 0.75) : 0,
});

/** Даты событий услуг — от «сегодня» снимка в макетах. */
const addDays = (days: number) => {
  const date = new Date(Date.UTC(2026, 9, 21 + days));
  return date.toISOString().slice(0, 10);
};

const CLIENT_17: ClientCard = {
  id: '1321746',
  email: 'client17@mail.ru',
  score: 94.2,
  level: 'high',
  factors: [
    {
      id: 'awaiting-payment',
      label: 'Услуга service-0017 ожидает оплаты, будет удалена 21.10',
      points: 70,
    },
    { id: 'top-up-needed', label: 'Необходимо пополнить счёт для продления', points: 13.8 },
    {
      id: 'shortage',
      label: 'Услуга service-0017 ожидает оплаты, а средств на счёте не хватает',
      points: 10.4,
    },
  ],
  balance: { available: 6.48, bonus: 2, referral: 0, required: 9.9, monthlyLoss: 6.77 },
  services: [
    {
      id: 'service-0017',
      name: 'service-0017',
      score: 94.2,
      level: 'high',
      status: 'awaiting_payment',
      monthlyPrice: 9.9,
      event: { type: 'delete', date: '2026-10-21' },
      autoRenew: false,
    },
    {
      id: 'service-0027',
      name: 'service-0027',
      score: 15,
      level: 'low',
      status: 'disabled_by_client',
      monthlyPrice: 4.95,
      event: { type: 'renew', date: '2026-11-12' },
      autoRenew: true,
    },
  ],
  lossBreakdown: {
    k: K,
    uncoveredShare: 0.35,
    horizonDays: HORIZON_DAYS,
    items: [
      {
        serviceId: 'service-0017',
        serviceName: 'service-0017',
        monthlyPrice: 9.9,
        risk: 0.942,
        loss: 6.27,
      },
      {
        serviceId: 'service-0027',
        serviceName: 'service-0027',
        monthlyPrice: 4.95,
        risk: 0.15,
        loss: 0.5,
      },
    ],
  },
};

/** Как живёт главная услуга клиента — по главной причине риска из таблицы. */
const describeService = (
  client: ClientListItem,
): { status: ServiceStatus; event: ServiceEventType; autoRenew: boolean } => {
  if (client.level === 'high') {
    return { status: 'awaiting_payment', event: 'delete', autoRenew: false };
  }
  if (client.reason?.includes('выключено клиентом')) {
    return { status: 'disabled_by_client', event: 'expire', autoRenew: false };
  }
  if (client.reason?.includes('без автопродления')) {
    return { status: 'active', event: 'expire', autoRenew: false };
  }
  return { status: 'active', event: 'renew', autoRenew: true };
};

/**
 * Цена услуги, при которой формула даёт потерю из таблицы:
 * потеря = цена × риск × (k + (1 − k) × непокрытая доля), непокрытая доля = (цена − баланс) / цена.
 */
const solvePrice = (loss: number, risk: number, balance: number) => {
  // Баланса не хватает (цена > баланса): потеря = риск × (цена − (1 − k) × баланс)
  const priceAboveBalance = loss / risk + (1 - K) * balance;
  // Иначе непокрытая доля 0: потеря = риск × k × цена
  return priceAboveBalance > balance ? priceAboveBalance : loss / (risk * K);
};

const buildScoredCard = (client: ClientListItem, index: number): ClientCard => {
  const score = client.score ?? 0;
  const risk = score / 100;
  const price = round2(solvePrice(client.monthlyLoss, risk, client.balance));
  const uncoveredShare = Math.max(0, (price - client.balance) / price);
  const { status, event, autoRenew } = describeService(client);
  const serviceId = `service-${client.id.slice(-4)}`;
  const mainPoints = round1(score * 0.75);

  const factors: ClientFactor[] = [
    { id: 'main', label: client.reason ?? '', points: mainPoints },
    {
      id: 'balance',
      label:
        uncoveredShare > 0 ? 'Необходимо пополнить счёт для продления' : 'Давно не пополнял счёт',
      points: round1(score - mainPoints),
    },
  ];

  return {
    id: client.id,
    email: client.email,
    score: client.score,
    level: client.level,
    factors,
    balance: {
      available: client.balance,
      ...sideBalances(index),
      required: price,
      monthlyLoss: client.monthlyLoss,
    },
    services: [
      {
        id: serviceId,
        name: serviceId,
        score: client.score,
        level: client.level,
        status,
        monthlyPrice: price,
        event: { type: event, date: addDays(index % 10) },
        autoRenew,
      },
    ],
    lossBreakdown: {
      k: K,
      uncoveredShare,
      horizonDays: HORIZON_DAYS,
      items: [
        { serviceId, serviceName: serviceId, monthlyPrice: price, risk, loss: client.monthlyLoss },
      ],
    },
  };
};

/** Без оценки: живых услуг нет — все удалены или заблокированы, продлевать нечего. */
const buildUnscoredCard = (client: ClientListItem, index: number): ClientCard => {
  const deadService = (suffix: string, status: 'deleted' | 'blocked', days: number) =>
    ({
      id: `service-${client.id.slice(-3)}${suffix}`,
      name: `service-${client.id.slice(-3)}${suffix}`,
      score: null,
      level: 'none',
      status,
      monthlyPrice: null,
      event: { type: status, date: addDays(-days) },
      autoRenew: null,
    }) satisfies ClientService;

  return {
    id: client.id,
    email: client.email,
    score: null,
    level: 'none',
    factors: [],
    balance: {
      available: client.balance,
      ...sideBalances(index),
      required: null,
      monthlyLoss: 0,
    },
    services: [
      deadService('1', 'deleted', 49),
      deadService('2', 'deleted', 21),
      deadService('3', 'blocked', 12),
    ],
    lossBreakdown: { k: K, uncoveredShare: 0, horizonDays: HORIZON_DAYS, items: [] },
  };
};

export const CLIENT_CARDS: ReadonlyMap<string, ClientCard> = new Map(
  CLIENTS.map((client, index) => {
    if (client.id === CLIENT_17.id) {
      return [client.id, CLIENT_17];
    }
    return [
      client.id,
      client.score === null ? buildUnscoredCard(client, index) : buildScoredCard(client, index),
    ];
  }),
);
