import { describe, expect, it } from 'vitest';

import { describeRenewalForecast, formatLossProbability } from './renewal-forecast';

describe('formatLossProbability', () => {
  it('округляет до процента, крайние значения — «< 1 %» и «> 99 %»', () => {
    expect(formatLossProbability(0.68)).toBe('68\u00a0%');
    expect(formatLossProbability(0)).toBe('<\u00a01\u00a0%');
    expect(formatLossProbability(0.003)).toBe('<\u00a01\u00a0%');
    expect(formatLossProbability(0.996)).toBe('>\u00a099\u00a0%');
  });
});

describe('describeRenewalForecast', () => {
  it('есть вероятность — прогноз, даже нулевой', () => {
    expect(describeRenewalForecast({ lossProbability: 0.68, score: 15 })).toMatchObject({
      state: 'predicted',
      value: '68\u00a0%',
    });
    expect(describeRenewalForecast({ lossProbability: 0, score: 15 }).state).toBe('predicted');
  });

  it('живая услуга без вероятности — «нет прогноза», без оценки — «нет оценки»', () => {
    expect(describeRenewalForecast({ lossProbability: null, score: 94.2 })).toMatchObject({
      state: 'unavailable',
      value: null,
    });
    expect(describeRenewalForecast({ lossProbability: null, score: null }).state).toBe(
      'not-applicable',
    );
  });
});
