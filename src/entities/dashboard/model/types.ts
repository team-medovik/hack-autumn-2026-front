/**
 * Сводка GET /analytics/summary по последнему снимку биллинга. DTO — из openapi/openapi.yaml
 * (src/shared/api/generated). В dev отдаётся MSW (src/app/mocks/dashboard). Суммы — в евро,
 * даты — ISO 8601.
 *
 * Снимков ещё не загружали — `snapshot: null`, остальные поля — пустое состояние.
 * Потери — экспертная оценка по тарифам, score и доступным средствам, а не прогноз с доказанной
 * вероятностью. Факт оттока (`kind: fact`) — только изменения между сохранёнными снимками.
 */
export type {
  ChurnForecast,
  ChurnWeek,
  ChurnWeekKind,
  ClientBalance,
  DashboardResponse,
  LossReason,
  RiskBucket,
  RiskClient,
  RiskQueue,
  ScoreFactor,
  SnapshotInfo,
  TopRiskClient,
} from '@/shared/api';
