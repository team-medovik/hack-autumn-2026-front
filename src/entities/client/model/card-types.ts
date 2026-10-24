import type { RiskLevel } from '@/shared/ui/risk-score';

import type { ClientsQuery } from './types';

/**
 * Контракт карточки клиента: GET /clients/{id} и GET /clients/{id}/position.
 * Пока бэкенда нет, отдаётся MSW (src/app/mocks/clients). Суммы — в евро, даты — «2026-10-21».
 */

/** Вклад фактора в score: «Услуга service-0017 ожидает оплаты, будет удалена 21.10» +70. */
export interface ClientFactor {
  id: string;
  label: string;
  /** Баллы score, 0–100. В сумме по факторам — score клиента. */
  points: number;
}

export interface ClientCardBalance {
  /** Основной баланс — сейчас на счёте. Только он идёт в продления. */
  available: number;
  /** Бонусный баланс. Заблокирован: в продления не идёт. */
  bonus: number;
  /** Реферальный баланс. В продления не идёт. */
  referral: number;
  /** Нужно на продления в ближайшие дни. `null` — продлевать нечего: живых услуг нет. */
  required: number | null;
  /** Потеря в месяц, если клиент уйдёт. */
  monthlyLoss: number;
}

/** Статусы услуг — в порядке групп на экране: сначала то, что горит. */
export const SERVICE_STATUSES = [
  'awaiting_payment',
  'active',
  'disabled_by_client',
  'deleted',
  'blocked',
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

/**
 * Событие услуги: будущие — renew (продлится), expire (истечёт), delete (удалят);
 * прошедшие — deleted (удалена), blocked (заблокирована).
 */
export type ServiceEventType = 'renew' | 'expire' | 'delete' | 'deleted' | 'blocked';

export interface ServiceEvent {
  type: ServiceEventType;
  /** Дата без времени: «2026-10-21». */
  date: string;
}

export interface ClientService {
  id: string;
  name: string;
  /** Score услуги 0–100, `null` — не считается (услуга удалена или заблокирована). */
  score: number | null;
  level: RiskLevel;
  status: ServiceStatus;
  /** Цена в месяц. `null` — услуга больше не продлевается. */
  monthlyPrice: number | null;
  /** Ближайшее событие для живой услуги или последнее — для удалённой. */
  event: ServiceEvent | null;
  /** Автопродление. `null` — неприменимо: услуга удалена или заблокирована. */
  autoRenew: boolean | null;
}

/** Потеря по одной услуге: цена × риск × (k + (1 − k) × непокрытая доля). */
export interface LossBreakdownItem {
  serviceId: string;
  serviceName: string;
  monthlyPrice: number;
  /** Риск услуги, доля 0–1 (score / 100). */
  risk: number;
  loss: number;
}

/** Из чего сложилась потеря в месяц — для окна «Как посчитано». */
export interface LossBreakdown {
  /** Доля потери, которая не зависит от баланса, 0–1. */
  k: number;
  /** Какую часть нужного на продления не покрывает баланс, 0–1. */
  uncoveredShare: number;
  /** За сколько дней вперёд считается `balance.required` — горизонт прогноза из настроек модели. */
  horizonDays: number;
  /** Пусто — живых услуг нет, потери нет. */
  items: LossBreakdownItem[];
}

export interface ClientCard {
  id: string;
  email: string;
  /** Score 0–100, `null` — нет оценки. */
  score: number | null;
  level: RiskLevel;
  /** Из чего сложился score, по убыванию вклада. Пусто — нет оценки. */
  factors: ClientFactor[];
  balance: ClientCardBalance;
  services: ClientService[];
  lossBreakdown: LossBreakdown;
}

/** Параметры списка без страницы: по ним сервер считает соседей клиента. */
export type ClientsListQuery = Omit<ClientsQuery, 'page'>;

/** Место клиента в списке сводной таблицы — для «Предыдущий / 2 из 42 / Следующий». */
export interface ClientPosition {
  /** Номер с 1. `null` — клиента нет в списке с такими фильтром и поиском. */
  index: number | null;
  /** Клиентов в списке. */
  total: number;
  prevId: string | null;
  nextId: string | null;
}
