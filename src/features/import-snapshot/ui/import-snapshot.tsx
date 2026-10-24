import { ReplaceSnapshotDialog, SnapshotImportedDialog } from './import-dialogs';
import { SnapshotDropzone } from './snapshot-dropzone';
import { useImportSnapshot } from '../model/use-import-snapshot';

import './import-snapshot.scss';

interface ImportSnapshotProps {
  /** Имя текущего снимка. `null` — снимков ещё нет, первый грузится без подтверждения. */
  currentFileName: string | null;
}

/** Импорт снимка: зона загрузки, подтверждение замены и итог. */
export const ImportSnapshot = ({ currentFileName }: ImportSnapshotProps) => {
  const { state, pick, confirm, cancel, finish } = useImportSnapshot({
    hasCurrent: currentFileName !== null,
  });

  return (
    <>
      <SnapshotDropzone state={state} onPick={pick} />
      <ReplaceSnapshotDialog
        summary={state.step === 'confirm' ? state.summary : null}
        currentFileName={currentFileName ?? ''}
        onConfirm={confirm}
        onCancel={cancel}
      />
      <SnapshotImportedDialog
        snapshot={state.step === 'done' ? state.snapshot : null}
        onClose={finish}
      />
    </>
  );
};
