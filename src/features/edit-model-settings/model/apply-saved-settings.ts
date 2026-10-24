import type { QueryClient } from '@tanstack/react-query';

import { clientKeys } from '@/entities/client';
import { dashboardKeys } from '@/entities/dashboard';
import { modelSettingsKeys, type ModelSettings } from '@/entities/model-settings';

/**
 * Новая версия настроек — в кэш, а риски и потери пересчитаны на сервере:
 * главная и сводная таблица перезапросятся при следующем показе.
 */
export const applySavedSettings = (queryClient: QueryClient, settings: ModelSettings) => {
  queryClient.setQueryData(modelSettingsKeys.all, settings);
  void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  void queryClient.invalidateQueries({ queryKey: clientKeys.all });
};
