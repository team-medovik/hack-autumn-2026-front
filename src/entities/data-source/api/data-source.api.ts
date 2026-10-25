import { generatorConsumerStatus } from '@/shared/api';

import type { DataSourceStatus } from '../model/types';

export const dataSourceApi = {
  /** 403 — не ADMIN: источник данных видит только администратор. */
  status: (): Promise<DataSourceStatus> => generatorConsumerStatus(),
};
