import { generatorConsumerStatus, setDashboardSourceMode } from '@/shared/api';

import type { DataSourceKind, DataSourceStatus } from '../model/types';

/** Наш источник ↔ режим бэка: «simulation» у нас — «generator» в API. */
const TO_MODE = { snapshot: 'snapshot', simulation: 'generator' } as const;

export const dataSourceApi = {
  /** 403 — не ADMIN: источник данных видит только администратор. */
  status: (): Promise<DataSourceStatus> => generatorConsumerStatus(),

  /**
   * Переключить, по чему считается панель; ответ — источник после переключения.
   * 409 — потребитель генератора выключен, на живую симуляцию не переключить.
   */
  setMode: async (kind: DataSourceKind): Promise<DataSourceKind> => {
    const { mode } = await setDashboardSourceMode({ mode: TO_MODE[kind] });
    return mode === 'generator' ? 'simulation' : 'snapshot';
  },
};
