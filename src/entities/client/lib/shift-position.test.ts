import { describe, expect, it } from 'vitest';

import { shiftPosition } from './shift-position';

const POSITION = { index: 2, total: 42, prevId: 'a', nextId: 'c' };

describe('shiftPosition', () => {
  it('к следующему — номер +1, соседи неизвестны', () => {
    expect(shiftPosition(POSITION, 'c')).toEqual({
      index: 3,
      total: 42,
      prevId: null,
      nextId: null,
    });
  });

  it('к предыдущему — номер −1', () => {
    expect(shiftPosition(POSITION, 'a')?.index).toBe(1);
  });

  it('не сосед, нет прошлой позиции или клиента не было в списке — не угадывает', () => {
    expect(shiftPosition(POSITION, 'x')).toBeUndefined();
    expect(shiftPosition(undefined, 'c')).toBeUndefined();
    expect(shiftPosition({ index: null, total: 42, prevId: null, nextId: null }, 'c')).toBe(
      undefined,
    );
  });
});
