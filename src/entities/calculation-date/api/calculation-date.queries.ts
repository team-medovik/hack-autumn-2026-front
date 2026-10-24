import { useQuery } from '@tanstack/react-query';

import { calculationDateApi } from './calculation-date.api';

export const calculationDateKeys = {
  all: ['calculation-date'] as const,
} as const;

export const useCalculationDate = () =>
  useQuery({
    queryKey: calculationDateKeys.all,
    queryFn: calculationDateApi.get,
  });
