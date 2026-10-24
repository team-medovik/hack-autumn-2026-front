import { clsx } from 'clsx';

import { formatNumber } from '@/shared/lib/format';

import { Button } from '../../button';
import { Text } from '../../text';
import { getPages } from '../lib/get-pages';

import './pagination.scss';

interface PaginationProps {
  /** Текущая страница, с 1. */
  page: number;
  pageSize: number;
  /** Всего записей — для подписи «1–12 из 42» и числа страниц. */
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Пагинация под таблицей: диапазон записей слева, страницы справа.
 * Страницы — Вторичные кнопки, текущая в состоянии «Активное».
 *
 * @example
 * <Pagination page={1} pageSize={12} total={42} onPageChange={setPage} />
 */
export const Pagination = ({ page, pageSize, total, onPageChange, className }: PaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={clsx('pagination', className)}>
      <Text variant="caption" color="secondary" className="pagination__range">
        {formatNumber(from)}–{formatNumber(to)} из {formatNumber(total)}
      </Text>

      <nav aria-label="Страницы" className="pagination__pages">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Назад
        </Button>

        {getPages(page, pageCount).map((slot, index) =>
          slot === 'ellipsis' ? (
            // Позиция многоточия стабильна: слева или справа от соседей текущей
            <Text key={`ellipsis-${index}`} as="span" color="secondary" className="pagination__gap">
              …
            </Text>
          ) : (
            <Button
              key={slot}
              variant="secondary"
              active={slot === page}
              aria-current={slot === page ? 'page' : undefined}
              aria-label={`Страница ${slot}`}
              onClick={() => onPageChange(slot)}
            >
              {slot}
            </Button>
          ),
        )}

        <Button
          variant="secondary"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Дальше
        </Button>
      </nav>
    </div>
  );
};
