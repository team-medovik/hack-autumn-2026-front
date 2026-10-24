import type { ClientSortField, SortOrder } from '@/entities/client';

interface SortableColumn {
  /** Поле сортировки. Без него колонка не сортируется. */
  sort?: ClientSortField;
  /** Направление при первом клике. */
  firstOrder?: SortOrder;
}

interface ClientsSort {
  sort: ClientSortField;
  order: SortOrder;
}

/** Сортировка после клика по колонке: та же колонка — разворот, новая — её первое направление. */
export const getNextSort = (column: SortableColumn, current: ClientsSort): ClientsSort | null => {
  if (!column.sort) {
    return null;
  }
  if (column.sort === current.sort) {
    return { sort: column.sort, order: current.order === 'asc' ? 'desc' : 'asc' };
  }
  return { sort: column.sort, order: column.firstOrder ?? 'desc' };
};
