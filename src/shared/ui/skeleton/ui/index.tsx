import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import './skeleton.scss';

type Size = number | string;

const toCss = (value: Size | undefined) => (typeof value === 'number' ? `${value}px` : value);

interface SkeletonProps {
  /** Ширина: число — px, строка — любое CSS-значение. По умолчанию 100%. */
  width?: Size;
  /** Высота: число — px, строка — любое CSS-значение. По умолчанию 16px. */
  height?: Size;
  className?: string;
}

/**
 * Плейсхолдер загрузки (слой «Скелетон» в Figma): плашка control/default с пульсацией.
 * Декоративный — состояние загрузки объявляет контейнер (`aria-busy`).
 *
 * @example
 * <Skeleton width={151} height={44} />
 */
export const Skeleton = ({ width, height, className }: SkeletonProps) => (
  <span
    className={clsx('skeleton', className)}
    style={
      { '--skeleton-width': toCss(width), '--skeleton-height': toCss(height) } as CSSProperties
    }
    aria-hidden
  />
);

interface SkeletonTextProps {
  /** Количество строк. В макетах карточек — 5. */
  lines?: number;
  className?: string;
}

/**
 * Блок строк-скелетонов вместо содержимого карточки.
 *
 * @example
 * <SkeletonText />
 */
export const SkeletonText = ({ lines = 5, className }: SkeletonTextProps) => (
  <span className={clsx('skeleton-text', className)} aria-hidden>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} height={12} className="skeleton-text__line" />
    ))}
  </span>
);
