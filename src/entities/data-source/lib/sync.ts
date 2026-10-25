import { formatTime } from '@/shared/lib/format';

import type { DataSourceKind, DataSourceStatus, SyncProgress } from '../model/types';

export const getDataSourceKind = ({ usedForDashboard }: DataSourceStatus): DataSourceKind =>
  usedForDashboard ? 'simulation' : 'snapshot';

/** Коды ошибок потребителя из контракта — тем языком, каким их поймёт админ. */
const ERROR_TEXTS: Record<string, string> = {
  FETCH_FAILED: 'Не получилось забрать события генератора',
  APPLY_FAILED: 'Не получилось применить события генератора',
};

/**
 * Ошибка доставки событий генератора в панель: «Не получилось забрать события генератора.
 * Повтор в 22:15». События при этом не теряются — их применят на следующей попытке.
 * Ошибки нет — `null`.
 */
export const describeSyncError = ({ lastError, retryAfter }: SyncProgress) => {
  if (!lastError) {
    return null;
  }
  const text = ERROR_TEXTS[lastError] ?? 'Не получилось обновить данные симуляции';
  return `${text}. Повтор в ${formatTime(retryAfter)}`;
};
