import { ReplaceSnapshotDialog, SnapshotImportedDialog } from './import-dialogs';
import { SnapshotDropzone } from './snapshot-dropzone';
import { useImportSnapshot } from '../model/use-import-snapshot';

import './import-snapshot.scss';

interface ImportSnapshotProps {
  /** Имя текущего снимка. `null` — снимков ещё нет, первый грузится без подтверждения. */
  currentFileName: string | null;
  /** Риски считаются по живой симуляции: загрузка её остановит — так и предупреждаем. */
  stopsSimulation?: boolean;
}

/** Импорт снимка: зона загрузки, подтверждение замены и итог. */
export const ImportSnapshot = ({
  currentFileName,
  stopsSimulation = false,
}: ImportSnapshotProps) => {
  const { state, pick, confirm, cancel, finish } = useImportSnapshot({
    hasCurrent: currentFileName !== null || stopsSimulation,
  });

  return (
    <>
      <SnapshotDropzone state={state} onPick={pick} stopsSimulation={stopsSimulation} />
      <ReplaceSnapshotDialog
        summary={state.step === 'confirm' ? state.summary : null}
        currentFileName={currentFileName ?? ''}
        stopsSimulation={stopsSimulation}
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
