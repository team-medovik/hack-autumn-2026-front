import { describe, expect, it } from 'vitest';

import { getNextSort } from './next-sort';

describe('getNextSort', () => {
  it('разворачивает направление у текущей колонки', () => {
    const score = { sort: 'score', firstOrder: 'desc' } as const;

    expect(getNextSort(score, { sort: 'score', order: 'desc' })).toEqual({
      sort: 'score',
      order: 'asc',
    });
    expect(getNextSort(score, { sort: 'score', order: 'asc' })).toEqual({
      sort: 'score',
      order: 'desc',
    });
  });

  it('новая колонка — её первое направление', () => {
    expect(
      getNextSort({ sort: 'email', firstOrder: 'asc' }, { sort: 'score', order: 'desc' }),
    ).toEqual({ sort: 'email', order: 'asc' });
    expect(getNextSort({ sort: 'balance' }, { sort: 'score', order: 'asc' })).toEqual({
      sort: 'balance',
      order: 'desc',
    });
  });

  it('несортируемая колонка ничего не меняет', () => {
    expect(getNextSort({}, { sort: 'score', order: 'desc' })).toBeNull();
  });
});
