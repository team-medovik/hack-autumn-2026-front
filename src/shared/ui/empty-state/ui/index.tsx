import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './empty-state.scss';

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

/**
 * Пустое состояние внутри карточки (слой «Пусто» в Figma): по центру оставшегося места.
 *
 * @example
 * <EmptyState title="Очередь пуста" description="Все клиенты с низким риском и без ожидаемых потерь" />
 */
export const EmptyState = ({ title, description, className }: EmptyStateProps) => (
  <div className={clsx('empty-state', className)}>
    <Text variant="body" color="secondary">
      {title}
    </Text>
    {description && (
      <Text variant="caption-2" color="tertiary" className="empty-state__description">
        {description}
      </Text>
    )}
  </div>
);
