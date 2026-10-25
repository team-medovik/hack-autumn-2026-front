import type {
  ClientCard,
  ClientFactor,
  ClientListItem,
  ClientService,
  ServiceEventType,
  ServiceStatus,
} from '@/entities/client';

import { CLIENTS } from './fixtures';

// Карточки для всех клиентов сводной таблицы. client17 — как в макете «Карточка клиента (причины
// с услугами)», остальные собираются из строки таблицы так, чтобы score, баланс и потеря в месяц
// совпадали. Причины — как их отдаёт бэк: готовый текст «service-0017: ожидает оплаты…».

/** Доля потери, не зависящая от баланса (k в формуле потери). */
const K = 0.5;

/** Горизонт прогноза из настроек модели — за столько дней считается «нужно на продления». */
const HORIZON_DAYS = 5;

const round2 = (value: number) => Math.round(value * 100) / 100;
const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Бонусы и реферальный баланс — у части клиентов, детерминированно по месту в списке.
 * На потерю не влияют: в моках бонусы заблокированы, а реферальный баланс по настройкам не
 * считается деньгами — в продления идёт только основной баланс (`available`).
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
      id: 'awaitingPayment',
      label: 'service-0017: ожидает оплаты, будет удалена 21.10',
      points: 70,
    },
    { id: 'disabledByClient', label: 'service-0027: выключено клиентом', points: 15 },
    {
      id: 'insufficientFunds',
      label: 'service-0017: не хватает средств на продление',
      points: 13.8,
    },
    {
      id: 'awaitingPaymentWithoutFunds',
      label: 'service-0017: ожидает оплаты, а средств на счёте не хватает',
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
      // prolong_wait модель не оценивает — только правила
      lossProbability: null,
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
      lossProbability: 0.68,
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

/** Модель оценивает услуги со сроком оплаты в ближайшие столько суток. */
const PREDICTION_WINDOW_DAYS = 7;

/**
 * Вероятность непродления от ML — как решает бэк: ожидающую оплаты (prolong_wait) и далёкую оплату
 * модель не оценивает, остальным — чуть ниже риска, детерминированно.
 */
const lossProbabilityFor = (status: ServiceStatus, daysToDue: number, risk: number) =>
  status === 'awaiting_payment' || daysToDue > PREDICTION_WINDOW_DAYS
    ? null
    : round2(Math.min(0.97, risk * 0.9));

/** Причина услуги так, как её пишет бэк: «service-0017: ожидает оплаты, удалят 22.10». */
const serviceReason = (serviceId: string, reason: string) =>
  `${serviceId}: ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`;

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
  const reason = client.reason ?? '';
  // Нехватку средств добавляем второй причиной, если главная не о ней же
  const isShort = uncoveredShare > 0 && !reason.startsWith('Не хватает средств');
  const mainPoints = isShort ? round1(score * 0.75) : score;

  const factors: ClientFactor[] = [
    { id: 'main', label: serviceReason(serviceId, reason), points: mainPoints },
    ...(isShort
      ? [
          {
            id: 'insufficientFunds',
            label: serviceReason(serviceId, 'Не хватает средств на продление'),
            points: round1(score - mainPoints),
          },
        ]
      : []),
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
        lossProbability: lossProbabilityFor(status, index % 10, risk),
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
  const deadService = (suffix: string, status: 'deleted' | 'blocked') =>
    ({
      id: `service-${client.id.slice(-3)}${suffix}`,
      name: `service-${client.id.slice(-3)}${suffix}`,
      score: null,
      level: 'none',
      status,
      monthlyPrice: null,
      // Достоверного будущего события нет, а дату удаления один снимок не знает
      event: null,
      autoRenew: null,
      lossProbability: null,
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
      deadService('1', 'deleted'),
      deadService('2', 'deleted'),
      deadService('3', 'blocked'),
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
