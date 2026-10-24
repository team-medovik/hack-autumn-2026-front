import { delay, http, HttpResponse } from 'msw';

import { readSnapshotVolume, WRONG_FORMAT_MESSAGE, type SnapshotRecord } from '@/entities/snapshot';

import { buildSnapshotFile, INITIAL_SNAPSHOTS } from './fixtures';
import { readMockScenario } from '../scenario';

/**
 * Сценарии /snapshots — по макетам «Импорт/экспорт снимка (…)»: /snapshot?mock=snapshots-empty
 * main                    — история, скачивание и загрузка работают (по умолчанию)
 * snapshots-empty         — снимков ещё не загружали, первый грузится без подтверждения
 * snapshots-loading       — история грузится бесконечно
 * snapshots-error         — история не загрузилась
 * snapshot-upload-error   — сервер не принимает загрузку (503)
 * snapshot-rejected       — сервер не принимает формат (422), хотя фронт файл пропустил
 * Перетаскивание, подтверждение, ошибку формата и итог даёт сам файл — сценарий не нужен.
 */
export const SNAPSHOTS_SCENARIOS = [
  'main',
  'snapshots-empty',
  'snapshots-loading',
  'snapshots-error',
  'snapshot-upload-error',
  'snapshot-rejected',
] as const;

/** Кто загружает с этой панели — логин из моков авторизации. */
const CURRENT_USER = 'admin';

/** Сколько «пересчитывает» сервер в dev — чтобы был виден прогресс. В тестах — сразу. */
const RECALCULATION_MS = import.meta.env.MODE === 'test' ? 0 : 1500;

// Состояние фейкового бэка: живёт до перезагрузки страницы (в тестах — сбрасывается)
let snapshots: SnapshotRecord[] = [...INITIAL_SNAPSHOTS];

export const resetSnapshotsMock = () => {
  snapshots = [...INITIAL_SNAPSHOTS];
};

const scenario = () => readMockScenario(SNAPSHOTS_SCENARIOS, 'main');

const visibleSnapshots = () => (scenario() === 'snapshots-empty' ? [] : snapshots);

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

const unprocessable = (message: string) => HttpResponse.json({ message }, { status: 422 });

const readJson = async (request: Request): Promise<unknown> => {
  try {
    return JSON.parse(await request.text());
  } catch {
    return null;
  }
};

export const snapshotsHandlers = [
  http.get('*/api/v1/snapshots', async () => {
    if (scenario() === 'snapshots-loading') {
      await delay('infinite');
    }
    await delay();

    if (scenario() === 'snapshots-error') {
      return serverUnavailable();
    }
    return HttpResponse.json(visibleSnapshots());
  }),

  http.get('*/api/v1/snapshots/:id/file', async ({ params }) => {
    await delay();

    const snapshot = visibleSnapshots().find(({ id }) => id === params.id);
    if (!snapshot) {
      return HttpResponse.json({ message: 'Снимок не найден' }, { status: 404 });
    }
    return HttpResponse.json(buildSnapshotFile(snapshot), {
      headers: { 'Content-Disposition': `attachment; filename="${snapshot.fileName}"` },
    });
  }),

  http.post('*/api/v1/snapshots', async ({ request }) => {
    await delay(RECALCULATION_MS);

    if (scenario() === 'snapshot-upload-error') {
      return serverUnavailable();
    }
    if (scenario() === 'snapshot-rejected') {
      return unprocessable(WRONG_FORMAT_MESSAGE);
    }

    const fileName = new URL(request.url).searchParams.get('fileName');
    if (!fileName) {
      return unprocessable('Не указано имя файла');
    }
    const volume = readSnapshotVolume(await readJson(request));
    if (!volume || volume.clients === 0) {
      return unprocessable(WRONG_FORMAT_MESSAGE);
    }

    const snapshot: SnapshotRecord = {
      id: `snapshot-${Date.now()}`,
      fileName,
      uploadedAt: new Date().toISOString(),
      uploadedBy: CURRENT_USER,
      ...volume,
    };
    snapshots = [snapshot, ...snapshots];
    return HttpResponse.json(snapshot, { status: 201 });
  }),
];
