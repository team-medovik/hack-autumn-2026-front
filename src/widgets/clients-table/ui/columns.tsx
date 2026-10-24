import type { ReactNode } from 'react';

import type { ClientListItem, ClientSortField, SortOrder } from '@/entities/client';
import { formatMoney } from '@/shared/lib/format';
import { RiskLevel } from '@/shared/ui/risk-level';
import { RiskScore } from '@/shared/ui/risk-score';

export interface ClientColumn {
  id: string;
  label: string;
  /** Ширина в px из макета. Без неё колонка забирает оставшееся место. */
  width?: number;
  align?: 'left' | 'right';
  /** Цвет текста ячейки, если содержимое — строка. */
  tone?: 'main' | 'secondary';
  /** Поле сортировки. Без него колонка не сортируется. */
  sort?: ClientSortField;
  /** Направление при первом клике: числа — по убыванию, текст — по алфавиту. */
  firstOrder?: SortOrder;
  /** Скелетон строки загрузки — размеры из макета «Сводная таблица (загрузка)». */
  skeleton: { width: number | string; height: number };
  cell: (client: ClientListItem) => ReactNode;
}

/** Колонки сводной таблицы — единый источник для шапки, строк и скелетонов. */
export const CLIENT_COLUMNS: readonly ClientColumn[] = [
  {
    id: 'score',
    label: 'Риски',
    width: 64,
    sort: 'score',
    firstOrder: 'desc',
    skeleton: { width: 52, height: 32 },
    cell: (client) => <RiskScore score={client.score} level={client.level} />,
  },
  {
    id: 'id',
    label: 'ID',
    width: 64,
    tone: 'secondary',
    sort: 'id',
    firstOrder: 'asc',
    skeleton: { width: 56, height: 16 },
    cell: (client) => client.id,
  },
  {
    id: 'email',
    label: 'Email',
    width: 148,
    sort: 'email',
    firstOrder: 'asc',
    skeleton: { width: 140, height: 12 },
    cell: (client) => client.email,
  },
  {
    id: 'level',
    label: 'Уровень',
    width: 96,
    skeleton: { width: 88, height: 12 },
    cell: (client) => <RiskLevel level={client.level} />,
  },
  {
    id: 'reason',
    label: 'Главная причина',
    tone: 'secondary',
    skeleton: { width: 'min(346px, 100%)', height: 12 },
    cell: (client) => client.reason ?? '—',
  },
  {
    id: 'balance',
    label: 'Баланс',
    width: 88,
    align: 'right',
    sort: 'balance',
    firstOrder: 'desc',
    skeleton: { width: 72, height: 16 },
    cell: (client) => formatMoney(client.balance),
  },
  {
    id: 'topUp',
    label: 'Пополнено',
    width: 100,
    align: 'right',
    sort: 'topUp',
    firstOrder: 'desc',
    skeleton: { width: 84, height: 12 },
    cell: (client) => formatMoney(client.topUp),
  },
  {
    id: 'monthlyLoss',
    label: 'Потеря / мес',
    width: 97,
    align: 'right',
    sort: 'monthlyLoss',
    firstOrder: 'desc',
    skeleton: { width: 72, height: 16 },
    cell: (client) => formatMoney(client.monthlyLoss),
  },
];
