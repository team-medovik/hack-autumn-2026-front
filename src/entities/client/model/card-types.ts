import type { ClientServiceEvent, ClientServiceEventType, ClientServiceStatus } from '@/shared/api';

import type { ClientsQuery } from './types';

/**
 * Карточка клиента: GET /customers/{id} и GET /customers/{id}/position. DTO — из
 * openapi/openapi.yaml (src/shared/api/generated). В dev отдаётся MSW (src/app/mocks/clients).
 * Суммы — в евро, даты — «2026-10-21».
 *
 * Score клиента — максимум по живым услугам, а не сумма вкладов факторов разных услуг.
 * `balance.available` — деньги, которые модель учитывает при продлении: основной баланс плюс
 * бонусы и реферальный баланс, если так задано в настройках модели. `bonus` и `referral` — справочно.
 */
export type {
  ClientCard,
  ClientCardBalance,
  ClientFactor,
  ClientPosition,
  ClientService,
  LossBreakdown,
  LossBreakdownItem,
} from '@/shared/api';

/** Статусы услуг — в порядке групп на экране: сначала то, что горит. */
export const SERVICE_STATUSES = [
  'awaiting_payment',
  'active',
  'disabled_by_client',
  'deleted',
  'blocked',
] as const satisfies readonly ClientServiceStatus[];

export type ServiceStatus = ClientServiceStatus;

/**
 * Ближайшее событие живой услуги: renew (продлится), expire (истечёт), delete (удалят).
 * У удалённых и заблокированных достоверного события нет — `event: null`.
 */
export type ServiceEventType = ClientServiceEventType;

export type ServiceEvent = ClientServiceEvent;

/** Параметры списка без страницы: по ним сервер считает соседей клиента. */
export type ClientsListQuery = Omit<ClientsQuery, 'page'>;
