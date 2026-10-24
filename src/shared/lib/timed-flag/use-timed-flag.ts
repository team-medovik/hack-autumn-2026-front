import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Флаг, который сам гаснет через `durationMs`: «Сохранено» на пару секунд.
 * Повторный `raise()` продлевает показ с начала.
 *
 * @example
 * const [isSaved, flashSaved] = useTimedFlag(4000);
 */
export const useTimedFlag = (durationMs: number) => {
  const [isRaised, setIsRaised] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const raise = useCallback(() => {
    clearTimeout(timer.current);
    setIsRaised(true);
    timer.current = setTimeout(() => setIsRaised(false), durationMs);
  }, [durationMs]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [isRaised, raise] as const;
};
