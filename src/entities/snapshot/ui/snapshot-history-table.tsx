import { formatDateTime } from '@/shared/lib/format';
import { Table, TableCell, TableColumnHeader, TableHeader, TableRow } from '@/shared/ui/table';

import { formatSnapshotVolume } from '../lib/format-volume';
import type { SnapshotRecord } from '../model/types';

/** Ширины колонок из макета «Импорт/экспорт снимка»; файл забирает остальное. */
const COLUMN = { when: 180, volume: 220, who: 120 } as const;

interface SnapshotHistoryTableProps {
  snapshots: readonly SnapshotRecord[];
  'aria-labelledby'?: string;
}

/** История загрузок: когда, файл, объём, кто. */
export const SnapshotHistoryTable = ({
  snapshots,
  'aria-labelledby': labelledBy,
}: SnapshotHistoryTableProps) => (
  <Table variant="divided" rowGap="close" aria-labelledby={labelledBy}>
    <TableHeader>
      <TableColumnHeader width={COLUMN.when} label="Когда" />
      <TableColumnHeader grow label="Файл" />
      <TableColumnHeader width={COLUMN.volume} label="Объём" />
      <TableColumnHeader width={COLUMN.who} label="Кто" />
    </TableHeader>

    {snapshots.map((snapshot) => (
      <TableRow key={snapshot.id}>
        <TableCell width={COLUMN.when} tone="secondary">
          {formatDateTime(snapshot.uploadedAt)}
        </TableCell>
        <TableCell grow>{snapshot.fileName}</TableCell>
        <TableCell width={COLUMN.volume} tone="secondary">
          {formatSnapshotVolume(snapshot)}
        </TableCell>
        <TableCell width={COLUMN.who} tone="secondary">
          {snapshot.uploadedBy}
        </TableCell>
      </TableRow>
    ))}
  </Table>
);
