import type { RiskLevel } from '@/shared/ui/risk-score';

/**
 * Контракт GET /dashboard — сводка по последнему снимку биллинга.
 * Пока бэкенда нет, отдаётся MSW (src/app/mocks/dashboard). Суммы — в евро, даты — ISO 8601.
 */

/** Снимок данных из биллинга, по которому посчитана сводка. */
export interface SnapshotInfo {
  id: string;
  takenAt: string;
}

/** Клиенты и потери одного уровня риска. */
export interface RiskBucket {
  level: RiskLevel;
  clients: number;
  /** Потеря в месяц. `null` — не считается (уровень «нет оценки»). */
  monthlyLoss: number | null;
  /** Сумма изменилась с прошлого снимка — подсвечивается. */
  changed: boolean;
}

/** Клиент в очереди риска. */
export interface RiskClient {
  id: string;
  email: string;
  /** Score 0–100, `null` — нет оценки. */
  score: number | null;
  level: RiskLevel;
  /** Главная причина риска, человекочитаемо. */
  reason: string;
  monthlyLoss: number;
  /** Потеря изменилась с прошлого снимка — подсвечивается. */
  lossChanged: boolean;
}

/** Вклад фактора в score клиента: «Ожидает оплаты, удалят завтра» +70. */
export interface ScoreFactor {
  id: string;
  label: string;
  /** Баллы score, 0–100. */
  points: number;
}

export interface ClientBalance {
  /** Сейчас на счёте. */
  available: number;
  /** Нужно на продления в ближайшие дни. */
  required: number;
}

/** Клиент с наибольшим риском — с разбором score и балансом. */
export interface TopRiskClient extends RiskClient {
  factors: ScoreFactor[];
  balance: ClientBalance;
}

export interface RiskQueue {
  /** Всего клиентов в базе — для ссылки «Все клиенты». */
  total: number;
  /** Первые клиенты по убыванию риска. */
  items: RiskClient[];
}

/** Потери по главной причине клиентов. */
export interface LossReason {
  id: string;
  label: string;
  /** Уровень риска клиентов с этой причиной — задаёт цвет шкалы. */
  level: RiskLevel;
  clients: number;
  monthlyLoss: number;
}

export type ChurnWeekKind = 'fact' | 'forecast';

/** Неделя графика оттока: факт удалений или прогноз непродлений. */
export interface ChurnWeek {
  /** Понедельник недели, дата без времени: «2026-08-31». */
  weekStart: string;
  kind: ChurnWeekKind;
  services: number;
}

export interface ChurnForecast {
  /** Услуг под риском прямо сейчас. */
  atRiskServices: number;
  /** Недели по возрастанию даты. Пусто — снимок один, считать отток не по чему. */
  weeks: ChurnWeek[];
}

export interface DashboardData {
  snapshot: SnapshotInfo;
  /** Сколько потеряем в месяц, если ничего не делать. */
  monthlyLoss: number;
  /** Ровно по одному бакету на уровень риска. */
  riskBuckets: RiskBucket[];
  /** `null` — ни у кого нет риска. */
  topRisk: TopRiskClient | null;
  riskQueue: RiskQueue;
  lossReasons: LossReason[];
  churn: ChurnForecast;
}

/** Снимков ещё не загружали — считать нечего. */
export interface DashboardWithoutSnapshot {
  snapshot: null;
}

export type DashboardResponse = DashboardData | DashboardWithoutSnapshot;
