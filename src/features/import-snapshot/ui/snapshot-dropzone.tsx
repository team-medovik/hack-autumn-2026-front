import { Button } from '@/shared/ui/button';
import { Dropzone } from '@/shared/ui/dropzone';
import { Icon } from '@/shared/ui/icon';
import { StateMessage } from '@/shared/ui/state-message';

import { UploadProgress } from './upload-progress';
import type { ImportStep } from '../model/use-import-snapshot';

const ACCEPT = '.json,application/json';

interface SnapshotDropzoneProps {
  state: ImportStep;
  onPick: (file: File) => void;
}

/**
 * Зона загрузки JSON во всех состояниях: ожидание, перетаскивание, загрузка, ошибка.
 * Кнопки внутри без своих обработчиков — клик по ним, как и по любому месту зоны, открывает
 * выбор файла.
 */
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
            action={<Button variant="primary">Выбрать другой файл</Button>}
          />
        );
      default:
        return undefined;
    }
  };

  return (
    <Dropzone
      aria-label="Загрузка снимка"
      accept={ACCEPT}
      invalid={state.step === 'invalid'}
      disabled={state.step === 'uploading'}
      onFile={onPick}
      content={renderContent()}
      dropHint={
        <StateMessage
          variant="roomy"
          icon={<Icon name="upload-32" size={32} />}
          title="Отпустите, чтобы загрузить файл"
        />
      }
    >
      <StateMessage
        variant="roomy"
        icon={<Icon name="upload-32" size={32} />}
        title="Перетащите JSON-файл сюда или выберите на компьютере"
        description="Текущие данные полностью заменятся, риски и потери пересчитаются сами"
        action={<Button variant="primary">Выбрать файл</Button>}
      />
    </Dropzone>
  );
};
