import { describe, expect, it } from 'vitest';

import { getSettingsChanges } from './settings-changes';
import type { ModelSettingsValues } from '../model/types';

const base: ModelSettingsValues = {
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

describe('getSettingsChanges', () => {
  it('без отличий — null', () => {
    expect(getSettingsChanges(base, structuredClone(base))).toBeNull();
  });

  it('только изменённые группы и поля', () => {
    expect(
      getSettingsChanges(base, {
        ...base,
        factorWeights: { ...base.factorWeights, awaitingPayment: 80 },
        riskThresholds: { medium: 40, high: 75 },
      }),
    ).toEqual({ factorWeights: { awaitingPayment: 80 }, riskThresholds: { high: 75 } });
  });
});
