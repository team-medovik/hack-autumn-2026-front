import { useQueryClient } from '@tanstack/react-query';

import { useSessionActions } from '@/entities/session';
import { useLogout } from '@/shared/api';

/**
 * Выход: сервер сбрасывает cookie refresh_token, клиент — сессию и весь кэш запросов.
 * Сессия сбрасывается и при ошибке запроса — пользователь нажал «выйти», значит выходим.
 */
export const useLogoutAction = () => {
  const { clearSession } = useSessionActions();
  const queryClient = useQueryClient();

  return useLogout({
    mutation: {
      onSettled: () => {
        clearSession();
        queryClient.clear();
      },
    },
  });
};
