import { api } from '@/shared/api';

import type { CalculationDate } from '../model/types';

const URL = '/api/v1/settings/calculation-date';

export const calculationDateApi = {
  get: (): Promise<CalculationDate> =>
    api.get<CalculationDate>(URL).then((response) => response.data),

  /** Сохраняет и пересчитывает риски на новую дату — ответ после пересчёта. */
  save: (value: CalculationDate): Promise<CalculationDate> =>
    api.put<CalculationDate>(URL, value).then((response) => response.data),
};
