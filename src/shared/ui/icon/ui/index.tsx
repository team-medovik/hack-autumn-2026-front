import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ICONS, type IconName } from './icons';

import './icon.scss';

export type IconSize = 16 | 20 | 24;

interface IconProps {
  name: IconName;
  /** Размер в px. Должен совпадать с нативным размером SVG (см. ICONS), иначе толщина линий исказится. */
  size?: IconSize;
  /** Подпись для скринридера. Без неё иконка декоративная (aria-hidden). */
  label?: string;
  className?: string;
}

/**
 * Иконка из дизайн-системы.
 * SVG подключается как CSS-маска, поэтому цвет берётся из `currentColor` родителя.
 * `loading` крутится автоматически.
 *
 * @example
 * <Icon name="trash" />
 * <Icon name="info" label="Подробнее" />
 * <Icon name="sort-asc" size={16} />
 */
export const Icon = ({ name, size = 24, label, className }: IconProps) => (
  <span
    className={clsx('icon', { 'icon--spin': name === 'loading' }, className)}
    style={{ '--icon-src': `url("${ICONS[name]}")`, '--icon-size': `${size}px` } as CSSProperties}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  />
);
