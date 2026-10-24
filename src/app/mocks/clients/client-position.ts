import type { ClientListItem, ClientPosition } from '@/entities/client';

import { selectClients } from './query-clients';

/** Эмуляция сервера GET /clients/{id}/position: место клиента в списке таблицы и его соседи. */
export const getClientPosition = (
  clients: readonly ClientListItem[],
  id: string,
  params: URLSearchParams,
): ClientPosition => {
  const list = selectClients(clients, params);
  const index = list.findIndex((client) => client.id === id);

  if (index === -1) {
    return { index: null, total: list.length, prevId: null, nextId: null };
  }

  return {
    index: index + 1,
    total: list.length,
    prevId: list[index - 1]?.id ?? null,
    nextId: list[index + 1]?.id ?? null,
  };
};
