import { CLIENT_SORT_FIELDS, type ClientLevelFilter, type ClientsQuery } from '@/entities/client';
import { RISK_LEVELS } from '@/shared/ui/risk-level';

/** Без параметров в URL — все клиенты по убыванию риска, первая страница. */
export const DEFAULT_CLIENTS_QUERY: ClientsQuery = {
  level: 'all',
  search: '',
  sort: 'score',
  order: 'desc',
  page: 1,
};

const LEVEL_FILTERS: readonly ClientLevelFilter[] = ['all', ...RISK_LEVELS];

const KEYS = [
  'level',
  'search',
  'sort',
  'order',
  'page',
] as const satisfies readonly (keyof ClientsQuery)[];

const pick = <T extends string>(values: readonly T[], value: string | null, fallback: T): T =>
  values.includes(value as T) ? (value as T) : fallback;

/** Параметры таблицы из URL. Мусор в URL — значения по умолчанию, а не ошибка. */
export const parseClientsQuery = (params: URLSearchParams): ClientsQuery => {
  const page = Number(params.get('page'));

  return {
    level: pick(LEVEL_FILTERS, params.get('level'), DEFAULT_CLIENTS_QUERY.level),
    search: params.get('search')?.trim() ?? DEFAULT_CLIENTS_QUERY.search,
    sort: pick(CLIENT_SORT_FIELDS, params.get('sort'), DEFAULT_CLIENTS_QUERY.sort),
    order: pick(['asc', 'desc'], params.get('order'), DEFAULT_CLIENTS_QUERY.order),
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_CLIENTS_QUERY.page,
  };
};

/**
 * Записывает параметры таблицы в URL: значения по умолчанию не пишутся, чтобы ссылка была короткой.
 * Чужие параметры (например `?mock=`) сохраняются.
 */
export const writeClientsQuery = (params: URLSearchParams, query: ClientsQuery) => {
  const next = new URLSearchParams(params);

  KEYS.forEach((key) => {
    const value = query[key];
    if (value === DEFAULT_CLIENTS_QUERY[key]) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });

  return next;
};
