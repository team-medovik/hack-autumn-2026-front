import type { ClientListItem } from '@/entities/client';
import { TableCell, TableRow } from '@/shared/ui/table';

import { CLIENT_COLUMNS } from './columns';

interface ClientTableRowProps {
  client: ClientListItem;
  onOpen: (id: string) => void;
}

export const ClientTableRow = ({ client, onOpen }: ClientTableRowProps) => (
  <TableRow onClick={() => onOpen(client.id)}>
    {CLIENT_COLUMNS.map((column) => (
      <TableCell
        key={column.id}
        width={column.width}
        grow={column.width === undefined}
        align={column.align}
        tone={column.tone}
      >
        {column.cell(client)}
      </TableCell>
    ))}
  </TableRow>
);
