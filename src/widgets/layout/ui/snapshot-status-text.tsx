import { useSnapshotStatus, type SnapshotStatus } from '@/entities/dashboard';
import { formatTime } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

const getMessage = (status: SnapshotStatus) => {
  switch (status.kind) {
    case 'loading':
      return 'Загружаем данные…';
    case 'unavailable':
      return 'Нет связи с сервером';
    case 'empty':
      return 'Данных пока нет';
    case 'actual':
      return `Данные актуальны на ${formatTime(status.takenAt)}`;
    case 'stale':
      return `Нет связи с сервером. Данные на ${formatTime(status.takenAt)}, переподключаемся…`;
  }
};

const isProblem = (status: SnapshotStatus) =>
  status.kind === 'unavailable' || status.kind === 'stale';

/** Подпись под названием панели: насколько свежие данные на экране. */
export const SnapshotStatusText = () => {
  const status = useSnapshotStatus();

  return (
    <Text variant="body" color={isProblem(status) ? 'danger' : 'main'} role="status">
      {getMessage(status)}
    </Text>
  );
};
