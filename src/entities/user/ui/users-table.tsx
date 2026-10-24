import type { ReactNode } from 'react';

import { formatDate } from '@/shared/lib/format';
import {
  Table,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRow,
  TableScroll,
} from '@/shared/ui/table';

import { isSameLogin, USER_ROLE_LABEL } from '../lib/user-rules';
import type { User } from '../model/types';

import './users-table.scss';

/** Ширины колонок из макета «Настройки — пользователи»; логин забирает остальное. */
const COLUMN = { role: 150, created: 190, actions: 56 } as const;

/** Колонки + промежутки + место под логин: уже — прокрутка вбок. */
const MIN_WIDTH = 560;

interface UsersTableProps {
  users: readonly User[];
  /** Логин вошедшего — его строка помечается «(вы)». */
  currentLogin?: string;
  /** Действие в конце строки, например кнопка удаления. Пусто — ячейка остаётся под выравнивание. */
  renderActions?: (user: User) => ReactNode;
  'aria-labelledby'?: string;
}

/** Список учёток: логин, роль (и отключена ли), когда создан, действие. Строки — через разделители. */
export const UsersTable = ({
  users,
  currentLogin,
  renderActions,
  'aria-labelledby': labelledBy,
}: UsersTableProps) => (
  <TableScroll minWidth={MIN_WIDTH}>
    <Table variant="divided" aria-labelledby={labelledBy}>
      <TableHeader>
        <TableColumnHeader grow label="Логин" />
        <TableColumnHeader width={COLUMN.role} label="Роль" />
        <TableColumnHeader width={COLUMN.created} label="Создан" />
        <TableColumnHeader
          width={COLUMN.actions}
          label={<span className="visually-hidden">Действия</span>}
        />
      </TableHeader>

      {users.map((user) => {
        const isCurrent = currentLogin !== undefined && isSameLogin(user.login, currentLogin);

        return (
          <TableRow key={user.id}>
            <TableCell grow>{isCurrent ? `${user.login} (вы)` : user.login}</TableCell>
            <TableCell width={COLUMN.role} tone="secondary">
              {user.status === 'DISABLED'
                ? `${USER_ROLE_LABEL[user.role]}, отключён`
                : USER_ROLE_LABEL[user.role]}
            </TableCell>
            <TableCell width={COLUMN.created}>{formatDate(user.createdAt)}</TableCell>
            <TableCell width={COLUMN.actions} className="users-table__actions">
              {renderActions?.(user)}
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  </TableScroll>
);
