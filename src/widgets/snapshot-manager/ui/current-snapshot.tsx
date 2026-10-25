import type { SnapshotRecord } from '@/entities/snapshot';
import { DownloadSnapshotButton } from '@/features/download-snapshot';
import { Card } from '@/shared/ui/card';
import { InfoNote } from '@/shared/ui/info-note';
import { Text } from '@/shared/ui/text';

interface CurrentSnapshotProps {
  /** `null` — снимков ещё не загружали. */
  snapshot: SnapshotRecord | null;
  /**
   * Риски точно считаются по этому снимку, а не по живой симуляции: в JSON нет истории событий,
   * поэтому AI-прогноз недоступен. Источник неизвестен (не администратор) — не утверждаем.
   */
  isActiveSource?: boolean;
}

/**
 * Блок «Текущий снимок» (макет «Импорт/экспорт снимка (снимок без истории)»): имя файла,
 * по которому посчитаны риски, пояснение про AI-прогноз и «Скачать JSON».
 */
export const CurrentSnapshot = ({ snapshot, isActiveSource = false }: CurrentSnapshotProps) => (
  <Card aria-label="Текущий снимок" className="snapshot-manager__current">
    <div className="snapshot-manager__current-text">
      <Text variant="caption-2" color="tertiary">
        Текущий снимок
      </Text>
      {snapshot ? (
        <div className="snapshot-manager__current-name">
          <Text variant="label" color="main" truncate>
            {snapshot.fileName}
          </Text>
          {isActiveSource && (
            <InfoNote>
              В снимке нет истории событий — AI-прогноз недоступен, риск считается алгоритмически
            </InfoNote>
          )}
        </div>
      ) : (
        <Text variant="label" color="secondary">
          Ещё не загружали
        </Text>
      )}
    </div>
    {snapshot && <DownloadSnapshotButton snapshot={snapshot} />}
  </Card>
);
