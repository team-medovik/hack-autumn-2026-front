import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './update-badge.scss';

interface UpdateBadgeProps {
  /** updated — «Последнее обновление …», saved — «Сохранено, пересчёт выполнен». */
  status: 'updated' | 'saved';
  /** Когда и кем обновлено, например «23.10.2026, 18:00, analyst». Показывается в updated. */
  updatedAt?: ReactNode;
  className?: string;
}

/**
 * Плашка обновления данных. Состояния из Figma: Обновлено, Сохранено.
 *
 * @example
 * <UpdateBadge status="updated" updatedAt="23.10.2026, 18:00, analyst" />
 * <UpdateBadge status="saved" />
 */
export const UpdateBadge = ({ status, updatedAt, className }: UpdateBadgeProps) => (
  <div className={clsx('update-badge', `update-badge--${status}`, className)} role="status">
    {status === 'updated' ? (
      <>
        <Icon name="refresh-20" size={20} className="update-badge__icon" />
        <Text as="span" variant="caption" color="secondary">
          Последнее обновление
        </Text>
        {updatedAt && (
          <Text as="span" variant="caption" color="main">
            {updatedAt}
          </Text>
        )}
      </>
    ) : (
      <>
        <Icon name="check-20" size={20} className="update-badge__icon" />
        <Text as="span" variant="caption" color="success">
          Сохранено, пересчёт выполнен
        </Text>
      </>
    )}
  </div>
);
