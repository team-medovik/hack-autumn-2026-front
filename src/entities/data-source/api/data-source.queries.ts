import { useQuery } from '@tanstack/react-query';

import { LIVE_REFETCH_INTERVAL_MS } from '@/shared/config';

import { dataSourceApi } from './data-source.api';

export const dataSourceKeys = {
  all: ['data-source'] as const,
} as const;

interface UseDataSourceStatusOptions {
  /** Эндпоинт только для ADMIN — остальным не спрашиваем. */
  enabled: boolean;
}

/**
 * Источник данных и состояние симуляции. Новый опубликованный снимок приходит событием SNAPSHOT
 * (перезапрашивается всё), а виртуальное время и ошибки потребителя — фоном, как остальные данные.
 */
export const useDataSourceStatus = ({ enabled }: UseDataSourceStatusOptions) =>
  useQuery({
    queryKey: dataSourceKeys.all,
    queryFn: dataSourceApi.status,
    enabled,
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  });
