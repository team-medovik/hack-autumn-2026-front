import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './info-note.scss';

interface InfoNoteProps {
  children: ReactNode;
  className?: string;
}

/**
 * Пояснение со значком «info» 16px, Caption text/secondary (слой «Без истории» в Figma).
 *
 * @example
 * <InfoNote>В снимке нет истории событий — AI-прогноз недоступен</InfoNote>
 */
export const InfoNote = ({ children, className }: InfoNoteProps) => (
  <p className={clsx('info-note', className)}>
    <Icon name="info-16" size={16} className="info-note__icon" />
    <Text as="span" variant="caption" color="secondary">
      {children}
    </Text>
  </p>
);
