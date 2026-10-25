import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './status-label.scss';

/** Цвет маркера: работает, пауза, ошибка, завершено или неизвестно. */
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusLabelProps {
  tone: StatusTone;
  /** Подпись — цвет всегда вместе с текстом, одним цветом состояние не передаём. */
  children: ReactNode;
  /** s — Caption text/secondary («Симуляция · работает»), l — Label text/main («Живая симуляция»). */
  size?: 's' | 'l';
  className?: string;
}

/**
 * Состояние: цветной маркер 8px и подпись (слой «Статус симуляции» в Figma).
 *
 * @example
 * <StatusLabel tone="success">Симуляция · работает</StatusLabel>
 * <StatusLabel tone="success" size="l">Живая симуляция</StatusLabel>
 */
export const StatusLabel = ({ tone, children, size = 's', className }: StatusLabelProps) => (
  <span className={clsx('status-label', `status-label--${tone}`, className)}>
    <span className="status-label__marker" aria-hidden />
    <Text
      as="span"
      variant={size === 'l' ? 'label' : 'caption'}
      color={size === 'l' ? 'main' : 'secondary'}
    >
      {children}
    </Text>
  </span>
);
