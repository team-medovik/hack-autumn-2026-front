import { delay, http, HttpResponse } from 'msw';

import type {
  ModelSettings,
  ModelSettingsConflict,
  SaveModelSettingsRequest,
} from '@/entities/model-settings';

import { concurrentEdit, INITIAL_SETTINGS } from './fixtures';
import { readMockScenario } from '../scenario';

/**
 * Сценарии /settings/model — по макетам «Настройки — модель (…)»: /settings?mock=settings-conflict
 * main                 — сохранение работает, версия растёт (по умолчанию)
 * settings-conflict    — первое сохранение упирается в чужую версию 5 (409)
 * settings-save-error  — сервер не принимает сохранение
 * settings-loading     — настройки грузятся бесконечно
 * settings-error       — настройки не загрузились
 * Ошибка ввода и диалоги сброса и ухода — состояния самой страницы, сценарий не нужен.
 */
export const SETTINGS_SCENARIOS = [
  'main',
  'settings-conflict',
  'settings-save-error',
  'settings-loading',
  'settings-error',
] as const;

/** Кто сохраняет с этой панели — логин из моков авторизации. */
const CURRENT_USER = 'admin';

// Состояние фейкового бэка: живёт до перезагрузки страницы (в тестах — сбрасывается)
let current: ModelSettings = INITIAL_SETTINGS;
let conflictServed = false;

export const resetSettingsMock = () => {
  current = INITIAL_SETTINGS;
  conflictServed = false;
};

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

const conflict = () =>
  HttpResponse.json<ModelSettingsConflict>(
    { message: 'Настройки уже сохранили в другой версии', current },
    { status: 409 },
  );

export const settingsHandlers = [
  http.get('*/settings/model', async () => {
    const scenario = readMockScenario(SETTINGS_SCENARIOS, 'main');

    if (scenario === 'settings-loading') {
      await delay('infinite');
    }

    await delay();

    if (scenario === 'settings-error') {
      return serverUnavailable();
    }
    return HttpResponse.json(current);
  }),

  http.put('*/settings/model', async ({ request }) => {
    const scenario = readMockScenario(SETTINGS_SCENARIOS, 'main');
    // В dev видно «Загрузку» кнопки, пока идёт пересчёт; в тестах — без задержки
    await delay();

    if (scenario === 'settings-save-error') {
      return serverUnavailable();
    }

    if (scenario === 'settings-conflict' && !conflictServed) {
      conflictServed = true;
      current = concurrentEdit(current);
      return conflict();
    }

    const { version, values } = (await request.json()) as SaveModelSettingsRequest;

    if (version !== current.version) {
      return conflict();
    }
    if (values.riskThresholds.high <= values.riskThresholds.medium) {
      return HttpResponse.json(
        { message: 'Порог высокого должен быть больше порога среднего' },
        { status: 422 },
      );
    }

    current = {
      ...current,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_USER,
      values,
    };
    return HttpResponse.json(current);
  }),
];
