import { describe, expect, it } from 'vitest';

import { isAllowed, normalize, snapToStep, stepDecimals } from './step';

describe('step', () => {
  it('считает знаки после запятой у шага', () => {
    expect(stepDecimals(1)).toBe(0);
    expect(stepDecimals(0.05)).toBe(2);
  });

  it('притягивает к сетке без ошибок округления', () => {
    expect(snapToStep(0.3, 0, 0.1)).toBe(0.3);
    expect(snapToStep(0.52, 0, 0.05)).toBe(0.5);
    expect(snapToStep(41, 1, 5)).toBe(41);
  });

  it('проверяет диапазон и сетку', () => {
    expect(isAllowed(0.55, 0, 1, 0.05)).toBe(true);
    expect(isAllowed(0.52, 0, 1, 0.05)).toBe(false);
    expect(isAllowed(101, 0, 100, 1)).toBe(false);
    expect(isAllowed(7.5, 0, 100, 1)).toBe(false);
  });

  it('прижимает к границам', () => {
    expect(normalize(150, 0, 100, 1)).toBe(100);
    expect(normalize(-3, 0, 100, 1)).toBe(0);
    expect(normalize(0.52, 0, 1, 0.05)).toBe(0.5);
  });
});
