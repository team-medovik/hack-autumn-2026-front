import type {
  ModelSettings as ModelSettingsDto,
  ModelSettingsValues as ModelSettingsValuesDto,
} from '@/shared/api';

/**
 * Параметры модели риска: GET и PATCH /model/settings (страница «Настройки → Модель»).
 * DTO — из openapi/openapi.yaml (src/shared/api/generated). В dev отдаётся MSW
 * (src/app/mocks/settings). Даты — ISO 8601.
 */
export type {
  FinanceSettings,
  ForecastSettings,
  ModelSettingsChanges,
  PatchModelSettingsRequest,
  RiskThresholds,
} from '@/shared/api';

/** Признаки, из которых складывается score услуги, — те, что редактируются на экране. */
export type ScoreFactorId =
  | 'awaitingPayment'
  | 'expiringWithoutAutoRenewal'
  | 'insufficientFunds'
  | 'awaitingPaymentWithoutFunds'
  | 'disabledByClient'
  | 'bonusesExceedMoney';

/**
 * Сколько баллов score даёт признак в полную силу, 0–100. Контракт допускает веса новых
 * признаков сверх этих — экран их не правит, а PATCH отправляет только изменённые.
 */
export type FactorWeights = Record<ScoreFactorId, number>;

/** Все редактируемые параметры. */
export interface ModelSettingsValues extends Omit<ModelSettingsValuesDto, 'factorWeights'> {
  factorWeights: FactorWeights;
}

/**
 * Версия растёт с каждым сохранением — по ней сервер ловит одновременную правку.
 * `scoreHistogram` — 101 счётчик клиентов по целым баллам score; по нему считаются клиенты на
 * шкале уровней.
 */
export interface ModelSettings extends Omit<ModelSettingsDto, 'values' | 'defaults'> {
  values: ModelSettingsValues;
  /** Значения по умолчанию — для подсказок и «Сбросить по умолчанию». */
  defaults: ModelSettingsValues;
}

/** Тело 409: настройки уже сохранил кто-то другой. */
export interface ModelSettingsConflict {
  message: string;
  current: ModelSettings;
}
