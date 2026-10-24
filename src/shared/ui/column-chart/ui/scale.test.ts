import { describe, expect, it } from 'vitest';

import { getNiceScale } from './scale';

describe('getNiceScale', () => {
  it.each([
    [18, 20, [0, 5, 10, 15, 20]],
    [9, 20, [0, 5, 10, 15, 20]],
    [3, 4, [0, 1, 2, 3, 4]],
    [43, 80, [0, 20, 40, 60, 80]],
    [0, 4, [0, 1, 2, 3, 4]],
  ])('max %i → %i', (value, max, ticks) => {
    expect(getNiceScale(value)).toEqual({ max, ticks });
  });
});
