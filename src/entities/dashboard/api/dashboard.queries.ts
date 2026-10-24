import { useQuery } from '@tanstack/react-query';

import { LIVE_REFETCH_INTERVAL_MS } from '@/shared/config';

import { dashboardApi } from './dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
} as const;

/**
 * Сводка дашборда. Одна точка правды для главной и навбара — запрос дедуплицируется.
 * Перезапрашивается в фоне — при потере связи навбар покажет «переподключаемся…»; при ошибке
 * фонового запроса старые данные остаются (`isError && data`).
 */
export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.all,
    queryFn: dashboardApi.get,
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  });
