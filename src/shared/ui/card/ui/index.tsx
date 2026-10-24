import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { InfoTooltip } from '../../info-tooltip';
import { Text } from '../../text';

import './card.scss';

/**
 * Карточка дашборда: фон bg/card, скругление xl, отступ 24. Содержимое — колонкой через 32px.
 * Слой `card` переключает control/* для вложенных контролов (см. [data-layer] в index.css).
 *
 * @example
 * <Card aria-labelledby={titleId}>
 *   <CardHeader titleId={titleId} title="Причины потерь" hint="…" />
 *   …
 * </Card>
 */
export const Card = ({ className, ...props }: ComponentProps<'section'>) => (
  <section data-layer="card" className={clsx('card', className)} {...props} />
);

interface CardHeaderProps {
  title: ReactNode;
  /** id заголовка — чтобы связать с карточкой через `aria-labelledby`. */
  titleId?: string;
  /** Пояснение к иконке «info» рядом с заголовком. */
  hint?: ReactNode;
  /** Подзаголовок Caption 2 под названием. */
  description?: ReactNode;
  /** Слот справа: ссылка «Все клиенты →» или показатель. */
  aside?: ReactNode;
  className?: string;
}

/** Шапка карточки: Label-заголовок с подсказкой, подзаголовок и слот справа. */
export const CardHeader = ({
  title,
  titleId,
  hint,
  description,
  aside,
  className,
}: CardHeaderProps) => (
  <header className={clsx('card-header', className)}>
    <div className="card-header__titles">
      <div className="card-header__title-row">
        <Text as="h2" id={titleId} variant="label" color="main">
          {title}
        </Text>
        {hint && <InfoTooltip>{hint}</InfoTooltip>}
      </div>
      {description && (
        <Text variant="caption-2" color="tertiary">
          {description}
        </Text>
      )}
    </div>
    {aside && <div className="card-header__aside">{aside}</div>}
  </header>
);
