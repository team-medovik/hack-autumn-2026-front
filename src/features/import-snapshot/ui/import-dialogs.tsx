import {
  formatSnapshotVolume,
  type SnapshotFileSummary,
  type SnapshotRecord,
} from '@/entities/snapshot';
import { Dialog } from '@/shared/ui/dialog';

interface ReplaceSnapshotDialogProps {
  /** Что в новом файле. `null` — диалог закрыт. */
  summary: SnapshotFileSummary | null;
  currentFileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Макет «… (подтверждение)»: что в новом файле и что он заменит. */
export const ReplaceSnapshotDialog = ({
  summary,
  currentFileName,
  onConfirm,
  onCancel,
}: ReplaceSnapshotDialogProps) => (
  <Dialog
    open={summary !== null}
    onOpenChange={(open) => !open && onCancel()}
    title="Заменить данные?"
    description={
      summary &&
      `Файл ${summary.fileName}: ${formatSnapshotVolume(summary)}. Текущий снимок ${currentFileName} заменится полностью, риски и потери пересчитаются.`
    }
    confirmLabel="Заменить"
    onConfirm={onConfirm}
  />
);

interface SnapshotImportedDialogProps {
  /** Загруженный снимок. `null` — диалог закрыт. */
  snapshot: SnapshotRecord | null;
  onClose: () => void;
}

/** Макет «… (загружено)»: итог загрузки. */
export const SnapshotImportedDialog = ({ snapshot, onClose }: SnapshotImportedDialogProps) => (
  <Dialog
    variant="info"
    open={snapshot !== null}
    onOpenChange={(open) => !open && onClose()}
    title="Снимок загружен"
    description={
      snapshot &&
      `${snapshot.fileName}: ${formatSnapshotVolume(snapshot)}. Риски и потери пересчитаны.`
    }
    onConfirm={onClose}
  />
);
