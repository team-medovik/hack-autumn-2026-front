import { describe, expect, it } from 'vitest';

import { countClientsByLevel, getRiskRanges, isValidRiskThresholds } from './risk-ranges';

/** 101 элемент: по одному клиенту на баллы 10, 45, 69, 70 и 100. */
const histogram = Array.from({ length: 101 }, (_, score) =>
  [10, 45, 69, 70, 100].includes(score) ? 1 : 0,
);

describe('getRiskRanges', () => {
  it('делит шкалу 0–100 порогами', () => {
    expect(getRiskRanges({ medium: 40, high: 70 })).toEqual([
      { level: 'low', from: 0, to: 39, span: 40 },
      { level: 'medium', from: 40, to: 69, span: 30 },
      { level: 'high', from: 70, to: 100, span: 30 },
    ]);
  });
});

describe('countClientsByLevel', () => {
  it('считает клиентов в диапазонах, пороги включаются в верхний уровень', () => {
    expect(countClientsByLevel(histogram, { medium: 40, high: 70 })).toEqual({
      low: 1,
      medium: 2,
      high: 2,
    });
    expect(countClientsByLevel(histogram, { medium: 46, high: 69 })).toEqual({
      low: 2,
      medium: 0,
      high: 3,
    });
  });
});

describe('isValidRiskThresholds', () => {
  it('высокий должен быть строго больше среднего', () => {
    expect(isValidRiskThresholds({ medium: 40, high: 70 })).toBe(true);
    expect(isValidRiskThresholds({ medium: 40, high: 40 })).toBe(false);
    expect(isValidRiskThresholds({ medium: 40, high: 35 })).toBe(false);
  });
});
