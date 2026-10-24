import type { SnapshotFileSummary, SnapshotVolume } from '../model/types';

/** Файл не похож на выгрузку биллинга — текст для зоны загрузки «Файл не загружен». */
export class SnapshotFileError extends Error {
  override name = 'SnapshotFileError';
}

export const NOT_JSON_MESSAGE = 'Не удалось прочитать файл: это не JSON или он повреждён';
export const WRONG_FORMAT_MESSAGE =
  'Не удалось извлечь данные из JSON: данные не соответствуют ожидаемому формату';
export const NO_CLIENTS_MESSAGE = 'В файле нет ни одного клиента';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Клиенты и услуги выгрузки. Фронт проверяет только каркас `{ clients: [{ services: [] }] }`,
 * остальное — сервер при загрузке. `null` — каркас не тот.
 */
export const readSnapshotVolume = (data: unknown): SnapshotVolume | null => {
  if (!isObject(data) || !Array.isArray(data.clients)) {
    return null;
  }
  let services = 0;
  for (const client of data.clients) {
    if (!isObject(client) || !Array.isArray(client.services)) {
      return null;
    }
    services += client.services.length;
  }
  return { clients: data.clients.length, services };
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    throw new SnapshotFileError(NOT_JSON_MESSAGE);
  }
};

/**
 * Прочитать выбранный файл и посчитать клиентов и услуги — для «Заменить данные?».
 * Отклоняется с `SnapshotFileError`, если это не выгрузка.
 */
export const inspectSnapshotFile = async (file: File): Promise<SnapshotFileSummary> => {
  const volume = readSnapshotVolume(parseJson(await file.text()));
  if (!volume) {
    throw new SnapshotFileError(WRONG_FORMAT_MESSAGE);
  }
  if (volume.clients === 0) {
    throw new SnapshotFileError(NO_CLIENTS_MESSAGE);
  }
  return { fileName: file.name, ...volume };
};
