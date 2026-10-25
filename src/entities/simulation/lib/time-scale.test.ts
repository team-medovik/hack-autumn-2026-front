import { describe, expect, it } from 'vitest';

import { formatTimeScale } from './time-scale';

describe('formatTimeScale', () => {
  it('пресеты — словами, как в макете', () => {
    expect(formatTimeScale(1)).toBe('реальное время');
    expect(formatTimeScale(10)).toBe('1 минута = 10 минут');
    expect(formatTimeScale(60)).toBe('1 минута = 1 час');
  });

  it('скорость старого запуска не из пресетов — множителем', () => {
    expect(formatTimeScale(2.5)).toBe('×2,5');
  });
});
