import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { RiskScore, type RiskLevel } from '../../risk-score';
import { Text } from '../../text';

import './client-row.scss';

interface ClientRowProps extends Omit<ComponentProps<'button'>, 'children'> {
  score: number | null;
  level: RiskLevel;
  email: ReactNode;
  /** Подпись под email, например «ID 1321245». */
  clientId: ReactNode;
  /** Главная причина риска. */
  reason: ReactNode;
  /** Потеря в месяц, например «9,05 €». */
  loss: ReactNode;
  /** Подсветить сумму потери (слой «Подсветка» в Figma). */
  highlightLoss?: boolean;
  /** Выбранная строка (Выбрана=Да). */
  selected?: boolean;
}

/**
 * Строка клиента в списке: риск, клиент, причина, потеря в месяц.
 *
 * @example
 * <ClientRow
 *   score={100}
 *   level="high"
 *   email="client17@mail.ru"
 *   clientId="ID 1321245"
 *   reason="Ожидает оплаты, удалят 21.10"
 *   loss="9,05 €"
 *   selected={selectedId === 1321245}
 *   onClick={() => select(1321245)}
 * />
 */
export const ClientRow = ({
  score,
  level,
  email,
  clientId,
  reason,
  loss,
  highlightLoss = false,
  selected = false,
  type = 'button',
  className,
  ...props
}: ClientRowProps) => (
  <button
    type={type}
    aria-pressed={selected}
    className={clsx('client-row', { 'client-row--selected': selected }, className)}
    {...props}
  >
    <RiskScore score={score} level={level} />

    <span className="client-row__client">
      <Text as="span" variant="caption" color="main" truncate>
        {email}
      </Text>
      <Text as="span" variant="caption-2" color="tertiary" truncate>
        {clientId}
      </Text>
    </span>

    <Text as="span" variant="caption-2" color="secondary" truncate className="client-row__reason">
      {reason}
    </Text>

    <span className="client-row__loss">
      <Text
        as="span"
        variant="caption"
        color="main"
        className={clsx('client-row__amount', { 'client-row__amount--highlight': highlightLoss })}
      >
        {loss}
      </Text>
      <Text as="span" variant="caption-2" color="tertiary">
        в месяц
      </Text>
    </span>
  </button>
);
