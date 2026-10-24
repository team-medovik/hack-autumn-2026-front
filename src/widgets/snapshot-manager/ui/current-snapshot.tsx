import type { SnapshotRecord } from '@/entities/snapshot';
import { DownloadSnapshotButton } from '@/features/download-snapshot';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

interface CurrentSnapshotProps {
  /** `null` — снимков ещё не загружали. */
  snapshot: SnapshotRecord | null;
}

/** Блок «Текущий снимок»: имя файла, по которому посчитаны риски, и «Скачать JSON». */
export const CurrentSnapshot = ({ snapshot }: CurrentSnapshotProps) => (
  <Card aria-label="Текущий снимок" className="snapshot-manager__current">
    <div className="snapshot-manager__current-text">
      <Text variant="caption-2" color="tertiary">
        Текущий снимок
      </Text>
      {snapshot ? (
        <Text variant="label" color="main" truncate>
          {snapshot.fileName}
        </Text>
      ) : (
        <Text variant="label" color="secondary">
          Ещё не загружали
        </Text>
      )}
    </div>
    {snapshot && <DownloadSnapshotButton snapshot={snapshot} />}
  </Card>
);
