import { describe, expect, it } from 'vitest';

import { formatLossLine } from './format-loss-line';

// Intl разделяет число и валюту неразрывным пробелом — нормализуем для читаемости
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('formatLossLine', () => {
  it('подставляет цену, риск, k и непокрытую долю — как в макете', () => {
    const line = formatLossLine(
      {
        serviceId: 'service-0017',
        serviceName: 'service-0017',
        monthlyPrice: 9.9,
        risk: 0.942,
        loss: 6.27,
      },
      { k: 0.5, uncoveredShare: 0.3455 },
    );

    expect(plain(line)).toBe('service-0017: 9,90 € × 0,942 × (0,5 + 0,5 × 0,35) = 6,27 €');
  });
});
