import { useSessionStore } from '@/entities/session';
import { isClientError, refreshSession as requestRefresh } from '@/shared/api';

let inFlight: Promise<string | null> | null = null;

/**
 * Refresh-токен ротируется: если две вкладки одновременно отправят одну и ту же cookie,
 * вторая получит 401 и разлогинит пользователя. Web Locks сериализуют /refresh между вкладками —
 * следующая вкладка уйдёт уже с новой cookie, которую выставил ответ первой.
 */
const requestRefreshExclusive = () =>
  typeof navigator !== 'undefined' && 'locks' in navigator
    ? navigator.locks.request('session-refresh', () => requestRefresh())
    : requestRefresh();

/**
 * Обновить access-токен по HttpOnly-cookie refresh_token.
 * Одновременные вызовы делят один запрос: при пачке 401 /refresh уйдёт один раз.
 *
 * Сессия сбрасывается, только если сервер отказал в refresh-токене (4xx). Сетевой сбой или 5xx
 * не разлогинивает: запрос упадёт, а следующий 401 попробует обновиться снова.
 * Исключение — старт приложения (статус unknown): там без ответа считаем сессию отсутствующей.
 *
 * @returns новый access-токен или `null`, если обновить не удалось
 */
export const refreshSession = (): Promise<string | null> => {
  inFlight ??= requestRefreshExclusive()
    .then((response) => {
      useSessionStore.getState().setSession(response);
      return response.accessToken ?? null;
    })
    .catch((error: unknown) => {
      const { status, clearSession } = useSessionStore.getState();
      if (status === 'unknown' || isClientError(error)) {
        clearSession();
      }
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
