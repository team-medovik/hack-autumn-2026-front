import { useQuery, type QueryClient } from '@tanstack/react-query';

import { modelSettingsApi } from './model-settings.api';

/**
 * Сколько настройки считаются свежими. Задано здесь, а не взято из умолчаний клиента: редактор
 * перезапрашивает их, когда они становятся устаревшими, — при нуле они устаревали бы сразу
 * и пометка от чужого сохранения ничего бы не меняла.
 */
const MODEL_SETTINGS_STALE_MS = 5 * 60 * 1000;

export const modelSettingsKeys = {
  all: ['model-settings'] as const,
} as const;

/**
 * Настройки сохранил кто-то другой. Сразу не перезапрашиваем: новая версия пересоздала бы
 * редактор и выбросила черновик. Редактор перезапросит сам, когда черновик чист.
 */
export const markModelSettingsOutdated = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: modelSettingsKeys.all, refetchType: 'none' });

/**
 * Текущие параметры модели. Фоном не перезапрашиваются: правки на экране живут черновиком.
 * О чужом сохранении сообщает поток событий, а сохранение поверх чужой версии поймает сервер (409).
 */
export const useModelSettings = () =>
  useQuery({
    queryKey: modelSettingsKeys.all,
    queryFn: modelSettingsApi.get,
    staleTime: MODEL_SETTINGS_STALE_MS,
  });
