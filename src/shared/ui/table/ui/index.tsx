import { clsx } from 'clsx';
import type { ComponentProps, CSSProperties, KeyboardEvent, ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './table.scss';

/** Направление сортировки колонки. `none` — колонка сортируемая, но сейчас не выбрана. */
export type SortDirection = 'none' | 'asc' | 'desc';

type Align = 'left' | 'right';

/**
 * plain — строки-плашки 56px с подсветкой (таблица клиентов);
 * divided — строки по содержимому через линию-разделитель, без отступов по краям
 * (пользователи, история загрузок).
 */
export type TableVariant = 'plain' | 'divided';

/** Для divided: none — строки вплотную, шапка через 12px; close — шапка и строки через 16px. */
export type TableRowGap = 'none' | 'close';

interface TableProps extends ComponentProps<'div'> {
  variant?: TableVariant;
  rowGap?: TableRowGap;
}

/**
 * Таблица на div + ARIA-ролях: строки — скруглённые плашки с hover, что неудобно делать на <tr>.
 * Подсветка строк — control/default, поэтому таблицу кладут в карточку (слой `card`).
 * Ширины колонок задаются одинаково в TableHeader и TableRow через `width` / `grow` у ячеек.
 *
 * @example
 * <Table aria-label="Клиенты">
 *   <TableHeader>
 *     <TableColumnHeader width={64} label="Риск" sort="desc" onSort={…} />
 *     <TableColumnHeader width={148} label="Email" sort="none" onSort={…} />
 *     <TableColumnHeader grow label="Главная причина" />
 *     <TableColumnHeader width={88} align="right" label="Баланс" sort="none" onSort={…} />
 *   </TableHeader>
 *   {clients.map((c) => (
 *     <TableRow key={c.id} onClick={() => open(c.id)}>
 *       <TableCell width={64}><RiskScore score={c.score} level={c.level} /></TableCell>
 *       <TableCell width={148}>{c.email}</TableCell>
 *       <TableCell grow tone="secondary">{c.reason}</TableCell>
 *       <TableCell width={88} align="right">{c.balance}</TableCell>
 *     </TableRow>
 *   ))}
 * </Table>
 */
export const Table = ({ variant = 'plain', rowGap = 'none', className, ...props }: TableProps) => (
  <div
    role="table"
    className={clsx('table', `table--${variant}`, `table--gap-${rowGap}`, className)}
    {...props}
  />
);

/** Таблица / шапка: строка 40px с заголовками колонок и разделителем снизу. */
export const TableHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div role="row" className={clsx('table__row', 'table__row--header', className)} {...props} />
);

interface TableRowProps extends ComponentProps<'div'> {
  /** Принудительно подсвеченная строка (как «Наведение» в Figma), например выбранная. */
  selected?: boolean;
}

/**
 * Таблица / строка: 56px. С `onClick` строка кликабельна: подсвечивается при наведении
 * и доступна с клавиатуры (Enter / пробел).
 */
export const TableRow = ({
  selected = false,
  onClick,
  onKeyDown,
  className,
  ...props
}: TableRowProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <div
      role="row"
      tabIndex={onClick ? 0 : undefined}
      aria-selected={selected || undefined}
      className={clsx(
        'table__row',
        'table__row--body',
        { 'table__row--interactive': onClick, 'table__row--selected': selected },
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};

interface TableMessageRowProps {
  /** Содержимое по центру — обычно `<StateMessage>`. */
  children: ReactNode;
  className?: string;
}

/**
 * Строка-сообщение вместо данных: «ничего не нашлось», ошибка, пустая таблица.
 * Занимает всю ширину, отступ 96px сверху и снизу (слой «Сообщение» в Figma).
 */
export const TableMessageRow = ({ children, className }: TableMessageRowProps) => (
  <div role="row" className={clsx('table__message', className)}>
    <div role="cell" className="table__message-cell">
      {children}
    </div>
  </div>
);

interface CellLayoutProps {
  /** Фиксированная ширина колонки в px (в Figma: 64, 64, 148, 96, 88, 100, 97). */
  width?: number;
  /** Колонка забирает оставшееся место (как «Главная причина»). */
  grow?: boolean;
  align?: Align;
}

const cellLayout = ({ width, grow, align = 'left' }: CellLayoutProps) => ({
  className: clsx('table__cell', `table__cell--${align}`, { 'table__cell--grow': grow }),
  style: width === undefined ? undefined : ({ '--cell-width': `${width}px` } as CSSProperties),
});

interface TableCellProps extends CellLayoutProps {
  /** Цвет текста: main — основные данные, secondary — ID и причина. */
  tone?: 'main' | 'secondary';
  children?: ReactNode;
  className?: string;
}

/** Ячейка строки. Строковое содержимое — Caption, обрезается многоточием. */
export const TableCell = ({ tone = 'main', children, className, ...layout }: TableCellProps) => {
  const { className: layoutClassName, style } = cellLayout(layout);

  return (
    <div role="cell" className={clsx(layoutClassName, className)} style={style}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text as="span" variant="caption" color={tone} truncate className="table__text">
          {children}
        </Text>
      ) : (
        children
      )}
    </div>
  );
};

interface TableColumnHeaderProps extends CellLayoutProps {
  label: ReactNode;
  /** Без `sort` колонка не сортируется (Сортировка=Выкл). */
  sort?: SortDirection;
  onSort?: () => void;
  className?: string;
}

const ARIA_SORT = { none: 'none', asc: 'ascending', desc: 'descending' } as const;
const SORT_ICON = { none: 'sort', asc: 'sort-asc', desc: 'sort-desc' } as const;

/**
 * Таблица / заголовок колонки. Активная сортировка — подпись ярче и стрелка;
 * при выравнивании вправо иконка стоит перед подписью.
 */
export const TableColumnHeader = ({
  label,
  sort,
  onSort,
  className,
  ...layout
}: TableColumnHeaderProps) => {
  const { className: layoutClassName, style } = cellLayout(layout);
  const isActive = sort === 'asc' || sort === 'desc';

  const content = (
    <>
      <Text as="span" variant="caption-2" color={isActive ? 'secondary' : 'tertiary'}>
        {label}
      </Text>
      {sort && <Icon name={SORT_ICON[sort]} size={16} className="table__sort-icon" />}
    </>
  );

  return (
    <div
      role="columnheader"
      aria-sort={sort ? ARIA_SORT[sort] : undefined}
      className={clsx(layoutClassName, className)}
      style={style}
    >
      {sort ? (
        <button
          type="button"
          className={clsx('table__sort', { 'table__sort--active': isActive })}
          onClick={onSort}
        >
          {content}
        </button>
      ) : (
        <span className="table__sort">{content}</span>
      )}
    </div>
  );
};
