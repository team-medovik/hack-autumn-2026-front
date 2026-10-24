import type { ListCustomersParams } from '@/shared/api';
import type { RiskLevel } from '@/shared/ui/risk-score';

/**
 * Сводная таблица клиентов: GET /customers по последнему снимку биллинга. DTO — из
 * openapi/openapi.yaml (src/shared/api/generated). Фильтр, поиск, сортировка и пагинация — на
 * сервере, в обе стороны. В dev отдаётся MSW (src/app/mocks/clients). Суммы — в евро.
 */
export type { ClientListItem, ClientsResponse } from '@/shared/api';

/** Поля, по которым сервер умеет сортировать. */
export const CLIENT_SORT_FIELDS = [
  'score',
  'id',
  'email',
  'balance',
  'topUp',
  'monthlyLoss',
] as const satisfies readonly NonNullable<ListCustomersParams['sort']>[];

export type ClientSortField = (typeof CLIENT_SORT_FIELDS)[number];

export type SortOrder = NonNullable<ListCustomersParams['order']>;

/** Фильтр по уровню риска: конкретный уровень или все. */
export type ClientLevelFilter = RiskLevel | 'all';

/** Параметры списка. Поиск идёт по всем клиентам — с `search` фильтр `level` не применяется. */
export interface ClientsQuery {
  level: ClientLevelFilter;
  /** Подстрока email или ID. Пустая строка — без поиска. */
  search: string;
  sort: ClientSortField;
  order: SortOrder;
  /** Номер страницы, с 1. */
  page: number;
}
