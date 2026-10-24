/**
 * Контракт /snapshots — выгрузки биллинга (страница «Импорт/экспорт снимка»).
 * Пока бэкенда нет, отдаётся MSW (src/app/mocks/snapshots). Даты — ISO 8601.
 */

/** Сколько в снимке клиентов и услуг: «42 клиента, 118 услуг». */
export interface SnapshotVolume {
  clients: number;
  services: number;
}

/** Загруженный снимок — строка «Истории загрузок». */
export interface SnapshotRecord extends SnapshotVolume {
  id: string;
  /** Имя файла, как его загрузили: «data.json». */
  fileName: string;
  uploadedAt: string;
  /** Логин того, кто загрузил. */
  uploadedBy: string;
}

/** Что фронт прочитал из выбранного файла до отправки — для подтверждения замены. */
export interface SnapshotFileSummary extends SnapshotVolume {
  fileName: string;
}
