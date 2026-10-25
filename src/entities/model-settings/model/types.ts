import type { ModelSettings } from '@/shared/api';

/**
 * Параметры модели риска: GET и PATCH /model/settings (страница «Настройки → Модель»).
 * DTO — из openapi/openapi.yaml (src/shared/api/generated). В dev отдаётся MSW
 * (src/app/mocks/settings). Даты — ISO 8601.
 */
export type {
  FactorWeights,
  FeatureDefinition,
  FinanceSettings,
  ForecastSettings,
  ModelSettingsChanges,
  ModelSettingsValues,
  PatchModelSettingsRequest,
  RiskThresholds,
} from '@/shared/api';

/**
 * Версия растёт с каждым сохранением — по ней сервер ловит одновременную правку.
 * `scoreHistogram` — 101 счётчик клиентов по целым баллам score; по нему считаются клиенты на
 * шкале уровней. Признаки score приходят с сервера: `featureDefinitions` — каталог (порядок
 * экрана, название, подсказка), `factorWeights` — карта «ключ признака → вес 0–100». Новый
 * признак на бэке появляется на экране без правок фронта.
 */
export type { ModelSettings } from '@/shared/api';

/** Тело 409: настройки уже сохранил кто-то другой. */
export interface ModelSettingsConflict {
  message: string;
  current: ModelSettings;
}
