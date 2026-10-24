import { api } from '@/shared/api';

import type { ClientCard, ClientPosition, ClientsListQuery } from '../model/card-types';
import type { ClientsQuery, ClientsResponse } from '../model/types';

/** Строк на странице сводной таблицы — по макету. */
export const CLIENTS_PAGE_SIZE = 12;

/** Пустые параметры не отправляем: `level=all` и `search=` — то же, что их отсутствие. */
const toListParams = ({ level, search, sort, order }: ClientsListQuery) => ({
  level: level === 'all' ? undefined : level,
  search: search || undefined,
  sort,
  order,
});

const clientUrl = (id: string) => `/api/v1/clients/${encodeURIComponent(id)}`;

export const clientApi = {
  list: ({ page, ...query }: ClientsQuery): Promise<ClientsResponse> =>
    api
      .get<ClientsResponse>('/api/v1/clients', {
        params: { ...toListParams(query), page, pageSize: CLIENTS_PAGE_SIZE },
      })
      .then((response) => response.data),

  card: (id: string): Promise<ClientCard> =>
    api.get<ClientCard>(clientUrl(id)).then((response) => response.data),

  position: (id: string, query: ClientsListQuery): Promise<ClientPosition> =>
    api
      .get<ClientPosition>(`${clientUrl(id)}/position`, { params: toListParams(query) })
      .then((response) => response.data),
};
