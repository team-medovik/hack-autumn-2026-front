import { useId } from 'react';

import { SnapshotHistoryTable, type SnapshotRecord } from '@/entities/snapshot';
import { Card, CardHeader } from '@/shared/ui/card';

interface SnapshotHistoryProps {
  snapshots: readonly SnapshotRecord[];
}

/** Блок «История загрузок». */
export const SnapshotHistory = ({ snapshots }: SnapshotHistoryProps) => {
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId} className="snapshot-manager__history">
      <CardHeader titleId={titleId} title="История загрузок" />
      <SnapshotHistoryTable aria-labelledby={titleId} snapshots={snapshots} />
    </Card>
  );
};
