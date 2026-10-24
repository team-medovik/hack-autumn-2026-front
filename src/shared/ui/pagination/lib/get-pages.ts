export type PageSlot = number | 'ellipsis';

/**
 * Номера страниц для пагинации: всегда первая, последняя и соседи текущей,
 * пропуски — многоточием. Длина постоянная (`2 * siblings + 5`), чтобы кнопки не прыгали.
 *
 * getPages(1, 4)  → [1, 2, 3, 4]
 * getPages(6, 20) → [1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]
 */
export const getPages = (page: number, pageCount: number, siblings = 1): PageSlot[] => {
  const slots = 2 * siblings + 5;
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index);

  if (pageCount <= slots) {
    return range(1, pageCount);
  }

  // Края: первая/последняя + многоточие занимают по 2 слота
  const edge = slots - 2;
  if (page <= edge - siblings) {
    return [...range(1, edge), 'ellipsis', pageCount];
  }
  if (page >= pageCount - edge + siblings + 1) {
    return [1, 'ellipsis', ...range(pageCount - edge + 1, pageCount)];
  }
  return [1, 'ellipsis', ...range(page - siblings, page + siblings), 'ellipsis', pageCount];
};
