import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  getConflictingSettings,
  isSameValues,
  isValidRiskThresholds,
  modelSettingsApi,
  type ModelSettings,
  type ModelSettingsValues,
} from '@/entities/model-settings';

import { applySavedSettings } from './apply-saved-settings';
import { useSettingsDraft } from './use-settings-draft';

/** Сохранение упёрлось в чужую версию: что сохранили другие и что пытались сохранить мы. */
export interface SettingsConflict {
  latest: ModelSettings;
  values: ModelSettingsValues;
}

interface EditorOptions {
  /** Сохранение прошло, риски пересчитаны. */
  onSaved?: () => void;
}

/**
 * Редактирование параметров модели: черновик, проверка, сохранение с защитой от одновременной
 * правки. Сохранённая версия попадает в кэш — редактор с `key={settings.version}` пересоздаётся
 * с чистым черновиком.
 */
export const useModelSettingsEditor = (
  settings: ModelSettings,
  { onSaved }: EditorOptions = {},
) => {
  const queryClient = useQueryClient();
  const { draft, update, discard, isDirty } = useSettingsDraft(settings.values);
  const [conflict, setConflict] = useState<SettingsConflict | null>(null);

  // Колбэки уровня useMutation срабатывают, даже если редактор успел пересоздаться
  const { mutate, isPending } = useMutation({
    mutationFn: modelSettingsApi.save,
    onSuccess: (saved) => {
      applySavedSettings(queryClient, saved);
      onSaved?.();
    },
    onError: (error, { values }) => {
      const latest = getConflictingSettings(error);
      if (latest) {
        setConflict({ latest, values });
        return;
      }
      toast.error('Не удалось сохранить настройки', {
        description: 'Сервер не ответил. Изменения остались на экране — попробуйте ещё раз',
      });
    },
  });

  const isThresholdsValid = isValidRiskThresholds(draft.riskThresholds);
  const isDefault = isSameValues(settings.values, settings.defaults);

  return {
    draft,
    update,
    isDirty,
    isThresholdsValid,
    isSaving: isPending,
    canSave: isDirty && isThresholdsValid && !isPending,
    canDiscard: isDirty && !isPending,
    canReset: !(isDefault && isSameValues(draft, settings.defaults)) && !isPending,

    save: () => mutate({ version: settings.version, values: draft }),
    discard,
    /**
     * Вернуть значения по умолчанию — правки черновика пропадают. Если они и так сохранены,
     * пересчитывать нечего: просто откатываем черновик.
     */
    resetToDefaults: () =>
      isDefault ? discard() : mutate({ version: settings.version, values: settings.defaults }),

    conflict,
    dismissConflict: () => setConflict(null),
    /** Сохранить свои значения поверх чужой версии. */
    overwrite: () => {
      if (conflict) {
        mutate({ version: conflict.latest.version, values: conflict.values });
        setConflict(null);
      }
    },
    /** Взять чужую версию, свои правки — выбросить. */
    loadLatest: () => {
      if (conflict) {
        applySavedSettings(queryClient, conflict.latest);
        setConflict(null);
      }
    },
  };
};

export type ModelSettingsEditor = ReturnType<typeof useModelSettingsEditor>;
