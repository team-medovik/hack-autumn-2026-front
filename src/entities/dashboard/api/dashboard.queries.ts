import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from './dashboard.api';

/** Как часто перезапрашивать сводку: при потере связи навбар покажет «переподключаемся…». */
const REFETCH_INTERVAL_MS = 30_000;

export const dashboardKeys = {
  all: ['dashboard'] as const,
} as const;

/**
 * Сводка дашборда. Одна точка правды для главной и навбара — запрос дедуплицируется.
 * Перезапрашивается в фоне; при ошибке фонового запроса старые данные остаются (`isError && data`).
 */
export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.all,
    queryFn: dashboardApi.get,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
