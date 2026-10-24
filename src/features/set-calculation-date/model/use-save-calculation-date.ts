import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  calculationDateApi,
  calculationDateKeys,
  type CalculationDate,
} from '@/entities/calculation-date';

/**
 * Сохранение даты расчёта. Выбор виден сразу; не сохранилось — откатываем и сообщаем.
 * После сохранения риски пересчитаны — устарели все данные панели.
 */
export const useSaveCalculationDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculationDateApi.save,
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: calculationDateKeys.all });
      const previous = queryClient.getQueryData<CalculationDate>(calculationDateKeys.all);
      queryClient.setQueryData(calculationDateKeys.all, next);
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(calculationDateKeys.all, context?.previous);
      toast.error('Не удалось сменить дату расчёта', {
        description: 'Сервер не ответил. Попробуйте ещё раз',
      });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
