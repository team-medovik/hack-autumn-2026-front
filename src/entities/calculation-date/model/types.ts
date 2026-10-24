/**
 * Контракт /settings/calculation-date — на какую дату считать риски и прогноз
 * (страница «Настройки → Другое»). Пока бэкенда нет, отдаётся MSW (src/app/mocks/settings).
 */

/** current — по текущему времени сервера; fixed — на зафиксированный момент (демо, тесты). */
export type CalculationDateMode = 'current' | 'fixed';

export interface CalculationDate {
  mode: CalculationDateMode;
  /**
   * Зафиксированный момент, ISO 8601 в UTC. При `mode: current` хранится последний — чтобы
   * «Зафиксировать» вернуло его. `null` — ни разу не фиксировали.
   */
  fixedAt: string | null;
}
