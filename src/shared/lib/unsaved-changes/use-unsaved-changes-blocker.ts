import { useCallback, useEffect } from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';

/**
 * Не даёт потерять несохранённые правки: пока `when`, переход на другую страницу
 * приложения блокируется (`blocker.state === 'blocked'` — показать подтверждение,
 * затем `proceed()` или `reset()`), а закрытие вкладки — спрашивает браузер.
 * Смена только query-параметров страницей не считается. Нужен data router (createBrowserRouter).
 *
 * @example
 * const blocker = useUnsavedChangesBlocker(isDirty);
 * <Dialog open={blocker.state === 'blocked'} onConfirm={() => blocker.proceed?.()} />
 */
export const useUnsavedChangesBlocker = (when: boolean) => {
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
    [when],
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!when) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [when]);

  return blocker;
};
