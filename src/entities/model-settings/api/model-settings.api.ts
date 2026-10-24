import { api, getErrorData, isConflictError } from '@/shared/api';

import type {
  ModelSettings,
  ModelSettingsConflict,
  SaveModelSettingsRequest,
} from '../model/types';

const URL = '/api/v1/settings/model';

export const modelSettingsApi = {
  get: (): Promise<ModelSettings> => api.get<ModelSettings>(URL).then((response) => response.data),

  /** 409 — версию успели сохранить другие, актуальная — в теле ответа (см. getConflictingSettings). */
  save: (request: SaveModelSettingsRequest): Promise<ModelSettings> =>
    api.put<ModelSettings>(URL, request).then((response) => response.data),
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
