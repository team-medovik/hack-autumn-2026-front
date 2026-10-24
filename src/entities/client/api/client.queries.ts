import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { clientApi } from './client.api';
import type { ClientsQuery } from '../model/types';

export const clientKeys = {
  all: ['clients'] as const,
  list: (query: ClientsQuery) => [...clientKeys.all, 'list', query] as const,
} as const;

/**
 * Страница сводной таблицы. При смене фильтра, поиска, сортировки или страницы
 * старые строки остаются на экране, пока не придут новые (`isPlaceholderData`).
 */
export const useClients = (query: ClientsQuery) =>
  useQuery({
    queryKey: clientKeys.list(query),
    queryFn: () => clientApi.list(query),
    placeholderData: keepPreviousData,
  });
