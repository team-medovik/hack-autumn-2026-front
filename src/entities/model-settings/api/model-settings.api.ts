import {
  getErrorData,
  getRiskModelSettings,
  isConflictError,
  patchRiskModelSettings,
} from '@/shared/api';

import type {
  ModelSettings,
  ModelSettingsConflict,
  PatchModelSettingsRequest,
} from '../model/types';

export const modelSettingsApi = {
  get: (): Promise<ModelSettings> => getRiskModelSettings(),

  /**
   * Изменённые поля поверх версии `version`; ответ — полные настройки после пересчёта.
   * 409 — версию успели сохранить другие, актуальная — в теле ответа (см. getConflictingSettings);
   * 422 — значения не прошли проверку, ничего не применено.
   */
  patch: (request: PatchModelSettingsRequest): Promise<ModelSettings> =>
    patchRiskModelSettings(request),
};

const isConflictBody = (data: unknown): data is ModelSettingsConflict =>
  typeof data === 'object' && data !== null && 'current' in data;

/** Настройки, которые сохранил кто-то другой, пока мы редактировали. `null` — это не конфликт. */
export const getConflictingSettings = (error: unknown): ModelSettings | null => {
  if (!isConflictError(error)) {
    return null;
  }
  const data = getErrorData(error);
  return isConflictBody(data) ? data.current : null;
};
