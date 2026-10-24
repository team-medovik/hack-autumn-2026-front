import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  parseClientsQuery,
  writeClientsQuery,
  type ClientLevelFilter,
  type ClientSortField,
  type ClientsQuery,
  type SortOrder,
} from '@/entities/client';

/**
 * Состояние сводной таблицы в URL: ссылкой можно поделиться, «назад» возвращает прошлый вид.
 * Любое изменение, кроме страницы, возвращает на первую страницу.
 * Поиск и фильтр взаимоисключающие: поиск идёт по всем клиентам, без учёта фильтра.
 */
export const useClientsQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseClientsQuery(searchParams), [searchParams]);

  const update = (patch: Partial<ClientsQuery>) =>
    setSearchParams(
      (current) => writeClientsQuery(current, { ...parseClientsQuery(current), page: 1, ...patch }),
      { replace: true },
    );

  return {
    query,
    setLevel: (level: ClientLevelFilter) => update({ level, search: '' }),
    setSearch: (search: string) => update({ search, level: 'all' }),
    setSort: (sort: ClientSortField, order: SortOrder) => update({ sort, order }),
    setPage: (page: number) => update({ page }),
  };
};
