import { describe, expect, it } from 'vitest';

import { getPages } from './get-pages';

describe('getPages', () => {
  it('показывает все страницы, если они помещаются', () => {
    expect(getPages(1, 4)).toEqual([1, 2, 3, 4]);
    expect(getPages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('одна страница', () => {
    expect(getPages(1, 1)).toEqual([1]);
  });

  it('у начала — многоточие только справа', () => {
    expect(getPages(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
    expect(getPages(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
  });

  it('в середине — многоточия с обеих сторон', () => {
    expect(getPages(5, 20)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]);
    expect(getPages(16, 20)).toEqual([1, 'ellipsis', 15, 16, 17, 'ellipsis', 20]);
  });

  it('у конца — многоточие только слева', () => {
    expect(getPages(17, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
    expect(getPages(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });

  it('длина не меняется при переходах', () => {
    const lengths = Array.from({ length: 20 }, (_, index) => getPages(index + 1, 20).length);
    expect(new Set(lengths)).toEqual(new Set([7]));
  });
});
