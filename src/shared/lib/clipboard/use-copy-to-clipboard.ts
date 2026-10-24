import { useCallback } from 'react';

import { useTimedFlag } from '@/shared/lib/timed-flag';

/**
 * Копирование текста в буфер с флагом «Скопировано» на `durationMs`.
 * `copy` отклоняется, если браузер не дал доступа к буферу (нет HTTPS, запрет в настройках).
 *
 * @example
 * const [isCopied, copy] = useCopyToClipboard(2000);
 * <Button onClick={() => copy(text).catch(showError)}>{isCopied ? 'Скопировано' : 'Скопировать'}</Button>
 */
export const useCopyToClipboard = (durationMs: number) => {
  const [isCopied, flashCopied] = useTimedFlag(durationMs);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      flashCopied();
    },
    [flashCopied],
  );

  return [isCopied, copy] as const;
};
