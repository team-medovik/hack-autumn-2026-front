import { Skeleton } from '@/shared/ui/skeleton';
import { TableCell, TableRow } from '@/shared/ui/table';

import { CLIENT_COLUMNS } from './columns';

/** Строка-скелетон (Строка скелетон в Figma): плашки по колонкам. */
export const ClientTableSkeletonRow = () => (
  <TableRow aria-hidden>
    {CLIENT_COLUMNS.map((column) => (
      <TableCell
        key={column.id}
        width={column.width}
        grow={column.width === undefined}
        align={column.align}
      >
        <Skeleton width={column.skeleton.width} height={column.skeleton.height} />
      </TableCell>
    ))}
  </TableRow>
);
