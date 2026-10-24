import { useState } from 'react';

import { isSameValues, type ModelSettingsValues } from '@/entities/model-settings';

/** Изменение одной группы параметров: `update('riskThresholds', { high: 75 })`. */
export type UpdateSettings = <G extends keyof ModelSettingsValues>(
  group: G,
  patch: Partial<ModelSettingsValues[G]>,
) => void;

/**
 * Черновик параметров поверх сохранённых. Начальное значение берётся один раз:
 * после сохранения или загрузки чужой версии редактор пересоздаётся (key = версия).
 */
export const useSettingsDraft = (saved: ModelSettingsValues) => {
  const [draft, setDraft] = useState(saved);

  const update: UpdateSettings = (group, patch) =>
    setDraft((previous) => ({ ...previous, [group]: { ...previous[group], ...patch } }));

  return {
    draft,
    update,
    discard: () => setDraft(saved),
    isDirty: !isSameValues(draft, saved),
  };
};
