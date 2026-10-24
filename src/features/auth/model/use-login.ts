import { useSessionActions } from '@/entities/session';
import { useLogin } from '@/shared/api';

/**
 * Вход по логину и паролю: при успехе ответ /login сохраняется в сессию.
 * Редирект после входа делает GuestOnly — он реагирует на смену статуса сессии.
 *
 * @example
 * const { mutate: login, isPending } = useLoginAction();
 * login({ data: { login, password } }, { onError: … });
 */
export const useLoginAction = () => {
  const { setSession } = useSessionActions();

  return useLogin({ mutation: { onSuccess: setSession } });
};
