import { formatTime } from '@/shared/lib/format';
import { Dialog } from '@/shared/ui/dialog';

import type { SettingsConflict } from '../model/use-model-settings-editor';

interface ConflictDialogProps {
  conflict: SettingsConflict | null;
  onLoadLatest: () => void;
  onOverwrite: () => void;
  /** Закрыли без выбора — правки остаются, следующее сохранение снова спросит. */
  onDismiss: () => void;
}

/** Пока админ редактировал, настройки сохранил кто-то другой: взять чужую версию или свою поверх. */
export const ConflictDialog = ({
  conflict,
  onLoadLatest,
  onOverwrite,
  onDismiss,
}: ConflictDialogProps) => (
  <Dialog
    open={conflict !== null}
    onOpenChange={(open) => !open && onDismiss()}
    title="Настройки уже изменили"
    description={
      conflict &&
      `${conflict.latest.updatedBy} сохранил версию ${conflict.latest.version} в ${formatTime(conflict.latest.updatedAt)}, пока вы редактировали. Загрузите новую версию — ваши правки пропадут — или сохраните свою поверх.`
    }
    cancelLabel="Сохранить поверх"
    onCancel={onOverwrite}
    confirmLabel="Загрузить новую"
    onConfirm={onLoadLatest}
  />
);
