import type { ModelSettings, ModelSettingsValues } from '@/entities/model-settings';

// Данные повторяют макеты Figma «Настройки — модель (…)».

/** Значения по умолчанию — подсказки «по умолчанию 70» в макете. */
export const DEFAULT_VALUES: ModelSettingsValues = {
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

// Score клиентов с оценкой: при порогах 40 / 70 — низкий 9, средний 14, высокий 13, как в макете
// prettier-ignore
const CLIENT_SCORES = [
  8, 15, 22, 28, 31, 33.3, 35.8, 37, 39.5,
  40.5, 41.2, 42, 44, 47.8, 49, 51, 54.7, 55, 58, 61.3, 62, 65, 68,
  70.5, 71, 72.2, 73, 74.9, 76, 78.4, 80, 83.1, 85.5, 88, 94.2, 100,
];

const toHistogram = (scores: readonly number[]) =>
  scores.reduce(
    (histogram, score) => {
      histogram[Math.floor(score)] += 1;
      return histogram;
    },
    Array.from({ length: 101 }, () => 0),
  );

/** Сохранено аналитиком вчера в 18:00 — «Последнее обновление 23.10.2026, 18:00, analyst». */
export const INITIAL_SETTINGS: ModelSettings = {
  version: 4,
  updatedAt: new Date(2026, 9, 23, 18, 0).toISOString(),
  updatedBy: 'analyst',
  values: DEFAULT_VALUES,
  defaults: DEFAULT_VALUES,
  scoreHistogram: toHistogram(CLIENT_SCORES),
};

/** Пока админ редактировал, аналитик сохранил свою версию — «analyst сохранил версию 5 в 08:40». */
export const concurrentEdit = (current: ModelSettings): ModelSettings => ({
  ...current,
  version: current.version + 1,
  updatedAt: new Date(2026, 9, 24, 8, 40).toISOString(),
  updatedBy: 'analyst',
  values: {
    ...current.values,
    factorWeights: { ...current.values.factorWeights, awaitingPayment: 75 },
  },
});
