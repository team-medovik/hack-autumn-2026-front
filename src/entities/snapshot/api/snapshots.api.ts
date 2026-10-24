import { api, getErrorData, listSnapshots } from '@/shared/api';

import type { SnapshotRecord } from '../model/types';

/** История загрузок и файлы снимков — дополнительные эндпоинты команды. */
const URL = '/api/v1/snapshots';
/** Загрузка снимка — обязательный эндпоинт кейса (replaceSourceSnapshot в контракте). */
const SOURCE_SNAPSHOT_URL = '/api/v1/source/snapshot';

// Файл туда и обратно идёт как есть — без разбора в объект, поэтому скачивание и загрузка
// (с прогрессом) — прямыми запросами, а не сгенерированными функциями
export const snapshotsApi = {
  /** Все загрузки, новые сверху. Первая — текущий снимок, по нему посчитаны риски. */
  list: (): Promise<SnapshotRecord[]> => listSnapshots(),

  /** Файл снимка как его загрузили — для «Скачать JSON». */
  download: (id: string): Promise<Blob> =>
    api
      .get<Blob>(`${URL}/${encodeURIComponent(id)}/file`, { responseType: 'blob' })
      .then((response) => response.data),

  /**
   * Загрузить новый снимок или полностью заменить текущий: сервер проверяет структуру, заменяет
   * данные и пересчитывает риски, ответ — после пересчёта. 422 — файл не того формата (текст в
   * `message`).
   * `onProgress` — доля отправленного файла 0–1.
   */
  upload: async (file: File, onProgress?: (share: number) => void): Promise<SnapshotRecord> => {
    // Файл — телом запроса как есть (текстом: Blob не везде доходит до сервера целым), имя — в
    // параметре. Без multipart
    const content = await file.text();
    const response = await api.put<SnapshotRecord>(SOURCE_SNAPSHOT_URL, content, {
      params: { fileName: file.name },
      headers: { 'Content-Type': 'application/json' },
      // Ответ приходит после пересчёта рисков — общий таймаут для него мал
      timeout: 0,
      onUploadProgress: ({ progress }) => {
        if (progress !== undefined) {
          onProgress?.(progress);
        }
      },
    });
    return response.data;
  },
};

/** Текст ошибки из тела ответа (`message`), если сервер его прислал. */
export const getSnapshotErrorMessage = (error: unknown): string | null => {
  const data = getErrorData(error);
  return typeof data === 'object' && data !== null && 'message' in data
    ? String(data.message)
    : null;
};
