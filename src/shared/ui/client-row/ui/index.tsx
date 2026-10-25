import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { RiskScore, type RiskLevel } from '../../risk-score';
import { Text } from '../../text';

import './client-row.scss';

type ClientRowOwnProps<T extends ElementType> = {
  /** Корневой элемент: по умолчанию `button`, для навигации — `Link` из react-router. */
  as?: T;
  score: number | null;
  level: RiskLevel;
  email: ReactNode;
  /** Подпись под email, например «ID 1321245». */
  clientId: ReactNode;
  /** Главная причина риска. */
  reason: ReactNode;
  /** Потеря в месяц, например «9,05 €». */
  loss: ReactNode;
  /** Выбранная строка (Выбрана=Да). */
  selected?: boolean;
};

type ClientRowProps<T extends ElementType> = ClientRowOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ClientRowOwnProps<T> | 'children'>;

/**
 * Строка клиента в списке: риск, клиент, причина, потеря в месяц.
 *
 * @example
 * <ClientRow
 *   as={Link}
 *   to={ROUTES.client(client.id)}
 *   score={100}
 *   level="high"
 *   email="client17@mail.ru"
 *   clientId="ID 1321245"
 *   reason="Ожидает оплаты, удалят 21.10"
 *   loss="9,05 €"
 * />
 */
export const ClientRow = <T extends ElementType = 'button'>({
  as,
  score,
  level,
  email,
  clientId,
  reason,
  loss,
  selected = false,
  className,
  ...props
}: ClientRowProps<T>) => {
  const Component: ElementType = as ?? 'button';
  const isButton = Component === 'button';

  return (
    <Component
      type={isButton ? 'button' : undefined}
      aria-pressed={isButton ? selected : undefined}
      aria-current={!isButton && selected ? 'true' : undefined}
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
        <Text as="span" variant="caption" color="main">
          {loss}
        </Text>
        <Text as="span" variant="caption-2" color="tertiary">
          в месяц
        </Text>
      </span>
    </Component>
  );
};
