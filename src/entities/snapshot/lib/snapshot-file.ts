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

/** Таблица выгрузки — массив записей-объектов. */
const isTable = (value: unknown): value is Record<string, unknown>[] =>
  Array.isArray(value) && value.every(isObject);

/** `transactions` необязательны в обоих форматах, но если есть — это таблица. */
const hasValidTransactions = ({ transactions }: Record<string, unknown>) =>
  transactions === undefined || isTable(transactions);

/** Основной формат кейса: `{ accounts: [...], services: [...], transactions?: [...] }`. */
const readFlatVolume = (data: Record<string, unknown>): SnapshotVolume | null => {
  const { accounts, services } = data;
  return isTable(accounts) && isTable(services)
    ? { clients: accounts.length, services: services.length }
    : null;
};

/** Вложенный формат: `{ clients: [{ ...аккаунт, services: [...] }], transactions?: [...] }`. */
const readNestedVolume = ({ clients }: Record<string, unknown>): SnapshotVolume | null => {
  if (!isTable(clients) || !clients.every((client) => isTable(client.services))) {
    return null;
  }
  const services = clients.reduce((sum, client) => sum + (client.services as unknown[]).length, 0);
  return { clients: clients.length, services };
};

/**
 * Клиенты и услуги выгрузки в одном из форматов PUT /source/snapshot (SourceSnapshot в
 * контракте); клиент — это аккаунт. Фронт проверяет только каркас, поля и связи — сервер
 * при загрузке. `null` — каркас не тот.
 */
export const readSnapshotVolume = (data: unknown): SnapshotVolume | null => {
  if (!isObject(data) || !hasValidTransactions(data)) {
    return null;
  }
  return 'accounts' in data ? readFlatVolume(data) : readNestedVolume(data);
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
