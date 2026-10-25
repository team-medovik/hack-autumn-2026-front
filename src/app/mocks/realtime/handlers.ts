import { sse } from 'msw';

import type { EntityChangedEvent, RealtimeEntity } from '@/shared/api';

type EventMap = { 'entity-changed': EntityChangedEvent };

interface Stream {
  send: (event: EntityChangedEvent) => void;
  close: () => void;
}

// Фейковый бэк в каждой вкладке свой, а панель держит один поток — живой всегда последний,
// поэтому при новом подключении (StrictMode, обрыв связи) прошлый закрываем. Отписываться
// по request.signal ненадёжно: в браузере он срабатывает не всегда, а запись в закрытый поток
// MSW глотает с ошибкой в консоли. Событие приходит только во вкладку, где сохранили, —
// «чужие» правки показывает сценарий settings-remote-edits.
let stream: Stream | null = null;
let lastEventId = 0;

export const resetRealtimeMock = () => {
  stream?.close();
  stream = null;
  lastEventId = 0;
};

/** Как бэк после коммита: сообщить открытому потоку, что изменилось. */
export const publishChange = (entity: RealtimeEntity, id: string | null = null) => {
  lastEventId += 1;
  stream?.send({ entity, id });
};

export const realtimeHandlers = [
  sse<EventMap>('*/api/v1/events', ({ client }) => {
    stream?.close();
    stream = {
      send: (data) => client.send({ id: String(lastEventId), event: 'entity-changed', data }),
      close: () => client.close(),
    };
  }),
];
