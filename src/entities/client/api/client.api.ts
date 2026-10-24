import { getCustomer, getCustomerPosition, listCustomers } from '@/shared/api';

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

export const clientApi = {
  list: ({ page, ...query }: ClientsQuery): Promise<ClientsResponse> =>
    listCustomers({ ...toListParams(query), page, pageSize: CLIENTS_PAGE_SIZE }),

  card: (id: string): Promise<ClientCard> => getCustomer(encodeURIComponent(id)),

  position: (id: string, query: ClientsListQuery): Promise<ClientPosition> =>
    getCustomerPosition(encodeURIComponent(id), toListParams(query)),
};
