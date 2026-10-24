import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { removeUserFromList, usersApi, type User } from '@/entities/user';
import { isNotFoundError } from '@/shared/api';

/** Удаление учётки. Уже удалённая (404) тоже пропадает из списка — цель достигнута. */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: Pick<User, 'id' | 'login'>) => usersApi.remove(id),
    onSuccess: (_, { id }) => removeUserFromList(queryClient, id),
    onError: (error, { id, login }) => {
      if (isNotFoundError(error)) {
        removeUserFromList(queryClient, id);
        return;
      }
      toast.error(`Не удалось удалить ${login}`, {
        description: 'Сервер не ответил. Попробуйте ещё раз',
      });
    },
  });
};
