import { describe, expect, it } from 'vitest';

import { isSameValues } from './same-values';
import type { ModelSettingsValues } from '../model/types';

const VALUES: ModelSettingsValues = {
  factorWeights: {
    awaitingPayment: 70,
    expiringWithoutAutoRenewal: 50,
    insufficientFunds: 40,
    awaitingPaymentWithoutFunds: 30,
    disabledByClient: 15,
    bonusesExceedMoney: 10,
  },
  riskThresholds: { medium: 40, high: 70 },
  finance: { bonusesAsMoney: true, referralBalanceAsMoney: false, balanceLossFactor: 0.5 },
  forecast: { horizonDays: 5, recalculationIntervalMinutes: 5 },
};

describe('isSameValues', () => {
  it('сравнивает по значениям, а не по ссылкам', () => {
    expect(isSameValues(VALUES, structuredClone(VALUES))).toBe(true);
  });

  it('замечает изменение в любой группе', () => {
    expect(
      isSameValues(VALUES, {
        ...VALUES,
        factorWeights: { ...VALUES.factorWeights, awaitingPayment: 80 },
      }),
    ).toBe(false);
    expect(
      isSameValues(VALUES, { ...VALUES, finance: { ...VALUES.finance, bonusesAsMoney: false } }),
    ).toBe(false);
  });
});
