import type { QueryClient } from '@tanstack/react-query';

import { clientKeys } from '@/entities/client';
import { dashboardKeys } from '@/entities/dashboard';
import { markModelSettingsOutdated, modelSettingsKeys } from '@/entities/model-settings';
import { usersKeys } from '@/entities/user';
import { RealtimeEntity } from '@/shared/api';

type Invalidate = (queryClient: QueryClient) => Promise<unknown>;

/** Пересчитано всё. Настройки модели — без немедленного перезапроса, чтобы не потерять черновик. */
export const invalidateEverything: Invalidate = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] !== modelSettingsKeys.all[0],
    }),
    markModelSettingsOutdated(queryClient),
  ]);

/** Что устарело после изменения: на сервере пересчитывают риски, потери и прогноз. */
const INVALIDATE: Record<RealtimeEntity, Invalidate> = {
  MODEL_SETTINGS: (queryClient) =>
    Promise.all([
      markModelSettingsOutdated(queryClient),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
    ]),
  CALCULATION_DATE: invalidateEverything,
  SNAPSHOT: invalidateEverything,
  ADMIN_USERS: (queryClient) => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
};

const isRealtimeEntity = (value: unknown): value is RealtimeEntity =>
  Object.values<unknown>(RealtimeEntity).includes(value);

/** Что изменилось, из тела события. Тело не разобрать или сущность новая — `null`. */
export const parseChangedEntity = (data: string): RealtimeEntity | null => {
  try {
    const { entity } = JSON.parse(data) as { entity?: unknown };
    return isRealtimeEntity(entity) ? entity : null;
  } catch {
    return null;
  }
};

/** Неизвестное изменение перезапрашивает всё: лишний запрос лучше устаревших данных. */
export const invalidateChanged = (queryClient: QueryClient, entity: RealtimeEntity | null) =>
  (entity ? INVALIDATE[entity] : invalidateEverything)(queryClient);
