import { useQuery } from '@tanstack/react-query';

import { modelSettingsApi } from './model-settings.api';

export const modelSettingsKeys = {
  all: ['model-settings'] as const,
} as const;

/**
 * Текущие параметры модели. Фоном не перезапрашиваются: правки на экране живут черновиком,
 * а чужое сохранение поймает сервер при нашем (409).
 */
export const useModelSettings = () =>
  useQuery({
    queryKey: modelSettingsKeys.all,
    queryFn: modelSettingsApi.get,
  });
