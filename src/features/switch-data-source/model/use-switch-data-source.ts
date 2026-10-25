import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  dataSourceApi,
  dataSourceKeys,
  type DataSourceKind,
  type DataSourceStatus,
} from '@/entities/data-source';
import { isConflictError } from '@/shared/api';

const ERROR_TEXTS = {
  conflict: 'Генератор на сервере выключен — на живую симуляцию не переключить',
  other: 'Сервер не ответил. Попробуйте ещё раз',
};

/**
 * Переключение источника панели. Выбор виден сразу, после ответа — источник из ответа сервера;
 * не переключилось — откатываем и сообщаем. После переключения пересчитано всё — устарели
 * все данные панели.
 */
export const useSwitchDataSource = () => {
  const queryClient = useQueryClient();

  const showSource = (kind: DataSourceKind) =>
    queryClient.setQueryData<DataSourceStatus>(
      dataSourceKeys.all,
      (current) => current && { ...current, usedForDashboard: kind === 'simulation' },
    );

  return useMutation({
    mutationFn: dataSourceApi.setMode,
    onMutate: async (kind) => {
      await queryClient.cancelQueries({ queryKey: dataSourceKeys.all });
      const previous = queryClient.getQueryData<DataSourceStatus>(dataSourceKeys.all);
      showSource(kind);
      return { previous };
    },
    onSuccess: showSource,
    onError: (error, _, context) => {
      queryClient.setQueryData(dataSourceKeys.all, context?.previous);
      toast.error('Не удалось переключить источник данных', {
        description: isConflictError(error) ? ERROR_TEXTS.conflict : ERROR_TEXTS.other,
      });
    },
    onSettled: () => queryClient.invalidateQueries(),
  });
};
