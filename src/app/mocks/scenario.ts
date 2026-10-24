/**
 * Сценарий моков из ?mock= текущей страницы: один параметр переключает все эндпоинты сразу,
 * например /clients?mock=no-data — и таблица, и навбар без снимка.
 * В Node (тесты) — всегда `fallback`.
 */
export const readMockScenario = <T extends string>(scenarios: readonly T[], fallback: T): T => {
  const value =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('mock');
  return scenarios.includes(value as T) ? (value as T) : fallback;
};
