import { useRef } from 'react';

import { useUnsavedChangesBlocker } from '@/shared/lib/unsaved-changes';
import { Dialog } from '@/shared/ui/dialog';

interface UnsavedChangesGuardProps {
  /** Есть несохранённые правки. */
  when: boolean;
}

/** Спрашивает перед уходом со страницы с несохранёнными правками. */
export const UnsavedChangesGuard = ({ when }: UnsavedChangesGuardProps) => {
  const blocker = useUnsavedChangesBlocker(when);
  // «Уйти» тоже закрывает диалог — тогда переход нельзя отменять
  const isLeaving = useRef(false);

  return (
    <Dialog
      variant="danger"
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => {
        if (!open && !isLeaving.current) {
          blocker.reset?.();
        }
      }}
      title="Уйти без сохранения?"
      description="Если уйти со страницы, изменения пропадут"
      cancelLabel="Остаться"
      confirmLabel="Уйти"
      onConfirm={() => {
        isLeaving.current = true;
        blocker.proceed?.();
      }}
    />
  );
};
