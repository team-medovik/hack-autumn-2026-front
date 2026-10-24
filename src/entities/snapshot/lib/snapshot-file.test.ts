import { describe, expect, it } from 'vitest';

import { formatSnapshotVolume } from './format-volume';
import {
  inspectSnapshotFile,
  NO_CLIENTS_MESSAGE,
  NOT_JSON_MESSAGE,
  readSnapshotVolume,
  SnapshotFileError,
  WRONG_FORMAT_MESSAGE,
} from './snapshot-file';

const jsonFile = (data: unknown, name = 'data.json') =>
  new File([JSON.stringify(data)], name, { type: 'application/json' });

describe('readSnapshotVolume', () => {
  it('считает аккаунты клиентами и услуги', () => {
    const data = {
      accounts: [{ id: 1 }, { id: 2 }],
      services: [{ id: 1 }, { id: 2 }, { id: 3 }],
      transactions: [],
      meta: {},
    };
    expect(readSnapshotVolume(data)).toEqual({ clients: 2, services: 3 });
  });

  it('transactions необязательны', () => {
    expect(readSnapshotVolume({ accounts: [{ id: 1 }], services: [] })).toEqual({
      clients: 1,
      services: 0,
    });
  });

  it('принимает вложенный формат clients[].services[]', () => {
    const data = {
      clients: [
        { id: 1, services: [{}, {}] },
        { id: 2, services: [{}] },
      ],
    };
    expect(readSnapshotVolume(data)).toEqual({ clients: 2, services: 3 });
  });

  it('не принимает чужой каркас', () => {
    const tables = { accounts: [], services: [], transactions: [] };
    expect(readSnapshotVolume([])).toBeNull();
    expect(readSnapshotVolume({ accounts: [] })).toBeNull();
    expect(readSnapshotVolume({ ...tables, services: {} })).toBeNull();
    expect(readSnapshotVolume({ ...tables, transactions: [1] })).toBeNull();
    expect(readSnapshotVolume({ clients: [{ id: 1 }] })).toBeNull();
  });
});

describe('inspectSnapshotFile', () => {
  it('возвращает имя файла и объём', async () => {
    const file = jsonFile(
      { accounts: [{ id: 1 }], services: [{ id: 1 }, { id: 2 }], transactions: [{ id: 1 }] },
      'data-v2.json',
    );
    await expect(inspectSnapshotFile(file)).resolves.toEqual({
      fileName: 'data-v2.json',
      clients: 1,
      services: 2,
    });
  });

  it.each([
    ['не JSON', new File(['{oops'], 'data.json'), NOT_JSON_MESSAGE],
    ['чужой формат', jsonFile({ users: [] }), WRONG_FORMAT_MESSAGE],
    [
      'без клиентов',
      jsonFile({ accounts: [], services: [], transactions: [] }),
      NO_CLIENTS_MESSAGE,
    ],
  ])('отклоняет файл: %s', async (_, file, message) => {
    const result = inspectSnapshotFile(file);
    await expect(result).rejects.toBeInstanceOf(SnapshotFileError);
    await expect(result).rejects.toThrow(message);
  });
});

describe('formatSnapshotVolume', () => {
  it('склоняет клиентов и услуги', () => {
    expect(formatSnapshotVolume({ clients: 42, services: 118 })).toBe('42 клиента, 118 услуг');
    expect(formatSnapshotVolume({ clients: 44, services: 121 })).toBe('44 клиента, 121 услуга');
  });
});
