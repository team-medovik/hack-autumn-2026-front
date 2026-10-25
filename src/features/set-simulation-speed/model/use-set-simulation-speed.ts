import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { simulationApi, simulationKeys } from '@/entities/simulation';
import { isConflictError } from '@/shared/api';

/**
 * Смена скорости симуляции. Ждём ответа сервера и показываем сохранённую скорость из него —
 * так требует контракт. 409 — симуляцию перезапустили, скорость не менялась: перечитываем.
 */
export const useSetSimulationSpeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: simulationApi.setSpeed,
    onSuccess: (simulation) => queryClient.setQueryData(simulationKeys.all, simulation),
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: simulationKeys.all });
      if (isConflictError(error)) {
        toast.error('Симуляцию перезапустили', {
          description: 'Скорость не изменилась. Проверьте состояние и выберите её ещё раз',
        });
        return;
      }
      toast.error('Не удалось сменить скорость', {
        description: 'Генератор не ответил. Попробуйте ещё раз',
      });
    },
  });
};
