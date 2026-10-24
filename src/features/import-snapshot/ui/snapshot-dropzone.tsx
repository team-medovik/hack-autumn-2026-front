import { Dropzone } from '@/shared/ui/dropzone';
import { FilePickerButton } from '@/shared/ui/file-picker-button';
import { Icon } from '@/shared/ui/icon';
import { StateMessage } from '@/shared/ui/state-message';

import { UploadProgress } from './upload-progress';
import type { ImportStep } from '../model/use-import-snapshot';

const ACCEPT = '.json,application/json';

interface SnapshotDropzoneProps {
  state: ImportStep;
  onPick: (file: File) => void;
}

/** Зона загрузки JSON во всех состояниях: ожидание, перетаскивание, загрузка, ошибка. */
export const SnapshotDropzone = ({ state, onPick }: SnapshotDropzoneProps) => {
  const renderContent = () => {
    switch (state.step) {
      case 'uploading':
        return <UploadProgress fileName={state.fileName} progress={state.progress} />;
      case 'invalid':
        return (
          <StateMessage
            variant="roomy"
            role="alert"
            icon={<Icon name="info-32" size={32} />}
            title="Файл не загружен"
            description={state.message}
            action={
              <FilePickerButton variant="primary" accept={ACCEPT} onPick={onPick}>
                Выбрать другой файл
              </FilePickerButton>
            }
          />
        );
      default:
        return (
          <StateMessage
            variant="roomy"
            icon={<Icon name="upload-32" size={32} />}
            title="Перетащите JSON-файл сюда или выберите на компьютере"
            description="Текущие данные полностью заменятся, риски и потери пересчитаются сами"
            action={
              <FilePickerButton variant="primary" accept={ACCEPT} onPick={onPick}>
                Выбрать файл
              </FilePickerButton>
            }
          />
        );
    }
  };

  return (
    <Dropzone
      aria-label="Загрузка снимка"
      invalid={state.step === 'invalid'}
      disabled={state.step === 'uploading'}
      onDrop={onPick}
      dropHint={
        <StateMessage
          variant="roomy"
          icon={<Icon name="upload-32" size={32} />}
          title="Отпустите, чтобы загрузить файл"
        />
      }
    >
      {renderContent()}
    </Dropzone>
  );
};
