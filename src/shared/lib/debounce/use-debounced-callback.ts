import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Функция, которая вызывает `callback` через `delayMs` после последнего вызова:
 * поиск по мере ввода не дёргает запрос на каждую букву.
 * Всегда вызывается свежий `callback`; при размонтировании отложенный вызов отменяется.
 *
 * @example
 * const search = useDebouncedCallback((query: string) => setSearch(query), 300);
 */
export const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) => {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
};
