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
  it('считает клиентов и услуги', () => {
    const data = { clients: [{ services: [1, 2] }, { services: [3] }], meta: {} };
    expect(readSnapshotVolume(data)).toEqual({ clients: 2, services: 3 });
  });

  it('не принимает файл без clients[].services[]', () => {
    expect(readSnapshotVolume([])).toBeNull();
    expect(readSnapshotVolume({ clients: {} })).toBeNull();
    expect(readSnapshotVolume({ clients: [{ id: 1 }] })).toBeNull();
  });
});

describe('inspectSnapshotFile', () => {
  it('возвращает имя файла и объём', async () => {
    const file = jsonFile({ clients: [{ services: [{}, {}] }] }, 'data-v2.json');
    await expect(inspectSnapshotFile(file)).resolves.toEqual({
      fileName: 'data-v2.json',
      clients: 1,
      services: 2,
    });
  });

  it.each([
    ['не JSON', new File(['{oops'], 'data.json'), NOT_JSON_MESSAGE],
    ['чужой формат', jsonFile({ users: [] }), WRONG_FORMAT_MESSAGE],
    ['без клиентов', jsonFile({ clients: [] }), NO_CLIENTS_MESSAGE],
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
