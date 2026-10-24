import type { ClientSortField, SortOrder } from '@/entities/client';
import { TableColumnHeader, TableHeader } from '@/shared/ui/table';

import { CLIENT_COLUMNS } from './columns';
import { getNextSort } from '../model/next-sort';

interface ClientsTableHeaderProps {
  sort: ClientSortField;
  order: SortOrder;
  /** Без клиентов сортировка ни на что не влияет — все колонки показываются невыбранными. */
  showActiveSort: boolean;
  onSortChange: (sort: ClientSortField, order: SortOrder) => void;
}

export const ClientsTableHeader = ({
  sort,
  order,
  showActiveSort,
  onSortChange,
}: ClientsTableHeaderProps) => (
  <TableHeader>
    {CLIENT_COLUMNS.map((column) => {
      const next = getNextSort(column, { sort, order });

      return (
        <TableColumnHeader
          key={column.id}
          label={column.label}
          width={column.width}
          grow={column.width === undefined}
          align={column.align}
          sort={column.sort && (showActiveSort && column.sort === sort ? order : 'none')}
          onSort={next ? () => onSortChange(next.sort, next.order) : undefined}
        />
      );
    })}
  </TableHeader>
);
