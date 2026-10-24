import type { SnapshotRecord as SnapshotRecordDto } from '@/shared/api';

/**
 * Снимки — выгрузки биллинга (страница «Импорт/экспорт снимка»): загрузка PUT /source/snapshot,
 * история и файлы — /snapshots. DTO — из openapi/openapi.yaml (src/shared/api/generated).
 * В dev отдаётся MSW (src/app/mocks/snapshots). Даты — ISO 8601.
 */

/** Сколько в снимке клиентов (аккаунтов) и услуг: «42 клиента, 118 услуг». */
export type SnapshotVolume = Pick<SnapshotRecordDto, 'clients' | 'services'>;

/** Загруженный снимок — строка «Истории загрузок». */
export type SnapshotRecord = SnapshotRecordDto;

/** Что фронт прочитал из выбранного файла до отправки — для подтверждения замены. */
export interface SnapshotFileSummary extends SnapshotVolume {
  fileName: string;
}
