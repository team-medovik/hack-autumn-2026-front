import { api } from '@/shared/api';

import type { ClientsQuery, ClientsResponse } from '../model/types';

/** Строк на странице сводной таблицы — по макету. */
export const CLIENTS_PAGE_SIZE = 12;

/** Пустые параметры не отправляем: `level=all` и `search=` — то же, что их отсутствие. */
const toParams = ({ level, search, sort, order, page }: ClientsQuery) => ({
  level: level === 'all' ? undefined : level,
  search: search || undefined,
  sort,
  order,
  page,
  pageSize: CLIENTS_PAGE_SIZE,
});

export const clientApi = {
  list: (query: ClientsQuery): Promise<ClientsResponse> =>
    api
      .get<ClientsResponse>('/api/v1/clients', { params: toParams(query) })
      .then((response) => response.data),
};
