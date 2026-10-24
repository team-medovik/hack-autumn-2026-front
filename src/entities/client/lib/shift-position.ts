import type { ClientPosition } from '../model/card-types';

/**
 * Позиция соседа, пока сервер её не вернул: номер ±1, соседи неизвестны.
 * `undefined` — `clientId` не сосед прошлой позиции (открыли по ссылке), угадывать нечего.
 */
export const shiftPosition = (
  previous: ClientPosition | undefined,
  clientId: string,
): ClientPosition | undefined => {
  if (!previous || previous.index === null) {
    return undefined;
  }

  const shifted = (index: number): ClientPosition => ({
    index,
    total: previous.total,
    prevId: null,
    nextId: null,
  });

  if (clientId === previous.nextId) {
    return shifted(previous.index + 1);
  }
  if (clientId === previous.prevId) {
    return shifted(previous.index - 1);
  }
  return undefined;
};
