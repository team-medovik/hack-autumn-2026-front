import { delay, http, HttpResponse } from 'msw';

import type { DataSourceStatus } from '@/entities/data-source';
import type { Simulation, SpeedRequest, WorkerState } from '@/entities/simulation';
import type { DashboardSourceMode } from '@/shared/api';

import { publishChange } from '../realtime';
import { readMockScenario } from '../scenario';

/**
 * Сценарии источника данных и живой симуляции — по макетам «Настройки — другое (живая симуляция)»
 * и «Импорт/экспорт снимка (…)»: /settings?mock=json-source
 * main                    — панель считается по живой симуляции, скорость меняется (по умолчанию)
 * json-source             — панель считается по JSON-снимку, генератор работает в фоне
 * simulation-starting     — генератор запускается
 * simulation-paused       — генератор на паузе, время стоит
 * simulation-finished     — горизонт симуляции пройден, время стоит
 * simulation-error        — генератор упал, события не доходят до панели
 * simulation-unavailable  — панель на симуляции, но генератор не отвечает (503)
 * Генератор от источника панели не зависит: GET /admin/simulation отвечает и при JSON-снимке.
 * Переключатель источника (PUT /admin/source/mode) и загрузка снимка меняют источник до перезагрузки
 * страницы. На генератор не переключить, если он не отвечает (simulation-unavailable) — 409.
 */
export const DATA_SOURCE_SCENARIOS = [
  'main',
  'json-source',
  'simulation-starting',
  'simulation-paused',
  'simulation-finished',
  'simulation-error',
  'simulation-unavailable',
] as const;

type Scenario = (typeof DATA_SOURCE_SCENARIOS)[number];

const WORKER_STATES: Partial<Record<Scenario, WorkerState>> = {
  main: 'running',
  'json-source': 'running',
  'simulation-starting': 'starting',
  'simulation-paused': 'paused',
  'simulation-finished': 'finished',
  'simulation-error': 'error',
};

/** Виртуальное время на старте — как в макете. */
const VIRTUAL_START = Date.UTC(2026, 1, 6, 12, 0);

const RUN_ID = '6f5fb823-01c2-4c8a-a8d9-a20871bf09c3';

const TIME_SCALES = [1, 10, 60] as const;

/** Через сколько потребитель повторит запрос после ошибки. */
const RETRY_MS = 60_000;

// Состояние фейкового бэка: живёт до перезагрузки страницы (в тестах — сбрасывается).
// Часы: виртуальное время на момент последней смены скорости + сколько прошло с неё × скорость.
let timeScale = 60;
let virtualAtChange = VIRTUAL_START;
let realAtChange = Date.now();
/** Источник, выбранный переключателем или загрузкой снимка; `null` — как задаёт сценарий. */
let liveOverride: boolean | null = null;

export const resetDataSourceMock = () => {
  timeScale = 60;
  virtualAtChange = VIRTUAL_START;
  realAtChange = Date.now();
  liveOverride = null;
};

/** Загрузили JSON-снимок — панель дальше считается по нему. */
export const stopSimulation = () => {
  liveOverride = false;
};

const scenario = () => readMockScenario(DATA_SOURCE_SCENARIOS, 'main');

const isTicking = (state: WorkerState) => state === 'running' || state === 'error';

const virtualNow = (state: WorkerState) =>
  isTicking(state) ? virtualAtChange + (Date.now() - realAtChange) * timeScale : virtualAtChange;

const isLive = (current: Scenario) => liveOverride ?? current !== 'json-source';

const buildConsumerStatus = (current: Scenario): DataSourceStatus => {
  if (!isLive(current)) {
    return { enabled: false, usedForDashboard: false, progress: null };
  }
  const isError = current === 'simulation-error';
  const applied = Math.floor((Date.now() - realAtChange) / 1000) + 1200;

  return {
    enabled: true,
    usedForDashboard: true,
    progress: {
      sourceId: 'kotlin-api',
      runId: RUN_ID,
      receivedSequence: applied,
      appliedSequence: applied,
      publishedAt: new Date(virtualNow(WORKER_STATES[current] ?? 'running')).toISOString(),
      publishedRevision: applied,
      failureCount: isError ? 3 : 0,
      retryAfter: new Date(Date.now() + RETRY_MS).toISOString(),
      lastError: isError ? 'FETCH_FAILED' : null,
    },
  };
};

const buildSimulation = (workerState: WorkerState): Simulation => ({
  runId: RUN_ID,
  virtualTime: new Date(virtualNow(workerState)).toISOString(),
  timeScale,
  workerState,
  finished: workerState === 'finished',
  syntheticOnly: true,
  supportedTimeScales: [...TIME_SCALES],
});

const generatorUnavailable = () =>
  HttpResponse.json({ message: 'Генератор недоступен' }, { status: 503 });

/** Состояние генератора в сценарии; `null` — генератор не отвечает (503). */
const currentWorkerState = () => WORKER_STATES[scenario()] ?? null;

const isModeRequest = (body: unknown): body is DashboardSourceMode =>
  typeof body === 'object' &&
  body !== null &&
  'mode' in body &&
  (body.mode === 'snapshot' || body.mode === 'generator');

const isSpeedRequest = (body: unknown): body is SpeedRequest =>
  typeof body === 'object' &&
  body !== null &&
  'runId' in body &&
  typeof body.runId === 'string' &&
  'timeScale' in body &&
  TIME_SCALES.includes(body.timeScale as never);

export const dataSourceHandlers = [
  http.get('*/api/v1/admin/source/mode', async () => {
    await delay();
    return HttpResponse.json({ mode: isLive(scenario()) ? 'generator' : 'snapshot' });
  }),

  http.put('*/api/v1/admin/source/mode', async ({ request }) => {
    await delay();
    const body: unknown = await request.json();
    if (!isModeRequest(body)) {
      return HttpResponse.json({ message: 'mode must be snapshot or generator' }, { status: 400 });
    }
    const useGenerator = body.mode === 'generator';
    // Как бэк: на генератор нельзя, если его потребитель выключен
    if (useGenerator && !currentWorkerState()) {
      return HttpResponse.json({ message: 'Generator consumer is disabled' }, { status: 409 });
    }
    if (isLive(scenario()) !== useGenerator) {
      liveOverride = useGenerator;
      publishChange('SNAPSHOT', null);
    }
    return HttpResponse.json({ mode: body.mode });
  }),

  http.get('*/api/v1/admin/generator/consumer', async () => {
    await delay();
    return HttpResponse.json(buildConsumerStatus(scenario()));
  }),

  http.get('*/api/v1/admin/simulation', async () => {
    await delay();
    const workerState = currentWorkerState();
    return workerState ? HttpResponse.json(buildSimulation(workerState)) : generatorUnavailable();
  }),

  http.patch('*/api/v1/admin/simulation/speed', async ({ request }) => {
    await delay();
    const workerState = currentWorkerState();
    if (!workerState) {
      return generatorUnavailable();
    }

    const body: unknown = await request.json();
    if (!isSpeedRequest(body)) {
      return HttpResponse.json({ message: 'Скорость — только 1, 10 или 60' }, { status: 400 });
    }
    if (body.runId !== RUN_ID) {
      return HttpResponse.json({ message: 'Запуск генератора сменился' }, { status: 409 });
    }

    // Время до смены идёт со старой скоростью, дальше — с новой
    virtualAtChange = virtualNow(workerState);
    realAtChange = Date.now();
    timeScale = body.timeScale;
    return HttpResponse.json(buildSimulation(workerState));
  }),
];
