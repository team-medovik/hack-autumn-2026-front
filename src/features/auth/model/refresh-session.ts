import { useSessionStore } from '@/entities/session';
import { refreshSession as requestRefresh } from '@/shared/api';

let inFlight: Promise<string | null> | null = null;

/**
 * Обновить access-токен по HttpOnly-cookie refresh_token.
 * Одновременные вызовы делят один запрос: при пачке 401 /refresh уйдёт один раз.
 *
 * @returns новый access-токен или `null`, если сессии нет (стор уже сброшен в anonymous)
 */
export const refreshSession = (): Promise<string | null> => {
  inFlight ??= requestRefresh()
    .then((response) => {
      useSessionStore.getState().setSession(response);
      return response.accessToken ?? null;
    })
    .catch(() => {
      useSessionStore.getState().clearSession();
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
