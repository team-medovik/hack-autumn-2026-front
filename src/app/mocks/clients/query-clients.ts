import {
  CLIENT_SORT_FIELDS,
  type ClientListItem,
  type ClientSortField,
  type ClientsResponse,
  type SortOrder,
} from '@/entities/client';
import { RISK_LEVELS } from '@/shared/ui/risk-level';
import type { RiskLevel } from '@/shared/ui/risk-score';

const DEFAULT_PAGE_SIZE = 12;

const pick = <T extends string>(values: readonly T[], value: string | null, fallback: T): T =>
  values.includes(value as T) ? (value as T) : fallback;

const positiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const compare = (a: ClientListItem, b: ClientListItem, field: ClientSortField) => {
  if (field === 'id' || field === 'email') {
    return a[field].localeCompare(b[field], 'ru', { numeric: true });
  }
  return (a[field] ?? 0) - (b[field] ?? 0);
};

/**
 * Эмуляция сервера GET /clients: поиск, фильтр, сортировка, пагинация.
 * Клиенты без оценки при сортировке по риску — всегда в конце.
 */
export const queryClients = (
  clients: readonly ClientListItem[],
  params: URLSearchParams,
): ClientsResponse => {
  const search = params.get('search')?.trim().toLowerCase() ?? '';
  const level = pick<RiskLevel | 'all'>(RISK_LEVELS, params.get('level'), 'all');
  const sort = pick(CLIENT_SORT_FIELDS, params.get('sort'), 'score');
  const order = pick<SortOrder>(['asc', 'desc'], params.get('order'), 'desc');
  const pageSize = positiveInt(params.get('pageSize'), DEFAULT_PAGE_SIZE);

  // Поиск — по всем клиентам, без учёта фильтра (так в макете «ничего не найдено»)
  const matched = clients.filter((client) =>
    search
      ? client.email.toLowerCase().includes(search) || client.id.includes(search)
      : level === 'all' || client.level === level,
  );

  const direction = order === 'asc' ? 1 : -1;
  const sorted = [...matched].sort((a, b) => {
    if (sort === 'score' && (a.score === null || b.score === null)) {
      return Number(a.score === null) - Number(b.score === null);
    }
    return compare(a, b, sort) * direction;
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(positiveInt(params.get('page'), 1), pageCount);

  const levelCounts = Object.fromEntries(
    RISK_LEVELS.map((value) => [value, clients.filter((client) => client.level === value).length]),
  ) as Record<RiskLevel, number>;

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: sorted.length,
    levelCounts,
  };
};
