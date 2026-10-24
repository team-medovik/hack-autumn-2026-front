/**
 * Контракт /settings/model — параметры модели риска (страница «Настройки → Модель»).
 * Пока бэкенда нет, отдаётся MSW (src/app/mocks/settings). Даты — ISO 8601.
 */

/** Признаки, из которых складывается score клиента. */
export type ScoreFactorId =
  | 'awaitingPayment'
  | 'expiringWithoutAutoRenewal'
  | 'insufficientFunds'
  | 'awaitingPaymentWithoutFunds'
  | 'disabledByClient'
  | 'bonusesExceedMoney';

/** Сколько баллов score даёт признак в полную силу, 0–100. */
export type FactorWeights = Record<ScoreFactorId, number>;

/** С какого score начинается уровень. Высокий строго больше среднего. */
export interface RiskThresholds {
  medium: number;
  high: number;
}

export interface FinanceSettings {
  /** Считать разблокированные бонусы клиента доступными деньгами. */
  bonusesAsMoney: boolean;
  /** Считать реферальный баланс доступными деньгами. */
  referralBalanceAsMoney: boolean;
  /** Коэффициент k, 0–1: насколько баланс уменьшает потерю. 0 — при достаточном балансе потерь нет. */
  balanceLossFactor: number;
}

export interface ForecastSettings {
  /** На сколько дней вперёд считать прогноз. */
  horizonDays: number;
  /** Как часто пересчитывать прогноз, в минутах. */
  recalculationIntervalMinutes: number;
}

/** Все редактируемые параметры. */
export interface ModelSettingsValues {
  factorWeights: FactorWeights;
  riskThresholds: RiskThresholds;
  finance: FinanceSettings;
  forecast: ForecastSettings;
}

export interface ModelSettings {
  /** Версия растёт с каждым сохранением — по ней сервер ловит одновременную правку. */
  version: number;
  updatedAt: string;
  /** Логин того, кто сохранил версию. */
  updatedBy: string;
  values: ModelSettingsValues;
  /** Значения по умолчанию — для подсказок и «Сбросить по умолчанию». */
  defaults: ModelSettingsValues;
  /**
   * Клиенты с оценкой по целым баллам: элемент i — сколько клиентов со score в [i, i + 1),
   * последний (100) — со score 100. Ровно 101 элемент. По нему считаются клиенты на шкале уровней.
   */
  scoreHistogram: number[];
}

export interface SaveModelSettingsRequest {
  /** Версия, от которой редактировали. Не совпала с текущей — 409. */
  version: number;
  values: ModelSettingsValues;
}

/** Тело 409: настройки уже сохранил кто-то другой. */
export interface ModelSettingsConflict {
  message: string;
  current: ModelSettings;
}
