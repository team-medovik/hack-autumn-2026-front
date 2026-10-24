import { Icon } from '@/shared/ui/icon';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

interface UploadProgressProps {
  fileName: string;
  /** 0–100 */
  progress: number;
}

/** Макет «… (загрузка)»: спиннер, имя файла, шкала 360px и что происходит. */
export const UploadProgress = ({ fileName, progress }: UploadProgressProps) => (
  <div className="upload-progress" role="status">
    <Icon name="loading" />
    <Text variant="label" color="main" align="center">
      Загружаем {fileName}
    </Text>
    <ProgressBar
      tone="accent"
      value={Math.round(progress)}
      aria-label={`Загрузка ${fileName}`}
      className="upload-progress__bar"
    />
    <Text variant="caption" color="secondary" align="center">
      Проверяем структуру и пересчитываем оценки
    </Text>
  </div>
);
