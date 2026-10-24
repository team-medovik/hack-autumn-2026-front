import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { removeUserFromList, usersApi } from '@/entities/user';
import { isNotFoundError } from '@/shared/api';

/** Удаление учётки. Уже удалённая (404) тоже пропадает из списка — цель достигнута. */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: (_, login) => removeUserFromList(queryClient, login),
    onError: (error, login) => {
      if (isNotFoundError(error)) {
        removeUserFromList(queryClient, login);
        return;
      }
      toast.error(`Не удалось удалить ${login}`, {
        description: 'Сервер не ответил. Попробуйте ещё раз',
      });
    },
  });
};
