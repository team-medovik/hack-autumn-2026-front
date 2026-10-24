import { getCalculationDate, saveCalculationDate } from '@/shared/api';

import type { CalculationDate } from '../model/types';

export const calculationDateApi = {
  get: (): Promise<CalculationDate> => getCalculationDate(),

  /** Сохраняет и пересчитывает риски на новую дату — ответ после пересчёта. */
  save: (value: CalculationDate): Promise<CalculationDate> => saveCalculationDate(value),
};
