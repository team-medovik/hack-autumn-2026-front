import { Skeleton } from '@/shared/ui/skeleton';

/** Строк под заголовком в каждой колонке — по макету «Карточка клиента (загрузка)». */
const LINES = 6;

const ColumnSkeleton = () => (
  <div className="client-card__column client-card__column--loading">
    <Skeleton height={20} />
    {Array.from({ length: LINES }, (_, index) => (
      <Skeleton key={index} height={12} className="client-card__skeleton-line" />
    ))}
  </div>
);

/** Две колонки скелетонов вместо содержимого карточки. */
export const ClientCardSkeleton = () => (
  <div className="client-card__content" aria-hidden>
    <ColumnSkeleton />
    <ColumnSkeleton />
  </div>
);
