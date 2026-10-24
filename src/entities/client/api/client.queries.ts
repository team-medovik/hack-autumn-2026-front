import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { LIVE_REFETCH_INTERVAL_MS } from '@/shared/config';

import { clientApi } from './client.api';
import { shiftPosition } from '../lib/shift-position';
import type { ClientsListQuery } from '../model/card-types';
import type { ClientsQuery } from '../model/types';

export const clientKeys = {
  all: ['clients'] as const,
  list: (query: ClientsQuery) => [...clientKeys.all, 'list', query] as const,
  card: (id: string) => [...clientKeys.all, 'card', id] as const,
  position: (id: string, query: ClientsListQuery) =>
    [...clientKeys.all, 'position', id, query] as const,
} as const;

/**
 * Страница сводной таблицы — перезапрашивается в фоне, score и потери пересчитывают на сервере.
 * При смене фильтра, поиска, сортировки или страницы
 * старые строки остаются на экране, пока не придут новые (`isPlaceholderData`).
 */
export const useClients = (query: ClientsQuery) =>
  useQuery({
    queryKey: clientKeys.list(query),
    queryFn: () => clientApi.list(query),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  });

/** Карточка клиента. При переходе к соседу — скелетон, а не данные прошлого клиента. */
export const useClientCard = (id: string) =>
  useQuery({
    queryKey: clientKeys.card(id),
    queryFn: () => clientApi.card(id),
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  });

/**
 * Место клиента в списке таблицы. При переходе «Предыдущий / Следующий» счётчик
 * сдвигается сразу, а кнопки ждут ответа — соседи нового клиента ещё неизвестны.
 */
export const useClientPosition = (id: string, query: ClientsListQuery) =>
  useQuery({
    queryKey: clientKeys.position(id, query),
    queryFn: () => clientApi.position(id, query),
    placeholderData: (previous) => shiftPosition(previous, id),
  });
