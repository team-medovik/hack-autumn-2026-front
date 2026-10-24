import { describe, expect, it } from 'vitest';

import { formatLossCalc, formatUncoveredCalc } from './format-loss-calc';

// Intl разделяет число и валюту неразрывным пробелом — нормализуем для читаемости
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('formatLossCalc', () => {
  it('подставляет цену, риск, k и непокрытую долю — как в макете', () => {
    const calc = formatLossCalc(
      { monthlyPrice: 9.9, risk: 0.942 },
      { k: 0.5, uncoveredShare: 0.3455 },
    );

    expect(plain(calc)).toBe('9,90 € × 0,942 × (0,5 + 0,5 × 0,35)');
  });
});

describe('formatUncoveredCalc', () => {
  it('показывает, какую часть нужного не покрывает баланс', () => {
    expect(formatUncoveredCalc({ available: 6.48, required: 9.9 })).toBe('(9,90 − 6,48) / 9,90');
  });

  it('баланса хватает или продлевать нечего — расчёта нет', () => {
    expect(formatUncoveredCalc({ available: 12, required: 9.9 })).toBeNull();
    expect(formatUncoveredCalc({ available: 12, required: null })).toBeNull();
  });
});
