import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getAccessToken } from '@/entities/session';
import { refreshSession } from '@/features/auth';
import { api } from '@/shared/api';

import { invalidateChanged, invalidateEverything, parseChangedEntity } from './invalidate-changes';

/** Событие потока GET /api/v1/events — см. EntityChangedEvent в контракте. */
const CHANGE_EVENT = 'entity-changed';

/** Пауза перед переподключением: растёт вдвое после каждой неудачи, сбрасывается на открытии. */
const RETRY_MIN_MS = 1000;
const RETRY_MAX_MS = 30_000;

/** Токен обновлён — переподключаемся сразу. */
class RetryNow extends Error {}
/** Сервер отказал насовсем (4xx, кроме 401) — не повторяем, данные обновляет polling. */
class StreamRejected extends Error {}
/** Сервер закрыл поток сам — переподключаемся. */
class StreamClosed extends Error {}

const isEventStream = (response: Response) =>
  response.ok && Boolean(response.headers.get('content-type')?.startsWith(EventStreamContentType));

/**
 * Пока поток уходил со старым токеном, сессию могли уже обновить (запрос axios) —
 * тогда просто переподключаемся, а лишний /refresh ротировал бы cookie впустую.
 */
const renewToken = async (sentToken: string | null) => {
  const current = getAccessToken();
  return Boolean(current && current !== sentToken) || Boolean(await refreshSession());
};

/**
 * Изменения от других администраторов без перезагрузки: сервер шлёт по SSE, что изменилось,
 * а мы инвалидируем затронутые запросы — данные приходят обычными GET.
 * EventSource не умеет заголовки, а токен у нас — Bearer, поэтому fetch-event-source.
 */
export const useEntityChanges = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    let retryMs = RETRY_MIN_MS;
    let wasOpen = false;
    let sentToken: string | null = null;

    fetchEventSource(api.getUri({ url: '/api/v1/events' }), {
      signal: controller.signal,
      credentials: 'include',
      // В фоновой вкладке поток не рвём: иначе события за это время потерялись бы
      openWhenHidden: true,

      // Токен — на каждое подключение: между переподключениями его могли обновить
      fetch: (input, init) => {
        sentToken = getAccessToken();
        const headers = new Headers(init?.headers);
        if (sentToken) {
          headers.set('Authorization', `Bearer ${sentToken}`);
        }
        return fetch(input, { ...init, headers });
      },

      async onopen(response) {
        if (isEventStream(response)) {
          retryMs = RETRY_MIN_MS;
          // Пока не было связи, события не приходили — догоняем перезапросом
          if (wasOpen) {
            void invalidateEverything(queryClient);
          }
          wasOpen = true;
          return;
        }
        // 401: токен обновился — сразу, /refresh не ответил — позже. Сессию сбросили —
        // RequireAuth уведёт на вход и отпишет поток
        if (response.status === 401) {
          throw (await renewToken(sentToken)) ? new RetryNow() : new StreamClosed('SSE: 401');
        }
        // 5xx и прокси без потока — временно, остальные 4xx — насовсем
        throw response.status >= 400 && response.status < 500
          ? new StreamRejected(`SSE: ${response.status}`)
          : new StreamClosed(`SSE: ${response.status}`);
      },

      onmessage({ event, data }) {
        if (event === CHANGE_EVENT) {
          void invalidateChanged(queryClient, parseChangedEntity(data));
        }
      },

      onclose() {
        throw new StreamClosed('SSE: поток закрыт сервером');
      },

      onerror(error) {
        if (error instanceof StreamRejected) {
          throw error;
        }
        if (error instanceof RetryNow) {
          return 0;
        }
        const delay = retryMs;
        retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
        return delay;
      },
    }).catch(() => {
      // Поток остановлен (4xx): данные обновляет polling
    });

    return () => controller.abort();
  }, [queryClient]);
};
