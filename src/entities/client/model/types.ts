import type { RiskLevel } from '@/shared/ui/risk-score';

/**
 * Контракт GET /clients — сводная таблица клиентов по последнему снимку биллинга.
 * Фильтр, поиск, сортировка и пагинация — на сервере. Пока бэкенда нет, отдаётся MSW
 * (src/app/mocks/clients). Суммы — в евро.
 */

/** Поля, по которым сервер умеет сортировать. */
export const CLIENT_SORT_FIELDS = [
  'score',
  'id',
  'email',
  'balance',
  'topUp',
  'monthlyLoss',
] as const;

export type ClientSortField = (typeof CLIENT_SORT_FIELDS)[number];

export type SortOrder = 'asc' | 'desc';

/** Фильтр по уровню риска: конкретный уровень или все. */
export type ClientLevelFilter = RiskLevel | 'all';

/** Параметры списка. Поиск идёт по всем клиентам — с `search` фильтр `level` не применяется. */
export interface ClientsQuery {
  level: ClientLevelFilter;
  /** Подстрока email или ID. Пустая строка — без поиска. */
  search: string;
  sort: ClientSortField;
  order: SortOrder;
  /** Номер страницы, с 1. */
  page: number;
}

/** Строка сводной таблицы. */
export interface ClientListItem {
  id: string;
  email: string;
  /** Score 0–100, `null` — нет оценки. */
  score: number | null;
  level: RiskLevel;
  /** Главная причина риска, человекочитаемо. `null` — причины нет (нет оценки). */
  reason: string | null;
  /** Сейчас на счёте. */
  balance: number;
  /** Пополнено за всё время. */
  topUp: number;
  /** Потеря в месяц, если клиент уйдёт. */
  monthlyLoss: number;
}

export interface ClientsResponse {
  items: ClientListItem[];
  page: number;
  pageSize: number;
  /** Найдено по фильтру или поиску — для пагинации. */
  total: number;
  /**
   * Клиентов в снимке по уровням — для счётчиков фильтров. Не зависят от фильтра и поиска.
   * Все нули — снимков ещё не загружали.
   */
  levelCounts: Record<RiskLevel, number>;
}
