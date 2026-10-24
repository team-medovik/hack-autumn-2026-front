import type { CalculationDate } from '@/shared/api';

/**
 * На какую дату считать риски и прогноз: /settings/calculation-date (страница «Настройки →
 * Другое»). DTO — из openapi/openapi.yaml (src/shared/api/generated). В dev отдаётся MSW
 * (src/app/mocks/settings).
 *
 * `mode`: current — по текущему времени сервера; fixed — на зафиксированный момент (демо, тесты).
 * `fixedAt` — момент в UTC; при `current` хранится последний, чтобы «Зафиксировать» вернуло его.
 * `null` — ни разу не фиксировали.
 */
export type { CalculationDate } from '@/shared/api';

export type CalculationDateMode = CalculationDate['mode'];
