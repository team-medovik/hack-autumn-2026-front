import type { GeneratorConsumerStatus200 } from '@/shared/api';

/**
 * Источник данных панели: GET /admin/generator/consumer — состояние потребителя событий живой
 * симуляции (только ADMIN). DTO — из openapi/openapi.yaml (src/shared/api/generated). В dev
 * отдаётся MSW (src/app/mocks/data-source).
 *
 * `usedForDashboard` — риски считаются по живой симуляции, иначе — по загруженному JSON-снимку.
 * `progress` — как события генератора доходят до панели (ошибки и повторы). Состояние самого
 * генератора и его скорость — в сущности simulation. Переключение — PUT /admin/source/mode
 * (в API режим живой симуляции называется «generator»).
 */
export type DataSourceStatus = GeneratorConsumerStatus200;

export type SyncProgress = NonNullable<DataSourceStatus['progress']>;

/** simulation — живая симуляция, snapshot — загруженный JSON-снимок. */
export type DataSourceKind = 'simulation' | 'snapshot';
